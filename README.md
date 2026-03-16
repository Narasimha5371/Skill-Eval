<<<<<<< HEAD
# Skill-Eval
=======
# 🚀 Autotest AI: Automated Skill Verification Platform

**Autotest AI** is a cutting-edge, AI-powered recruitment platform designed to transform how companies assess technical and soft skills. By leveraging high-speed LLM inference via the **Groq API**, the platform automates the entire verification process—from resume parsing to interactive coding assessments and detailed manager reporting.

---

## 🌟 Key Features

### 📄 1. AI-Driven Candidate Onboarding
*   **Intelligent Resume Parsing**: Candidates upload PDF/DOCX resumes, and the system uses **Llama 3 (70B)** to extract structured technical skills, programming languages, and core soft skills.
*   **Instant Skill Profiling**: Extracted skills are automatically categorized (Technical vs. Soft) and saved to a PostgreSQL database via Prisma ORM.

### 🧠 2. Dynamic Test Generation Engine
*   **Tailored Assessments**: The platform generates a unique test for every candidate based on their specific resume skills.
*   **Multi-Modal Questions**:
    *   **Coding Challenges**: Real-world logic problems related to the candidate's top technical skill.
    *   **Multiple Choice (MCQ)**: Deep-dive technical knowledge checks.
    *   **Soft-Skill Scenarios**: Short-answer questions that assess "outside-the-box" thinking and behavioral traits.

### 💻 3. Interactive Test Environment
*   **Monaco Code Editor**: Provides a VS-Code-like experience directly in the browser for coding challenges.
*   **Live Assessment UI**: A high-focus, distraction-free interface with navigation and type-specific input fields.

### 📈 4. Automated Grading & Talent Insights
*   **LLM-Driven Scoring**: Coding and short-answer questions are graded by the AI against a dynamic rubric, providing instant feedback and weighted scores.
*   **Creativity Analysis**: The AI analyzes the *style* of the candidate's problem-solving, highlighting elegant logic or innovative approaches.
*   **Top Performer Spotlight**: A premium manager dashboard that highlights the highest scorer and their unique "Creativity & Problem Solving" profile.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15 (App Router), Tailwind CSS |
| **Backend** | Next.js Server Components & API Routes |
| **Database** | PostgreSQL, Prisma ORM |
| **AI Inference** | Groq SDK (Llama 3 70B & 8B) |
| **Authentication** | Clerk (Enterprise-grade Auth) |
| **Icons & UI** | Lucide React, Monaco Editor |

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+ installed.
*   A PostgreSQL database (e.g., Supabase or Vercel Postgres).
*   A Groq API Key ([Get it here](https://console.groq.com/)).
*   A Clerk account for authentication ([Get it here](https://dashboard.clerk.com/)).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/autotest-ai.git
    cd autotest-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add the following keys:
    ```env
    # Database
    DATABASE_URL="your-postgresql-connection-string"

    # AI (Groq)
    GROQ_API_KEY="your-groq-api-key"

    # Authentication (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
    CLERK_SECRET_KEY="your-clerk-secret-key"
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/candidate
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/candidate
    ```

4.  **Database Migration**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the application**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
app/
├── api/             # Serverless API routes (Resumes, Tests, Grading)
├── candidate/       # Candidate dashboard & resume upload UI
├── manager/         # Manager dashboard & top-performer spotlight
├── tests/           # Interactive assessment execution environment
lib/
├── prisma.ts        # Database client initialization
└── groq.ts          # AI (Groq SDK) configuration
prisma/
└── schema.prisma    # Relational DB models (Users, Resumes, Tests, Questions)
```

---

## 🤝 Contributing
Contributions are welcome! If you have ideas for new features (like video interview support or multi-language code execution), feel free to open an issue or submit a pull request.

---

## 📄 License
This project is licensed under the MIT License.

---
*Developed by Gemini CLI - Expert AI Architect*
>>>>>>> b3fc3869 (initial commit)
