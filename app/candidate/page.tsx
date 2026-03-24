"use client";

import { useEffect, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Info, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SignInButton } from "@clerk/nextjs";

export default function CandidateDashboard() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<{ technical: string[]; soft: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  async function fetchUserInfo() {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setUserInfo(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (userInfo && userInfo.usage >= userInfo.limit) {
      setError(userInfo.isGuest ? "Guest limit reached. Please sign in." : "Daily upload limit reached.");
      return;
    }

    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setExtractedSkills(data.skills);
        fetchUserInfo(); // Refresh usage
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (error) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Candidate Dashboard</h1>
            <p className="text-slate-600">Verify your skills and get AI-powered insights.</p>
            {userInfo?.subscription === "ENTERPRISE" && userInfo.rank && (
              <Badge variant="amber" className="mt-2 flex gap-1 w-fit">
                <Trophy className="w-3 h-3" />
                Rank #{userInfo.rank}
              </Badge>
            )}
          </div>
          {userInfo && (
            <Badge variant={userInfo.usage < userInfo.limit ? "green" : "red"} className="flex gap-1 py-1 px-3">
              {userInfo.limit - userInfo.usage} Uploads Left Today
            </Badge>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            {userInfo?.isGuest && userInfo.usage >= userInfo.limit && (
              <SignInButton>
                <Button variant="outline" size="sm" className="ml-auto bg-white">Sign In</Button>
              </SignInButton>
            )}
          </div>
        )}

        {!userInfo?.showScores && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Your manager has restricted score visibility. You can still see extracted skills and take tests.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept=".pdf"
                  disabled={uploading || (userInfo?.usage >= userInfo?.limit)}
                />
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
                <p className="text-slate-600 font-medium">
                  {file ? file.name : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-slate-400 mt-2">PDF (Max 5MB)</p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || uploading || (userInfo?.usage >= userInfo?.limit)}
                className="w-full mt-6 py-6 rounded-2xl"
              >
                {uploading ? <Loader2 className="animate-spin mr-2" /> : null}
                {uploading ? "Analyzing with AI..." : "Start Verification"}
              </Button>
            </CardContent>
          </Card>

          {/* Extracted Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Extracted Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {extractedSkills ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.technical.map((skill) => (
                        <Badge key={skill} variant="blue">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.soft.map((skill) => (
                        <Badge key={skill} variant="green">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full mt-4 py-6 rounded-2xl">
                    Generate My Test
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>Upload your resume to see extracted skills</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
