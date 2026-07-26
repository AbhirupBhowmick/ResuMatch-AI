import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  FileSearch, 
  Target, 
  FileText, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  BarChart3
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TierLimitModal from "../components/TierLimitModal";
import { useNotification } from "../context/NotificationContext";

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
        await axios.get("/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
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
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      localStorage.setItem("analysisResult", JSON.stringify(response.data));
      localStorage.setItem("extractedText", response.data.extractedText || "");
      
      const newHistoryItem = { 
        id: Date.now(), 
        name: selectedFile.name, 
        role: response.data.role || "Software Engineering",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        score: response.data.overallScore || response.data.score || 85
      };
      const existingHistory = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
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

  const history = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
  const latestAnalysis = JSON.parse(localStorage.getItem("analysisResult") || "null");

  const latestScore = latestAnalysis ? (latestAnalysis.overallScore || latestAnalysis.score || 88) : (history.length > 0 ? history[0].score : 85);
  const totalAudits = history.length;

  return (
    <div className="bg-[#0b0f17] text-zinc-100 min-h-screen font-sans selection:bg-indigo-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 pt-12 px-8 pb-16 min-h-screen">
        {/* Hidden File Input for Instant Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileSelect} 
          accept=".pdf,.doc,.docx" 
          className="hidden" 
        />

        {activeTab === "dashboard" ? (
          <div className="max-w-6xl mx-auto space-y-10">
            {/* HERO SECTION */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#141b2d] to-[#0e1424] border border-white/10 p-8 md:p-10 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-Powered Executive Career Platform</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    AI Career Workspace
                  </h1>
                  <p className="text-zinc-400 text-base leading-relaxed">
                    Optimize your resume, match jobs, and generate tailored applications using AI.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button 
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{loading ? "Analyzing Engine..." : "Upload Resume"}</span>
                  </button>

                  <button 
                    onClick={() => navigate("/job-match")}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-medium text-sm transition-all cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>Paste Job Description</span>
                  </button>
                </div>
              </div>
            </motion.section>

            {/* QUICK ACTIONS BENTO GRID */}
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Action 1: Resume Analysis */}
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="group relative rounded-xl bg-[#121827] border border-white/10 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-200 shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">Resume Analysis</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Analyze ATS score, recruiter insights, bullet impact & STAR rewrites.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 flex items-center gap-2 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>Start Resume Scan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                {/* Action 2: Job Match */}
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="group relative rounded-xl bg-[#121827] border border-white/10 p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-200 shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">Job Match</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Compare resume vs JD, identify missing keywords & match score.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate("/job-match")}
                    className="mt-6 flex items-center gap-2 text-xs font-medium text-purple-400 group-hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <span>Match Job Description</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                {/* Action 3: Cover Letter */}
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="group relative rounded-xl bg-[#121827] border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-200 shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">Cover Letter</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Generate high-converting, recruiter-grade tailored cover letters.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate("/cover-letter")}
                    className="mt-6 flex items-center gap-2 text-xs font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span>Generate Cover Letter</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </div>
            </section>

            {/* STATISTICS CARDS */}
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Platform Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-[#121827] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>ATS Score</span>
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{latestScore}</span>
                    <span className="text-xs text-emerald-400 font-medium">+15 vs avg</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#121827] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Job Match %</span>
                    <Target className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">84%</span>
                    <span className="text-xs text-indigo-400 font-medium">High Match</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#121827] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Applications Generated</span>
                    <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{totalAudits + 2}</span>
                    <span className="text-xs text-zinc-400 font-medium">Total Docs</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#121827] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Last Updated</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">Today</span>
                    <span className="text-xs text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Recent Activity</h2>
                {history.length > 0 && (
                  <button 
                    onClick={() => setActiveTab("history")} 
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    View Full History
                  </button>
                )}
              </div>

              <div className="rounded-xl bg-[#121827] border border-white/10 overflow-hidden">
                {history.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {history.slice(0, 4).map((item: any, i: number) => (
                      <div key={item.id || i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <FileSearch className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white truncate max-w-xs">{item.name}</div>
                            <div className="text-xs text-zinc-400">{item.role || "Software Engineering"} • {item.date}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ATS: {item.score}
                            </span>
                          </div>
                          <button 
                            onClick={() => navigate("/results")}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-zinc-400 mx-auto" />
                    <div className="text-sm text-zinc-300 font-medium">No recent audits yet</div>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Upload your resume or perform a job match scan to see your activity history here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* HISTORY TAB */
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Audit History</h2>
              <button 
                onClick={() => {
                  localStorage.removeItem("resumeHistory");
                  window.location.reload();
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                Clear All History
              </button>
            </div>

            <div className="rounded-xl bg-[#121827] border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="px-6 py-4">Filename</th>
                    <th className="px-6 py-4">Target Role</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">ATS Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {history.map((item: any, i: number) => (
                    <tr key={item.id || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-[250px] truncate">{item.name}</td>
                      <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate">{item.role || "Software Engineering"}</td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">{item.date}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {history.length === 0 && (
                <div className="p-16 text-center text-zinc-400 text-sm">
                  No history recorded yet. Upload a resume to get started!
                </div>
              )}
            </div>
          </div>
        )}

        <TierLimitModal 
          isOpen={showLimitModal} 
          onClose={() => setShowLimitModal(false)} 
          message={limitMessage} 
        />
      </main>
    </div>
  );
}
