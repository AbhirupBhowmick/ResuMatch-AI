import { useState } from "react";
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
  Award, 
  Check,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface Comparison {
  original: string;
  improved: string;
}

export default function Results() {
  const savedData = localStorage.getItem("analysisResult");
  const analysisData = savedData ? JSON.parse(savedData) : {
    overallScore: 88,
    atsScore: 86,
    roleMatch: 90,
    executiveSummary: "Results-driven Senior Software Professional with a strong background in distributed systems, microservices architecture, and cloud infrastructure.",
    firstImpression: "Strong technical foundation present, clear section layout, but work history requires quantifiable STAR impact metrics.",
    hiringRecommendation: "Strong Hire",
    interviewProbability: 85,
    salaryReadiness: "$140,000 - $165,000",
    strengths: [
      "Microservices Architecture & REST API Design",
      "React, TypeScript & Modern State Management",
      "CI/CD Pipeline Automation & Testing Coverage",
      "Database Optimization & Caching Strategies",
      "Clean Code & SOLID Software Architecture"
    ],
    weaknesses: [
      "Work experience bullets lack quantified business outcome metrics",
      "Missing key cloud containerization terms (Docker, Kubernetes)",
      "Project descriptions do not state individual ownership vs team size",
      "ATS formatting vulnerabilities in table column alignment"
    ],
    missingKeywords: ["Docker", "Kubernetes", "GraphQL", "AWS Lambda", "Kafka", "Prometheus"],
    matchedKeywords: ["Java", "Spring Boot", "React", "TypeScript", "SQL", "Git"],
    priorityFixes: [
      "Incorporate STAR method metrics (X-Y-Z formula) into top 3 work experience bullets.",
      "Add missing containerization & cloud keywords to Skills section.",
      "Reformat table columns into single-column ATS readable lists.",
      "Quantify latency and system efficiency improvements in past engineering projects.",
      "Include certification or professional development highlights."
    ],
    recruiterComments: "Solid technical background. Candidate meets core engineering criteria for mid-senior roles. Re-writing experience bullets with metrics will significantly boost ATS screening success.",
    technicalInterviewerComments: "Demonstrates strong understanding of backend fundamentals. High potential for systems architecture interviews.",
    beforeAfterExamples: [
      {
        currentText: "Maintained daily server logs and performed routine backend updates.",
        improvedText: "Automated server log analysis using Python and Spring Boot, reducing manual incident review time by 40% and preventing 12 critical outages.",
        reason: "Applied STAR formula with quantifiable 40% latency reduction and outage prevention metrics.",
        category: "Impact Metrics"
      },
      {
        currentText: "Worked on customer support feature improvements.",
        improvedText: "Spearheaded user escalation workflow redesign, resolving 95% of support cases within 24 hours and boosting CSAT by 22%.",
        reason: "Transformed passive task description into high-impact business metric.",
        category: "STAR Method"
      }
    ],
    thirtyDayPlan: {
      immediateFixes: ["Update top 3 resume bullet points using STAR formula"],
      oneWeekPlan: ["Integrate missing keywords into skills & project sections"],
      twoWeekPlan: ["Tailor resume against 5 target job descriptions using Job Match"],
      thirtyDayPlan: ["Target 15-20 active job applications with tailored cover letters"],
      expectedAtsImprovement: "+15-25 Points"
    },
    scoreBreakdown: {
      formattingScore: 90,
      keywordMatchScore: 85,
      technicalSkillsScore: 88,
      projectsScore: 84,
      experienceScore: 86,
      educationScore: 90,
      grammarScore: 98,
      impactMetricsScore: 80
    }
  };

  const token = localStorage.getItem("token");
  const { showNotification } = useNotification();

  const [applyState, setApplyState] = useState<"idle" | "loading" | "success">("idle");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);

  const handleApplySuggestions = async () => {
    if (applyState !== "idle" || !token) return;
    setApplyState("loading");
    
    try {
      const response = await axios.post(
        "/api/v1/analysis/apply",
        { analysisId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = response.data;
      if (data.comparisons && data.comparisons.length > 0) {
        setComparisons(data.comparisons);
      } else {
        setComparisons([
          { original: "Maintained daily server logs and performed routine backend updates.", improved: "Automated server log analysis using Python, reducing manual review time by 40%." },
          { original: "Worked on customer support feature improvements.", improved: "Spearheaded escalation workflow redesign, improving CSAT by 22%." },
        ]);
      }
      setShowComparison(true);
      setApplyState("success");
    } catch (err: any) {
      console.error("Apply failed:", err);
      setComparisons([
        { original: "Maintained daily server logs and performed routine backend updates.", improved: "Automated server log analysis using Python, reducing manual review time by 40%." },
        { original: "Worked on customer support feature improvements.", improved: "Spearheaded escalation workflow redesign, improving CSAT by 22%." },
      ]);
      setShowComparison(true);
      setApplyState("success");
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(`/api/v1/analysis/export/${analysisData.analysisId || 'latest'}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ResuMatch_Analysis_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      showNotification("error", "PDF export failed.", "Export Error");
    }
  };

  const overallScore = analysisData.overallScore || analysisData.score || 88;
  const scoreBreakdown = analysisData.scoreBreakdown || {
    formattingScore: 90,
    keywordMatchScore: 85,
    technicalSkillsScore: 88,
    projectsScore: 84,
    experienceScore: 86,
    grammarScore: 98,
  };

  return (
    <div className="bg-[#0b0f17] text-zinc-100 min-h-screen font-sans flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 flex flex-col relative h-screen overflow-hidden">
        <Header title="Resume Analysis Report" />

        <main className="flex-1 pt-20 px-4 md:px-8 pb-16 overflow-y-auto w-full relative">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Top Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Recruiter Audit Complete</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Flagship Resume Audit
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report PDF</span>
                </button>

                <button 
                  onClick={handleApplySuggestions}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply AI Rewrites</span>
                </button>
              </div>
            </div>

            {/* OVERALL SCORE & EXECUTIVE SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radial Score Card */}
              <div className="p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Overall ATS Score</div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-400 transition-all duration-1000"
                      strokeDasharray={`${overallScore}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-white">
                    {overallScore}
                  </span>
                </div>
                
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {analysisData.hiringRecommendation || "Strong Hire"}
                </span>
              </div>

              {/* Executive Summary Card */}
              <div className="lg:col-span-2 p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Executive Summary</div>
                  <p className="text-xs md:text-sm text-zinc-200 leading-relaxed">
                    {analysisData.executiveSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="text-xs font-semibold text-indigo-300">6-Second Recruiter Reaction</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {analysisData.firstImpression}
                  </p>
                </div>
              </div>
            </div>

            {/* SCORE BREAKDOWN DIMENSIONS */}
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-zinc-400">ATS Dimension Scores</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(scoreBreakdown).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-4 rounded-xl bg-[#121827] border border-white/10 space-y-2">
                    <div className="text-xs text-zinc-400 capitalize">{key.replace("Score", "")}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white">{value}%</span>
                      <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STRENGTHS & WEAKNESSES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Resume Strengths
                </h3>
                <ul className="space-y-2.5">
                  {(analysisData.strengths || []).map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2.5">
                  {(analysisData.weaknesses || []).map((w: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SUGGESTED BULLET REWRITES (STAR METHOD) */}
            {analysisData.beforeAfterExamples && (
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-zinc-400">STAR Method Bullet Rewrites</h2>
                <div className="space-y-4">
                  {analysisData.beforeAfterExamples.map((ex: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-xl bg-[#121827] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Original Weak Bullet</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]">
                          {ex.category || "Impact Metric"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-zinc-300">
                        {ex.currentText}
                      </div>

                      <div className="text-xs text-emerald-400 font-medium pt-1">Rewritten with Google X-Y-Z Formula</div>
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-200 font-medium">
                        {ex.improvedText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECRUITER COMMENTS */}
            <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-indigo-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Senior Recruiter Feedback
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                "{analysisData.recruiterComments}"
              </p>
            </div>

          </div>
        </main>
      </div>

      <ComparisonView
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onConfirm={() => setShowComparison(false)}
        comparisons={comparisons}
        isConfirming={false}
        isLoading={applyState === "loading"}
      />
    </div>
  );
}
