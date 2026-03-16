"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, FileText, CheckCircle2, ChevronRight, Search, Filter, Loader2 } from "lucide-react";

export default function ManagerDashboard() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch("/api/manager/candidates");
        const data = await res.json();
        setCandidates(data.candidates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- NEW: Find Top Scorer ---
  const topScorer = candidates
    .filter(c => c.tests?.[0]?.status === "COMPLETED")
    .reduce((prev, current) => 
      (prev.tests[0].totalScore > current.tests[0].totalScore) ? prev : current, 
      null as any
    );
  // --- END ---

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manager Dashboard</h1>
            <p className="text-slate-600">Review candidate skills and verification results.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </header>

        {/* Top Performer Spotlight */}
        {topScorer && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />
            
            <div className="relative z-10 text-center md:text-left">
              <span className="inline-block bg-blue-400/30 text-blue-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-4 border border-blue-400/50">
                ⭐ TOP PERFORMER
              </span>
              <h2 className="text-4xl font-black mb-2 leading-none">
                {topScorer.name || "Unnamed"}
              </h2>
              <p className="text-blue-100 text-lg mb-4 opacity-80">
                Scored an impressive <span className="text-white font-bold">{Math.round(topScorer.tests[0].totalScore)}%</span>
              </p>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl max-w-xl">
                <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Creativity & Problem Solving</h3>
                <p className="text-sm italic leading-relaxed text-blue-50">
                  "{topScorer.tests[0].creativityAnalysis || "Demonstrated exceptional logical flow and innovative solutions across all assessment modules."}"
                </p>
              </div>
            </div>

            <div className="relative z-10 ml-auto bg-white/20 p-8 rounded-full border border-white/30 backdrop-blur-sm">
               <div className="text-5xl font-black">{Math.round(topScorer.tests[0].totalScore)}<span className="text-2xl opacity-70">%</span></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Found</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((candidate) => {
                const latestResume = candidate.resumes?.[0];
                const latestTest = candidate.tests?.[0];
                const technicalSkills = latestResume?.skills?.filter((s: any) => s.category === "TECHNICAL").slice(0, 3);
                
                return (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {candidate.name?.[0] || candidate.email?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{candidate.name || "Unnamed Candidate"}</p>
                          <p className="text-xs text-slate-500">{candidate.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {technicalSkills?.map((skill: any) => (
                          <span key={skill.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            {skill.name}
                          </span>
                        ))}
                        {(latestResume?.skills?.length > 3) && (
                          <span className="text-[10px] text-slate-400">+{latestResume.skills.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        latestTest?.status === "COMPLETED" 
                          ? "bg-green-50 text-green-700 border-green-200"
                          : latestTest?.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {latestTest?.status || "NOT STARTED"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {latestTest?.status === "COMPLETED" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 flex-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                latestTest.totalScore >= 70 ? "bg-green-500" : latestTest.totalScore >= 40 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${latestTest.totalScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900">{Math.round(latestTest.totalScore)}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/manager/candidates/${candidate.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm hover:underline"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCandidates.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-semibold">No candidates found</h3>
              <p className="text-slate-500 text-sm">Waiting for candidates to upload resumes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
