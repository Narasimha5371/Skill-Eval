"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<{ technical: string[]; soft: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setExtractedSkills(data.skills);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.firstName || "Candidate"}</h1>
          <p className="text-slate-600">Upload your resume to verify your skills with AI.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Resume
            </h2>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.docx"
              />
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                {file ? file.name : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-slate-400 mt-2">PDF or DOCX (Max 5MB)</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold transition-all ${
                !file || uploading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
            >
              {uploading ? "Analyzing with AI..." : "Start Verification"}
            </button>
          </div>

          {/* Extracted Skills Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Extracted Skills
            </h2>
            
            {extractedSkills ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.technical.map((skill) => (
                      <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.soft.map((skill) => (
                      <span key={skill} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full mt-4 py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all">
                  Generate My Test
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>Upload your resume to see extracted skills</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
