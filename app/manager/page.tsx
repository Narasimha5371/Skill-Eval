"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, FileText, CheckCircle2, ChevronRight, Search, Filter, Loader2, Sparkles, UserPlus, Eye, EyeOff, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Candidate {
  id: string;
  name?: string;
  email?: string;
  resumes: any[];
  tests: any[];
  rank?: number;
  totalInRank?: number;
}

export default function ManagerDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScoresToCandidate, setShowScoresToCandidate] = useState(true);
  const [subscription, setSubscription] = useState("FREE");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/manager/candidates");
      const data = await res.json();
      setCandidates(data.candidates || []);
      setShowScoresToCandidate(data.showScoresToCandidate);
      setSubscription(data.subscription);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleScoreVisibility = async () => {
    try {
      const newValue = !showScoresToCandidate;
      await fetch("/api/manager/candidates", {
        method: "PATCH",
        body: JSON.stringify({ showScoresToCandidate: newValue }),
      });
      setShowScoresToCandidate(newValue);
    } catch (err) {
      console.error(err);
    }
  };

  const inviteCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch("/api/manager/candidates", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      if (res.ok) {
        setInviteEmail("");
        setInviteName("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const safeCandidates = Array.isArray(candidates) ? candidates : [];

  const filteredCandidates = safeCandidates.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term)
    );
  });

  const topScorer = safeCandidates
    .filter((c) => c.tests?.[0]?.status === "COMPLETED")
    .reduce((prev: Candidate | null, current: Candidate) => {
      if (!prev) return current;
      const prevScore = prev.tests?.[0]?.totalScore ?? -Infinity;
      const currScore = current.tests?.[0]?.totalScore ?? -Infinity;
      return prevScore > currScore ? prev : current;
    }, null as Candidate | null);

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manager Dashboard</h1>
            <p className="text-slate-600">Review candidate skills and verification results.</p>
            <Badge variant="blue" className="mt-2">{subscription} TIER</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              onClick={toggleScoreVisibility}
              className="rounded-xl gap-2"
            >
              {showScoresToCandidate ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showScoresToCandidate ? "Scores Visible" : "Scores Hidden"}
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Invite Candidate Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Invite New Candidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={inviteCandidate} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Candidate Name" 
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="email" 
                placeholder="Candidate Email" 
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" disabled={inviting} className="rounded-xl">
                {inviting ? "Inviting..." : "Add Candidate"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Top Performer Spotlight */}
        {topScorer && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            
            <div className="relative z-10 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-400/30 text-blue-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-blue-400/50 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                TOP PERFORMER
              </div>
              <h2 className="text-4xl font-black mb-2 leading-none">
                {topScorer.name || "Unnamed"}
              </h2>
                <p className="text-blue-100 text-lg mb-6 opacity-80">
                Scored an impressive <span className="text-white font-bold">{Math.round(topScorer?.tests?.[0]?.totalScore ?? 0)}%</span>
              </p>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl max-w-xl">
                <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Creativity & Problem Solving</h3>
                <p className="text-sm italic leading-relaxed text-blue-50">
                  &quot;{topScorer?.tests?.[0]?.creativityAnalysis || "Demonstrated exceptional logical flow and innovative solutions across all assessment modules."}&quot;
                </p>
              </div>
            </div>

            <div className="relative z-10 bg-white/20 p-10 rounded-3xl border border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
               <div className="text-6xl font-black tracking-tighter">{Math.round(topScorer?.tests?.[0]?.totalScore ?? 0)}<span className="text-2xl opacity-70">%</span></div>
            </div>
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Found</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Score</th>
                  {subscription === "ENTERPRISE" && (
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                  )}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((candidate) => {
                  const latestResume = candidate.resumes?.[0];
                  const latestTest = candidate.tests?.[0];
                  const technicalSkills = latestResume?.skills
                    ? latestResume.skills.filter((s: any) => s.category === "TECHNICAL").slice(0, 3)
                    : [];
                  
                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                            {candidate.name?.[0] || candidate.email?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-none mb-1">{candidate.name || "Unnamed Candidate"}</p>
                            <p className="text-xs text-slate-500">{candidate.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                                    {technicalSkills?.map((skill: any) => (
                            <Badge key={skill.id} variant="slate" className="text-[10px] px-2 py-0">
                              {skill.name}
                            </Badge>
                          ))}
                                    {(latestResume?.skills?.length > 3) && (
                                      <span className="text-[10px] text-slate-400 font-medium">+{latestResume!.skills!.length - 3}</span>
                                    )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          latestTest?.status === "COMPLETED" ? "green" : 
                          latestTest?.status === "IN_PROGRESS" ? "amber" : "slate"
                        }>
                          {latestTest?.status || "NOT STARTED"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {latestTest?.status === "COMPLETED" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${
                                  (latestTest?.totalScore ?? 0) >= 70 ? "bg-green-500" : (latestTest?.totalScore ?? 0) >= 40 ? "bg-amber-500" : "bg-red-500"
                                }`}
                                style={{ width: `${latestTest?.totalScore ?? 0}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{Math.round(latestTest?.totalScore ?? 0)}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs font-medium">No results</span>
                        )}
                      </td>
                      {subscription === "ENTERPRISE" && (
                        <td className="px-6 py-4">
                          {candidate.rank ? (
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <Trophy className="w-3 h-3" />
                              #{candidate.rank}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <Link href={`/manager/candidates/${candidate.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 rounded-xl">
                            Details <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredCandidates.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No candidates found</h3>
              <p className="text-slate-500">Wait for candidates to upload resumes or try a different search.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
