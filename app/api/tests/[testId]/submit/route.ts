import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";

export async function POST(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params;
    try {
      await auth();
    } catch (e) {
      console.log("Auth failed, falling back to guest mode");
    }

    const { answers } = await req.json(); // Map of questionId -> userAnswer

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    let totalScore = 0;
    const gradedQuestions = [];

    for (const question of test.questions) {
      const userAnswer = answers[question.id] || "";
      let score = 0;
      let feedback = "";

      if (question.type === "MULTIPLE_CHOICE") {
        score = userAnswer === question.expectedAnswer ? 100 : 0;
        feedback = score === 100 ? "Correct answer." : `Incorrect. Expected ${question.expectedAnswer}.`;
      } else {
        // Use Groq to grade Coding and Short Answer questions
        const gradingPrompt = `
          Question: ${question.prompt}
          Expected/Rubric: ${question.expectedAnswer}
          Candidate Answer: ${userAnswer}

          Grade this answer on a scale of 0-100. 
          For coding, check logic and syntax. 
          For short answer, check for key concepts.

          Return ONLY a JSON object: { "score": number, "feedback": "string" }
        `;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: gradingPrompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"score": 0, "feedback": "Error grading"}');
        score = result.score;
        feedback = result.feedback;
      }

      gradedQuestions.push({
        id: question.id,
        userAnswer,
        score,
        feedback,
      });
      totalScore += score;
    }

    const finalScore = totalScore / test.questions.length;

    // --- NEW: Generate Creativity Analysis ---
    let creativityAnalysis = "";
    try {
      const summaryPrompt = `
        Candidate's answers to the assessment:
        ${gradedQuestions.map(q => `Question: ${q.id}, Answer: ${q.userAnswer}`).join("\n")}

        Based on these answers, provide a 2-sentence professional analysis of the candidate's "problem-solving style" and "creativity." 
        Did they use elegant logic? Did they show outside-the-box thinking in their scenario answers?
        
        Return ONLY the analysis text.
      `;
      const summaryCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: summaryPrompt }],
        model: "llama-3.3-70b-versatile",
      });
      creativityAnalysis = summaryCompletion.choices[0].message.content || "Standard problem-solving approach.";
    } catch (e) {
      console.error("Creativity analysis error:", e);
    }
    // --- END ---

    // Update DB
    await prisma.$transaction([
      ...gradedQuestions.map((q) =>
        prisma.question.update({
          where: { id: q.id },
          data: { 
            userAnswer: q.userAnswer, 
            score: q.score, 
            feedback: q.feedback 
          },
        })
      ),
      prisma.test.update({
        where: { id: testId },
        data: {
          status: "COMPLETED",
          totalScore: finalScore,
          creativityAnalysis: creativityAnalysis,
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, finalScore });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit test";
    console.error("Submission error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
