import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      // Guest info
      const guestUsage = await prisma.guestUsage.findUnique({
        where: { ip },
      });
      return NextResponse.json({
        isGuest: true,
        usage: guestUsage?.count || 0,
        limit: 3,
        showScores: true,
      });
    }

    // Try to find user by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: { manager: true },
    });

    if (!user) {
      // If not found, check if they were invited by email
      // We need their email from Clerk. For now, let's assume we can't get it easily without a Clerk client
      // but in a real app we'd get it from clerkClient.users.getUser(clerkId)
      // For this MVP, we'll create a new user if not found.
      user = await prisma.user.create({
        data: {
          clerkId,
          role: "CANDIDATE",
          subscription: "FREE",
        },
        include: { manager: true },
      });
    }

    // Determine limits based on tier
    let dailyLimit = 0;
    switch (user.subscription) {
      case "CANDIDATE": dailyLimit = 30; break;
      case "MANAGER_CANDIDATE":
      case "ENTERPRISE": dailyLimit = 10; break;
      default: dailyLimit = 1; break;
    }

    return NextResponse.json({
      isGuest: false,
      usage: user.dailyUploadCount,
      limit: dailyLimit,
      subscription: user.subscription,
      showScores: user.manager ? user.manager.showScoresToCandidate : true,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
  }
}
