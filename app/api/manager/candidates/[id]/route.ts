import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        resumes: {
          include: {
            skills: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        tests: {
          include: {
            questions: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch candidate details" }, { status: 500 });
  }
}
