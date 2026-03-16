import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const test = await prisma.test.findUnique({
      where: { id: params.testId },
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

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 });
  }
}
