import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params;
    try {
      await auth();
    } catch (e) {
      console.log("Auth failed, falling back to guest mode");
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { 
        questions: {
          select: {
            id: true,
            prompt: true,
            type: true,
            options: true,
            skillName: true,
            userAnswer: true,
          }
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ test });

  } catch (error) {
    console.error("Failed to fetch test:", error);
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 });
  }
}
