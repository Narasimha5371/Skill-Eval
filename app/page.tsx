import Link from "next/link";
import { Zap, ShieldCheck, BarChart3, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            Next-Gen Skill Verification
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Hire with <span className="text-blue-600">Certainty</span>, <br />
            Powered by AI.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
            Stop guessing. Autotest AI uses Llama 3 to parse resumes, generate custom tests, and verify technical skills in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/candidate">
              <Button size="lg" className="h-14 px-8 rounded-2xl group">
                Try as Candidate
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/manager">
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl bg-white">
                Manager Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verified Skills</h3>
              <p className="text-slate-600">Go beyond self-reported skills. Our AI verifies expertise through dynamic, multi-modal assessments.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Real-time Grading</h3>
              <p className="text-slate-600">Instant feedback for candidates and deep-dive scorecards for managers, powered by Groq Llama 3.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Talent Analytics</h3>
              <p className="text-slate-600">Identify top performers and analyze their problem-solving creativity with automated AI analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl bg-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <h2 className="text-4xl font-bold mb-6">Ready to transform your hiring?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join the future of recruitment and start verifying skills automatically today.</p>
          <Link href="/candidate">
            <Button variant="primary" size="lg" className="h-14 px-10 rounded-2xl">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
