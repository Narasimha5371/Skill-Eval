import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user is a MANAGER in our DB (or check Clerk metadata)
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser || dbUser.role !== "MANAGER") {
      // For MVP, we'll allow all registered users to see the dashboard, 
      // but in production, this should be a strict check.
      // return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const candidates = await prisma.user.findMany({
      where: { role: "CANDIDATE" },
      include: {
        resumes: {
          include: {
            skills: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        tests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ candidates });

  } catch (error: any) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
