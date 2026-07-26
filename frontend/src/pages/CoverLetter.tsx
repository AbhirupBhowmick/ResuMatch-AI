import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from "axios";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Building2, 
  Briefcase, 
  User as UserIcon, 
  AlertTriangle 
} from "lucide-react";

export default function CoverLetter() {
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetterData, setCoverLetterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const userName = localStorage.getItem("user_name") || "Software Professional";
  const userEmail = localStorage.getItem("user_email") || "user@resumatch.ai";
  const token = localStorage.getItem("token");

  const handleGenerate = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setError("Please provide a job description (at least 15 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "/api/v1/premium/cover-letter",
        { 
          jobDescription,
          companyName: companyName || "Target Company",
          targetRole: targetRole || "Target Role",
          hiringManager: hiringManager || "Hiring Manager"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoverLetterData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to generate cover letter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetterData) return;
    const fullText = coverLetterData.fullCoverLetter || 
      `RE: ${coverLetterData.subjectLine || "Application for " + (targetRole || "Role")}\n\n` +
      `Dear ${hiringManager || "Hiring Manager"},\n\n` +
      `${coverLetterData.openingParagraph || ""}\n\n` +
      `${coverLetterData.bodyParagraph1 || ""}\n\n` +
      `${coverLetterData.bodyParagraph2 || ""}\n\n` +
      `${coverLetterData.closingParagraph || ""}\n\n` +
      `Sincerely,\n${userName}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!coverLetterData || !token) return;
    setIsDownloading(true);
    try {
      const paragraphs = coverLetterData.bodyParagraphs || [
        coverLetterData.openingParagraph,
        coverLetterData.bodyParagraph1,
        coverLetterData.bodyParagraph2,
        coverLetterData.closingParagraph
      ].filter(Boolean);

      const response = await axios.post(
        "/api/v1/premium/generate-pdf",
        {
          subjectLine: coverLetterData.subjectLine || `Cover Letter for ${targetRole || "Role"}`,
          bodyParagraphs: paragraphs,
          userName: userName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover_Letter_${(targetRole || "Application").replace(/ /g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("PDF download error:", err);
      setError("Failed to download PDF report. Please try copying the text instead.");
    } finally {
      setIsDownloading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-[#0b0f17] text-zinc-100 min-h-screen font-sans flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col relative h-screen overflow-hidden">
        <Header title="Cover Letter AI" />

        <main className="flex-1 pt-20 px-4 md:px-8 pb-16 overflow-y-auto w-full relative">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <FileText className="w-3.5 h-3.5" />
                <span>Tailored Application Narrative</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Cover Letter Generator</h1>
              <p className="text-zinc-400 text-sm">
                Generate high-converting, recruiter-grade cover letters tailored to your target job posting.
              </p>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT INPUT PANEL */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-xl bg-[#121827] border border-white/10 p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Application Details</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">Target Company</label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          placeholder="e.g. Stripe, Vercel, OpenAI"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">Role Title</label>
                      <div className="relative">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          placeholder="e.g. Senior Frontend Engineer"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">Hiring Manager (Optional)</label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          placeholder="e.g. Sarah Jenkins or Talent Team"
                          value={hiringManager}
                          onChange={(e) => setHiringManager(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">Job Description (JD)</label>
                      <textarea 
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste full target job description here..."
                        className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button 
                    disabled={isLoading}
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{isLoading ? "Crafting Narrative..." : "Generate Cover Letter"}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT PREVIEW PANEL */}
              <div className="lg:col-span-7 space-y-4">
                {coverLetterData && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">Letter Preview</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied!" : "Copy Text"}</span>
                      </button>

                      <button 
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-white text-slate-900 p-8 md:p-10 shadow-2xl min-h-[500px] border border-zinc-300 relative font-serif">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-10 bg-slate-100 rounded w-full mt-6" />
                      <div className="space-y-2 mt-6">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                        <div className="h-4 bg-slate-100 rounded w-5/6" />
                        <div className="h-4 bg-slate-100 rounded w-4/6" />
                      </div>
                    </div>
                  ) : coverLetterData ? (
                    <div className="space-y-6 text-sm leading-relaxed text-slate-800 font-sans">
                      {/* Candidate Header */}
                      <div className="border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-900">{userName}</h2>
                        <p className="text-xs text-slate-500">{userEmail} • {todayStr}</p>
                      </div>

                      {/* Recipient */}
                      <div className="text-xs space-y-1 text-slate-600">
                        <div className="font-semibold text-slate-900">{coverLetterData.recipient || hiringManager || "Hiring Manager"}</div>
                        <div>{companyName || "Target Company"}</div>
                      </div>

                      {/* Subject Line */}
                      <div className="font-bold text-slate-900">
                        RE: {coverLetterData.targetRole || targetRole || "Application"} Position
                      </div>

                      {/* Body Paragraphs */}
                      <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-normal">
                        <p>{coverLetterData.salutation || `Dear ${hiringManager || "Hiring Manager"},`}</p>
                        <p>{coverLetterData.openingParagraph || coverLetterData.fullCoverLetter}</p>
                        {coverLetterData.bodyParagraph1 && <p>{coverLetterData.bodyParagraph1}</p>}
                        {coverLetterData.bodyParagraph2 && <p>{coverLetterData.bodyParagraph2}</p>}
                        {coverLetterData.closingParagraph && <p>{coverLetterData.closingParagraph}</p>}
                      </div>

                      {/* Sign-off */}
                      <div className="pt-4 text-xs font-medium text-slate-900">
                        <div>Sincerely,</div>
                        <div className="font-bold text-sm mt-1">{userName}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-3 font-sans">
                      <FileText className="w-10 h-10 text-slate-300" />
                      <div className="text-sm font-semibold text-slate-700">No Cover Letter Generated Yet</div>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Enter your job details on the left and click "Generate Cover Letter" to craft your narrative.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
