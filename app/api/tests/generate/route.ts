import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (e) {
      console.log("Auth failed, falling back to guest mode");
    }

    const body = await req.json();
    const { resumeId } = body;
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    // 1. Fetch extracted skills for the candidate
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { skills: true },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const techSkills = resume.skills.filter((s: { category: string; name: string }) => s.category === "TECHNICAL").map((s: { name: string }) => s.name);
    const softSkills = resume.skills.filter((s: { category: string; name: string }) => s.category === "SOFT_SKILL").map((s: { name: string }) => s.name);

    // 2. Call Groq to generate dynamic test questions
    const prompt = `Based on the following skills, generate a 5-question technical assessment:
    Technical Skills: ${techSkills.join(", ")}
    Soft Skills: ${softSkills.join(", ")}

    Structure:
    - 1 Coding Challenge (type: CODING) related to the top technical skill. Provide a prompt and an expected function signature.
    - 2 Multiple Choice Questions (type: MULTIPLE_CHOICE) for technical depth.
    - 2 Short Answer/Scenario Questions (type: SHORT_ANSWER) for soft skills.

    Return ONLY a valid JSON array of objects with the keys: 
    "skillName", "type" (one of: CODING, MULTIPLE_CHOICE, SHORT_ANSWER), "prompt", "options" (null for CODING/SHORT_ANSWER, array of 4 strings for MCQs), "expectedAnswer" (a brief rubric or the correct option index).`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer. Generate relevant, high-quality test questions. Return JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content || '{"questions": []}';
    const { questions } = JSON.parse(responseContent);

    // 3. Save the new test to the DB
    const test = await prisma.test.create({
      data: {
        userId: resume.userId,
        status: "PENDING",
        questions: {
          create: questions.map((q: { skillName: string; type: any; prompt: string; options: any; expectedAnswer: string }) => ({
            skillName: q.skillName,
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            expectedAnswer: q.expectedAnswer,
          })),
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      testId: test.id 
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate test";
    console.error("Test generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
