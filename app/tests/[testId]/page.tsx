"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Timer, Send, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

export default function AssessmentExecution() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTest() {
      const res = await fetch(`/api/tests/${params.testId}`);
      const data = await res.json();
      setTest(data.test);
      setLoading(false);
    }
    fetchTest();
  }, [params.testId]);

  const handleAnswerChange = (val: string) => {
    setAnswers({ ...answers, [test.questions[currentIdx].id]: val });
  };

  const handleNext = () => {
    if (currentIdx < test.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/tests/${params.testId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      router.push("/candidate/completed");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;

  const currentQuestion = test.questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded">LIVE TEST</span>
          <h1 className="text-sm font-medium text-slate-400">
            Question {currentIdx + 1} of {test.questions.length}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-amber-400">
            <Timer className="w-5 h-5" />
            <span className="font-mono font-bold">45:00</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
            Finish Test
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Prompt */}
        <div className="w-1/2 p-8 border-r border-slate-800 overflow-y-auto bg-slate-900">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{currentQuestion.skillName}</span>
            <h2 className="text-2xl font-bold mt-2 mb-6 leading-tight">{currentQuestion.prompt}</h2>

            {currentQuestion.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-3">
                {currentQuestion.options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerChange(idx.toString())}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      answers[currentQuestion.id] === idx.toString()
                        ? "bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "SHORT_ANSWER" && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-48 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            )}
          </div>
        </div>

        {/* Right: Code Editor (only for CODING type) */}
        <div className="w-1/2 bg-[#1e1e1e] flex flex-col">
          {currentQuestion.type === "CODING" ? (
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={answers[currentQuestion.id] || "// Type your code here\n"}
              onChange={(val) => handleAnswerChange(val || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                roundedSelection: false,
                padding: { top: 20 },
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-8 bg-slate-900/50">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 opacity-50" />
              </div>
              <p>No code editor needed for this question type.</p>
              <p className="text-sm">Submit your answer using the interface on the left.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-6 py-2 flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIdx === test.questions.length - 1}
          className="px-8 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-all"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
