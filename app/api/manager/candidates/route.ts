import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const manager = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!manager || manager.role !== "MANAGER") {
      return NextResponse.json({ error: "Access denied. Managers only." }, { status: 403 });
    }

    const candidates = await prisma.user.findMany({
      where: { managerId: manager.id },
      include: {
        resumes: {
          include: { skills: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        tests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate Rank if Enterprise
    let candidatesWithRank = candidates;
    if (manager.subscription === "ENTERPRISE") {
      const allCandidatesWithScores = candidates
        .filter(c => c.tests.length > 0 && c.tests[0].status === "COMPLETED")
        .sort((a, b) => (b.tests[0].totalScore || 0) - (a.tests[0].totalScore || 0));

      candidatesWithRank = candidates.map(c => {
        const rank = allCandidatesWithScores.findIndex(rc => rc.id === c.id) + 1;
        return {
          ...c,
          rank: rank > 0 ? rank : null,
          totalInRank: allCandidatesWithScores.length
        };
      });
    }

    return NextResponse.json({ 
      candidates: candidatesWithRank,
      showScoresToCandidate: manager.showScoresToCandidate,
      subscription: manager.subscription
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const manager = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!manager || manager.role !== "MANAGER") {
      return NextResponse.json({ error: "Access denied. Managers only." }, { status: 403 });
    }

    // Check limits
    const candidateCount = await prisma.user.count({
      where: { managerId: manager.id }
    });

    let maxCandidates = 0;
    if (manager.subscription === "MANAGER_CANDIDATE") {
      maxCandidates = 10000;
    } else if (manager.subscription === "ENTERPRISE") {
      maxCandidates = 50000;
    } else {
      return NextResponse.json({ error: "Subscription required to add candidates." }, { status: 403 });
    }

    if (candidateCount >= maxCandidates) {
      return NextResponse.json({ error: "Candidate limit reached for your subscription." }, { status: 403 });
    }

    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if candidate already exists
    let candidate = await prisma.user.findUnique({
      where: { email }
    });

    if (candidate) {
      if (candidate.managerId) {
        return NextResponse.json({ error: "Candidate is already managed by another account." }, { status: 400 });
      }
      // Link existing candidate to this manager
      candidate = await prisma.user.update({
        where: { id: candidate.id },
        data: { managerId: manager.id }
      });
    } else {
      // Create new candidate
      candidate = await prisma.user.create({
        data: {
          email,
          name,
          role: "CANDIDATE",
          managerId: manager.id,
          clerkId: `PENDING_${email}_${Date.now()}`, // Temporary clerkId until they sign in
          subscription: manager.subscription // Candidates inherit manager's tier for limit purposes
        }
      });
    }

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    console.error("Add candidate error:", error);
    return NextResponse.json({ error: "Failed to add candidate" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { showScoresToCandidate } = await req.json();

    await prisma.user.update({
      where: { clerkId },
      data: { showScoresToCandidate }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
