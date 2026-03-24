"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Trophy, ArrowRight, Loader2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function TestCompletedPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserInfo();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-lg shadow-green-100 animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-4">Assessment Completed!</h1>
      <p className="text-slate-600 mb-10 text-lg">Great job. Our AI is finalizing your detailed report.</p>

      {userInfo?.showScores ? (
        <Card className="mb-8 border-2 border-blue-100 bg-blue-50/30">
          <CardContent className="p-10">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Your Verification Score</h2>
            <div className="text-7xl font-black text-slate-900 mb-4 tracking-tighter">
              PENDING
            </div>
            <p className="text-slate-500 max-w-md mx-auto">
              Scores are typically finalized within a few minutes. Check your dashboard for the detailed breakdown.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-2 border-amber-100 bg-amber-50/30 p-10">
          <div className="flex flex-col items-center gap-4 text-amber-700">
            <EyeOff className="w-12 h-12" />
            <h2 className="text-xl font-bold">Scores Restricted</h2>
            <p className="text-sm">Your manager has restricted score visibility. Your results have been sent to your manager for review.</p>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/candidate">
          <Button size="lg" className="rounded-2xl h-14 px-10 group">
            Back to Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
