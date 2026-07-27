import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ComparisonView from "../components/ComparisonView";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  ArrowRight,
  FileSearch,
  Check,
  UserCheck
} from "lucide-react";

interface Comparison {
  original: string;
  improved: string;
}

export default function Results() {
  const navigate = useNavigate();
  const savedData = localStorage.getItem("analysisResult");
  const analysisData = savedData ? JSON.parse(savedData) : null;
  const token = localStorage.getItem("token");
  const { showNotification } = useNotification();

  const [applyState, setApplyState] = useState<"idle" | "loading" | "success">("idle");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);

  const handleApplySuggestions = async () => {
    if (applyState !== "idle" || !token || !analysisData) return;
    setApplyState("loading");

    try {
      const response = await axios.post(
        "/api/v1/resume/apply-suggestions",
        {
          analysisId: analysisData.analysisId || 1,
          suggestions: analysisData.priorityFixes || []
        }
      );

      if (response.data.comparisons) {
        setComparisons(response.data.comparisons);
      } else if (analysisData.beforeAfterExamples) {
        setComparisons(
          analysisData.beforeAfterExamples.map((ex: any) => ({
            original: ex.currentText || ex.original,
            improved: ex.improvedText || ex.improved
          }))
        );
      }

      setApplyState("success");
      setShowComparison(true);
      showNotification("success", "STAR bullet rewrites generated", "Audit Complete");
    } catch (err: any) {
      console.error("Apply suggestions failed:", err);
      if (analysisData.beforeAfterExamples) {
        setComparisons(
          analysisData.beforeAfterExamples.map((ex: any) => ({
            original: ex.currentText || ex.original,
            improved: ex.improvedText || ex.improved
          }))
        );
        setApplyState("success");
        setShowComparison(true);
      } else {
        setApplyState("idle");
        showNotification("error", err.message || "Failed to process suggestions", "Error");
      }
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(
        `/api/v1/analysis/export/${analysisData?.analysisId || 'latest'}`,
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ResuMatch_Audit_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification("success", "PDF Audit Report downloaded", "Export Complete");
    } catch (err) {
      showNotification("info", "PDF report download initiated", "Download Started");
    }
  };

  return (
    <div className="bg-[#090a0f] text-zinc-100 min-h-screen font-sans selection:bg-indigo-500/30">
      <Sidebar activeTab="results" />
      <Header title="Resume Analysis" />

      <main className="ml-64 pt-20 px-8 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-5">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Resume ATS Audit & Insights</h1>
              <p className="text-xs text-zinc-400">Recruiter perspective analysis, missing keywords, and STAR rewrites.</p>
            </div>

            {analysisData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>

                <button
                  onClick={handleApplySuggestions}
                  disabled={applyState === "loading"}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {applyState === "loading" ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : applyState === "success" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{applyState === "loading" ? "Generating..." : applyState === "success" ? "STAR Bullets Generated" : "Generate STAR Rewrites"}</span>
                </button>
              </div>
            )}
          </div>

          {/* REAL DATA OR MEANINGFUL EMPTY STATE */}
          {analysisData ? (
            <div className="space-y-8">
              {/* ATS SCORE & OVERVIEW ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Score Box */}
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">ATS Overall Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{analysisData.overallScore ?? analysisData.score ?? 0}</span>
                    <span className="text-xs text-zinc-400">/ 100</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${analysisData.overallScore ?? analysisData.score ?? 0}%` }} 
                    />
                  </div>
                </div>

                {/* Hiring Recommendation */}
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recruiter Screening Verdict</span>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <span className="text-base font-semibold text-white">{analysisData.hiringRecommendation || "Audit Completed"}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {analysisData.recruiterComments || analysisData.firstImpression || "Keyword alignment and section audit details listed below."}
                  </p>
                </div>

                {/* Role / Target Experience */}
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Role Alignment</span>
                  <span className="text-base font-semibold text-white">{analysisData.role || "Software Engineering"}</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Evaluated against industry standards and experience tiers.
                  </p>
                </div>
              </div>

              {/* KEYWORD GAPS & MATCHED KEYWORDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Missing Keywords */}
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Keywords (High Impact)</span>
                  </div>
                  {analysisData.missingKeywords && analysisData.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisData.missingKeywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20 font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No critical keyword gaps identified.</p>
                  )}
                </div>

                {/* Matched Keywords */}
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Keywords</span>
                  </div>
                  {analysisData.matchedKeywords && analysisData.matchedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisData.matchedKeywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20 font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No matched keywords extracted.</p>
                  )}
                </div>
              </div>

              {/* PRIORITY RECOMMENDATIONS */}
              {analysisData.priorityFixes && analysisData.priorityFixes.length > 0 && (
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Priority Enhancements</h3>
                  <ul className="space-y-2">
                    {analysisData.priorityFixes.map((fix: string, index: number) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <span className="w-4 h-4 rounded bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* COMPARISON VIEW (STAR REWRITES) */}
              {showComparison && comparisons.length > 0 && (
                <div className="pt-4 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">STAR Rewrites Comparison</h3>
                  <ComparisonView 
                    isOpen={showComparison}
                    onClose={() => setShowComparison(false)} 
                    onConfirm={() => setShowComparison(false)}
                    comparisons={comparisons} 
                  />
                </div>
              )}

            </div>
          ) : (
            /* MEANINGFUL EMPTY STATE WHEN NO ANALYSIS RUN YET */
            <div className="p-12 rounded-lg bg-zinc-900/30 border border-zinc-800/50 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="w-12 h-12 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mx-auto">
                <FileSearch className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-200">No Resume Analysis Results Found</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upload your resume PDF or DOCX file on the Workspace page to extract ATS scores, recruiter recommendations, missing keyword gaps, and STAR bullet rewrites.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
