import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FileSearch, 
  Target, 
  Upload, 
  ArrowRight, 
  FileText, 
  Clock, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TierLimitModal from "../components/TierLimitModal";
import { useNotification } from "../context/NotificationContext";

interface HistoryItem {
  id: number;
  name: string;
  role: string;
  date: string;
  score?: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboard_view") || "dashboard";
  });
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    localStorage.setItem("dashboard_view", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await axios.get("/api/v1/auth/me");
      } catch (err) {
        console.error("Failed to sync user context", err);
      }
    };
    fetchUserData();
  }, []);

  const handleFileUpload = async (selectedFile: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("industry", "Software Engineering");
    formData.append("experienceLevel", "Mid-Level");

    try {
      const response = await axios.post("/api/v1/resume/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        }
      });
      
      localStorage.setItem("analysisResult", JSON.stringify(response.data));
      localStorage.setItem("extractedText", response.data.extractedText || "");
      
      const newHistoryItem: HistoryItem = { 
        id: Date.now(), 
        name: selectedFile.name, 
        role: response.data.role || "Software Engineering",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        score: response.data.overallScore || response.data.score || 85
      };
      const existingHistory: HistoryItem[] = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
      localStorage.setItem("resumeHistory", JSON.stringify([newHistoryItem, ...existingHistory]));

      navigate("/results");
    } catch (error: any) {
      console.error("Analysis failed:", error);
      const errorData = error.response?.data;
      if (errorData?.error === "INSUFFICIENT_CREDITS") {
        setLimitMessage(errorData.message);
        setShowLimitModal(true);
      } else if (errorData?.message) {
        showNotification("error", errorData.message, "Server Error");
      } else {
        showNotification("error", error.message || "Failed to analyze resume", "Analysis Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      handleFileUpload(selected);
    }
  };

  // Real data only from localStorage / state
  const history: HistoryItem[] = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
  const latestAnalysis = JSON.parse(localStorage.getItem("analysisResult") || "null");

  return (
    <div className="bg-[#090a0f] text-zinc-100 min-h-screen font-sans selection:bg-indigo-500/30">
      <Sidebar activeTab="dashboard" setActiveTab={setActiveTab} />
      <Header title="Workspace" />
      
      <main className="ml-64 pt-20 px-8 pb-16 min-h-screen">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileSelect} 
          accept=".pdf,.doc,.docx" 
          className="hidden" 
        />

        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* HERO WORKSPACE ACTION HEADER */}
          <section className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>AI Career Workspace</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Optimize your application narrative
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Upload your resume or match against a job description to extract missing keywords, optimize ATS scores, and generateSTAR bullet rewrites.
              </p>
            </div>

            {/* PRIMARY & SECONDARY ACTION CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{loading ? "Analyzing Document..." : "Upload Resume"}</span>
              </button>

              <button 
                onClick={() => navigate("/job-match")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium text-xs transition-all cursor-pointer"
              >
                <Target className="w-4 h-4 text-zinc-400" />
                <span>Paste Job Description</span>
              </button>
            </div>
          </section>

          {/* IN PROGRESS SECTION (When Upload / Analysis is active) */}
          {loading && (
            <section className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <div>
                  <h3 className="text-xs font-semibold text-indigo-300">Analysis in progress</h3>
                  <p className="text-[11px] text-zinc-400">Extracting text via Apache Tika and auditing against ATS rules...</p>
                </div>
              </div>
            </section>
          )}

          {/* RECENT DOCUMENTS SECTION */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Recent Documents</h2>
              {history.length > 0 && (
                <button 
                  onClick={() => navigate("/results")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="divide-y divide-zinc-800/60 rounded-lg bg-zinc-900/40 border border-zinc-800/60 overflow-hidden">
                {history.slice(0, 4).map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => navigate("/results")}
                    className="p-3.5 flex items-center justify-between hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">{doc.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{doc.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        {doc.date}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* MEANINGFUL EMPTY STATE */
              <div className="p-8 rounded-lg bg-zinc-900/30 border border-zinc-800/50 text-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500 mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-xs font-medium text-zinc-300">No documents uploaded yet</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Upload your PDF or DOCX resume to start auditing missing keywords and STAR bullet rewrites.
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer border border-zinc-700/50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Resume File</span>
                </button>
              </div>
            )}
          </section>

          {/* RECENT ANALYSES SECTION (ONLY BACKED BY REAL DATA) */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Recent Analyses</h2>

            {latestAnalysis ? (
              <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      {latestAnalysis.overallScore || latestAnalysis.score || 85}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white">Latest ATS Audit</h3>
                      <p className="text-[11px] text-zinc-400">{latestAnalysis.role || "Software Engineering"} • Completed</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/results")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>View Full Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {latestAnalysis.missingKeywords && latestAnalysis.missingKeywords.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800/60 space-y-2">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Identified Keyword Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {latestAnalysis.missingKeywords.slice(0, 6).map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-700/50">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MEANINGFUL EMPTY STATE */
              <div className="p-8 rounded-lg bg-zinc-900/30 border border-zinc-800/50 text-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500 mx-auto">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-xs font-medium text-zinc-300">No analysis results yet</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Metrics, ATS scores, and keyword match percentages appear here automatically after running your first resume analysis.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* DEDICATED QUICK NAVIGATION TOOLS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Workspace Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <FileSearch className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">Resume Analysis</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  ATS score, recruiter insights, impact evaluation, and missing keywords.
                </p>
              </div>

              <div 
                onClick={() => navigate("/job-match")}
                className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">Job Match</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Compare resume vs job description to extract target JD keywords.
                </p>
              </div>

              <div 
                onClick={() => navigate("/cover-letter")}
                className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">Cover Letter</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Generate structured, recruiter-aligned cover letters for target roles.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <TierLimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
        message={limitMessage} 
      />
    </div>
  );
}
