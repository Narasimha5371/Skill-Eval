# Autotest AI - Walkthrough

Autotest AI is a professional skill verification platform that uses LLMs (Groq API) to parse resumes, generate dynamic technical assessments, and provide deep-dive talent insights for hiring managers.

## 🚀 Features Implemented

### 1. AI-Powered Resume Parsing
- **Candidate Dashboard**: A clean, modern interface for uploading PDF resumes.
- **Skill Extraction**: Uses **Groq (Llama 3 70B)** to extract structured Technical and Soft skills directly from the resume text.
- **Automatic Profiling**: Saves skills and candidate info to a PostgreSQL database via Prisma.

### 2. Dynamic Assessment Engine
- **Test Generation**: Automatically creates a 5-question test (Coding + MCQs + Scenarios) tailored to the candidate's specific skills.
- **Interactive Environment**: A high-focus test UI featuring the **Monaco Code Editor** (VS-Code style) for technical challenges.
- **Automated Grading**: Instant grading of MCQs and AI-driven grading of code/short answers with feedback for every question.

### 3. Manager Insights & Spotlight
- **Talent Dashboard**: A centralized view for hiring managers to track all candidates and their AI-verified scores.
- **Top Performer Spotlight**: Automatically identifies the highest scorer and highlights their unique "Creativity & Problem Solving" style using AI analysis.
- **Detailed Scorecards**: Deep-dive results for every assessment.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15+, Tailwind CSS, Lucide React, Monaco Editor.
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL.
- **AI**: Groq SDK (Llama 3 70B & 8B models).
- **Auth**: Clerk (Enterprise-grade authentication).

## 🏁 How to Run
1.  **Install Dependencies**: `npm install`
2.  **Environment Setup**: Add `DATABASE_URL`, `GROQ_API_KEY`, and `CLERK` keys to `.env`.
3.  **Database Sync**: `npx prisma db push`
4.  **Start Dev Server**: `npm run dev`

---
*Developed by Gemini CLI - Expert AI Architect*
