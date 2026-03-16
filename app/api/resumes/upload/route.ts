import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Convert File to Buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);
    const rawText = data.text;

    // 2. Call Groq to extract skills
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert HR assistant. Extract technical and soft skills from the following resume text. Return ONLY a valid JSON object with the keys 'technical' (array of strings) and 'soft' (array of strings).",
        },
        {
          role: "user",
          content: rawText,
        },
      ],
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
    });

    const skillsJson = JSON.parse(completion.choices[0].message.content || "{}");

    // 3. Ensure User exists in our DB
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          role: "CANDIDATE",
        },
      });
    }

    // 4. Save Resume and Skills
    const resume = await prisma.resume.create({
      data: {
        userId: dbUser.id,
        fileUrl: "placeholder-url", // In a real app, upload to S3/Blob first
        rawText: rawText,
        skills: {
          create: [
            ...skillsJson.technical.map((name: string) => ({ name, category: "TECHNICAL" })),
            ...skillsJson.soft.map((name: string) => ({ name, category: "SOFT_SKILL" })),
          ],
        },
      },
      include: {
        skills: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      skills: skillsJson,
      resumeId: resume.id 
    });

  } catch (error: any) {
    console.error("Resume processing error:", error);
    return NextResponse.json({ error: error.message || "Failed to process resume" }, { status: 500 });
  }
}
