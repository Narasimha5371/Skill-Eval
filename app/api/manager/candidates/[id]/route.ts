import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try {
      await auth();
    } catch (e) {
      console.log("Auth failed, falling back to guest mode");
    }

    const candidate = await prisma.user.findUnique({
      where: { id: id },
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
  } catch (error) {
    console.error("Failed to fetch candidate details:", error);
    return NextResponse.json({ error: "Failed to fetch candidate details" }, { status: 500 });
  }
}
