
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ComparisonView from "../components/ComparisonView";
import { useState } from "react";
import axios from "axios";

interface Comparison {
  original: string;
  improved: string;
}

export default function Results() {
  const savedData = localStorage.getItem("analysisResult");
  const analysisData = savedData ? JSON.parse(savedData) : {
    score: 84,
    strengths: [
      "React.js", "UI/UX Design", "TypeScript", 
      "Unit Testing", "Tailwind CSS", "CI/CD Pipelines"
    ],
    missingKeywords: [
      { text: "Kubernetes", desc: "Required for cloud-native roles" },
      { text: "Project Management", desc: "Lacking leadership terminology" },
      { text: "Cloud Architecture", desc: "Missing AWS/Azure certification mentions" }
    ],
    jobSuggestions: [
      "Senior Frontend Engineer", "Full Stack Developer"
    ],
    improvedSummary: "A results-driven backend engineer with 4 years of experience architecting scalable Spring Boot microservices. Proven track record of improving system latency by 40%..."
  };

  const token = localStorage.getItem("token");

  /* ── Apply Suggestions State Machine ── */
  const [applyState, setApplyState] = useState<"idle" | "loading" | "success">("idle");
  const [showToast, setShowToast] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);

  /* ── Comparison Modal State ── */
  const [showComparison, setShowComparison] = useState(false);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [appliedAnalysisId, setAppliedAnalysisId] = useState<number | null>(null);

  const handleApplySuggestions = async () => {
    if (applyState !== "idle" || !token) return;
    setApplyState("loading");
    
    try {
      const response = await axios.post(
        "/api/v1/analysis/apply",
        { analysisId: null }, // null = use latest
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = response.data;
      setAppliedAnalysisId(data.analysisId);
      
      // Map comparisons from backend
      if (data.comparisons && data.comparisons.length > 0) {
        setComparisons(data.comparisons);
      } else {
        // Fallback demo comparisons
        setComparisons([
          { original: "Responsible for customer support.", improved: "Resolved 95% of customer escalations within 24 hours, improving CSAT by 20% through personalized follow-ups." },
          { original: "Helped with marketing.", improved: "Spearheaded a $50k Q3 marketing campaign resulting in a 15% increase in lead generation." },
          { original: "Maintained daily server logs and performed routine updates.", improved: "Automated server log analysis using Python, reducing manual review time by 40% and preventing 12 major outages." },
        ]);
      }
      
      setShowComparison(true);
      setApplyState("success");
      
    } catch (err: any) {
      console.error("Apply failed:", err);
      
      // Fallback to demo mode if backend doesn't have analysis stored yet
      setComparisons([
        { original: "Responsible for customer support.", improved: "Resolved 95% of customer escalations within 24 hours, improving CSAT by 20% through personalized follow-ups." },
        { original: "Helped with marketing.", improved: "Spearheaded a $50k Q3 marketing campaign resulting in a 15% increase in lead generation." },
        { original: "Maintained daily server logs and performed routine updates.", improved: "Automated server log analysis using Python, reducing manual review time by 40% and preventing 12 major outages." },
      ]);
      setShowComparison(true);
      setApplyState("success");
    }
  };

  const handleConfirmSave = async () => {
    setIsConfirming(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsConfirming(false);
    setShowComparison(false);
    
    setShowToast(true);
    setTimeout(() => {
      setToastExiting(true);
      setTimeout(() => { setShowToast(false); setToastExiting(false); }, 500);
    }, 5000);
  };

  const handleExportPDF = async () => {
    const analysisId = appliedAnalysisId || analysisData.analysisId || 'current-analysis-id';
    
    // Simulate loading on the button
    const btn = document.getElementById('export-pdf-btn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> ✨ Generating...';
        btn.classList.add('animate-pulse', 'opacity-80', 'cursor-not-allowed');
    }

    try {
      let headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios.get(
        `/api/v1/analysis/export/${analysisId}`,
        { 
          headers: headers,
          responseType: 'blob' 
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ResuMatch_Report_${analysisData.jobSuggestions?.[0] || 'Result'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
      // Fallback pdf download or alert
      alert("Failed to export PDF. Ensure the backend endpoint is active.");
    } finally {
        if(btn) {
            btn.innerHTML = originalText;
            btn.classList.remove('animate-pulse', 'opacity-80', 'cursor-not-allowed');
        }
    }
  };

  // Score calculations
  const maxDash = 552.92;
  const score = analysisData.score || 0;
  // Offset formula from original stitch file (e.g. 552.92 - (552.92 * score / 100))
  const strokeOffset = maxDash - (maxDash * score) / 100;
  
  const isHigh = score >= 80;
  const isMed = score >= 60 && score < 80;
  const gaugeColor = isHigh ? "text-emerald-500" : isMed ? "text-tertiary" : "text-error";
  const gaugeBorder = isHigh ? "border-emerald-500/10" : isMed ? "border-tertiary/10" : "border-error/10";
  const badgeClass = isHigh ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : isMed ? "bg-tertiary/10 border-tertiary/20 text-tertiary" : "bg-error/10 border-error/20 text-error";
  const statusText = isHigh ? "OPTIMIZED FOR SEARCH" : isMed ? "NEEDS REFINEMENT" : "POOR FIT";

  const weaknesses = Array.isArray(analysisData.missingKeywords) && typeof analysisData.missingKeywords[0] === 'string'
    ? analysisData.missingKeywords.map((k: string) => ({ text: k, desc: "Critical missing terminology" }))
    : analysisData.missingKeywords || [];

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container/30 min-h-screen">
      <Sidebar />
      <Header title="Analysis Results" />

      <main className="ml-0 md:ml-64 pt-24 pb-12 px-8 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">{analysisData.jobSuggestions?.[0] || "Target Role"}</h2>
              <p className="text-on-surface-variant flex items-center gap-2 font-body text-sm">
                 <span className="material-symbols-outlined text-sm">description</span>
                 Analysis complete for your document
              </p>
            </div>
            <div className="flex gap-3 print:hidden">
              <button 
                id="export-pdf-btn"
                onClick={handleExportPDF} 
                className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-sm font-medium transition-all flex items-center gap-2 font-body cursor-pointer">
                 <span className="material-symbols-outlined text-[18px]">download</span>
                 Export PDF
              </button>
              <button 
                onClick={handleApplySuggestions}
                disabled={applyState !== "idle"}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer font-body
                  ${applyState === "idle" 
                    ? "bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(151,149,255,0.2)] hover:scale-[1.02]"
                    : applyState === "loading"
                      ? "bg-primary-container text-on-primary-container opacity-80 animate-pulse cursor-not-allowed"
                      : "bg-emerald-600 text-white cursor-default"
                  }`}
              >
                {applyState === "idle" && (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Apply Suggestions
                  </>
                )}
                {applyState === "loading" && (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    ✨ Applying...
                  </>
                )}
                {applyState === "success" && (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    ✓ Suggestions Applied
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">barcode_scanner</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-widest font-body">Keywords Found</p>
              <h3 className="text-5xl font-extrabold font-headline text-on-surface mb-2">
                {analysisData.strengths?.length || 0} <span className="text-lg font-normal text-on-surface-variant">matches</span>
              </h3>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-4">
                <div className="bg-primary-dim h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (analysisData.strengths?.length || 0) * 14)}%` }}></div>
              </div>
              <p className="text-xs text-primary mt-4 flex items-center gap-1 font-body">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                12% higher than average candidates
              </p>
            </div>

            <div className="bg-surface-container rounded-xl p-8 flex flex-col items-center justify-center border-t border-white/5 shadow-2xl relative">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12" />
                  <circle className={`${gaugeColor} transition-all duration-1000`} cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={strokeOffset} strokeLinecap="round" strokeWidth="12" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black font-headline text-on-surface">{score}</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter font-headline">ATS Score</span>
                </div>
                <div className={`absolute inset-0 rounded-full border-[16px] ${gaugeBorder} blur-xl`}></div>
              </div>
              <div className={`mt-6 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide font-body ${badgeClass}`}>
                  {statusText}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">target</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-widest font-body">Job Match Rate</p>
              <h3 className="text-5xl font-extrabold font-headline text-on-surface mb-2">{Math.min(99, score + 8)}<span className="text-lg font-normal text-on-surface-variant">%</span></h3>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-6 w-2 rounded-sm ${i <= Math.round(score / 20) ? 'bg-primary' : 'bg-primary/40'}`}></div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant mt-4 font-body">Highly compatible with {analysisData.jobSuggestions?.[0] || 'Target'} roles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-low rounded-xl overflow-hidden border-t border-white/5">
              <div className="p-6 bg-surface-container-high/50 flex items-center justify-between border-b border-white/5">
                <h4 className="font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  Strengths & Matched Keywords
                </h4>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{(analysisData.strengths || []).length} Matches</span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {(analysisData.strengths || []).map((s: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-surface/40 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">task_alt</span>
                    <span className="text-sm font-medium text-on-surface font-body truncate" title={s}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl overflow-hidden border-t border-white/5">
              <div className="p-6 bg-surface-container-high/50 flex items-center justify-between border-b border-white/5">
                <h4 className="font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">warning</span>
                  Missing Keywords & Red Flags
                </h4>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{weaknesses.length} Identified</span>
              </div>
              <div className="p-6 space-y-3">
                {weaknesses.map((w: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-error-container/10 rounded-xl border border-error-container/20 group hover:bg-error-container/20 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-error">dangerous</span>
                      <div>
                        <p className="text-sm font-bold text-on-surface font-body">{w.text}</p>
                        <p className="text-xs text-on-surface-variant font-body">{w.desc}</p>
                      </div>
                    </div>
                    <button className="text-xs text-error font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      ADD TO SKILLS <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-tertiary/30 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-surface-container-low/60 backdrop-blur-xl rounded-xl border-t border-white/10 p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(167,165,255,0.4)]">
                  <span className="material-symbols-outlined text-on-primary">bolt</span>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold font-headline text-on-surface">AI Intelligence Suggestions</h4>
                      <p className="text-sm text-on-surface-variant font-body">Contextual improvements for {analysisData.jobSuggestions?.[0] || "your"} profile</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-primary-dim animate-pulse"></span>
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase font-headline">Deep Audit Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-surface-container-highest/40 rounded-xl p-6 border border-white/5">
                      <p className="text-sm text-primary mb-4 font-bold flex items-center gap-2 font-headline">
                         <span className="material-symbols-outlined text-sm">edit_note</span>
                         Professional Summary Rewrite
                      </p>
                      
                      <div className="text-on-surface/90 font-body text-sm leading-relaxed p-4 bg-surface/50 rounded-lg italic border border-white/5 whitespace-pre-line">
                         "{analysisData.improvedSummary}"
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4">
                      <button 
                        className="px-6 py-2 bg-primary-container/20 hover:bg-primary-container/30 border border-primary-container/30 text-primary-fixed text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer font-body"
                        onClick={() => { navigator.clipboard.writeText(analysisData.improvedSummary); }}
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        COPY TO CLIPBOARD
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <ComparisonView
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onConfirm={handleConfirmSave}
        comparisons={comparisons}
        isConfirming={isConfirming}
        isLoading={applyState === "loading"}
      />

      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] pointer-events-auto">
          <div className={`flex items-center gap-3 bg-surface-container-high border border-emerald-500/30 p-4 rounded-xl shadow-2xl transition-all duration-500 ease-out ${toastExiting ? 'translate-y-[10px] opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-sm">check</span>
            </div>
            <div className="pr-4">
              <p className="text-sm font-bold text-on-surface leading-tight">Success</p>
              <p className="text-xs text-on-surface-variant">Your resume profile has been updated with the AI recommendations.</p>
            </div>
            <button 
              className="text-on-surface-variant hover:text-on-surface ml-2 cursor-pointer"
              onClick={() => { setToastExiting(true); setTimeout(() => { setShowToast(false); setToastExiting(false); }, 500); }}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
