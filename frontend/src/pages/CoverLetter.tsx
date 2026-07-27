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

  const userName = localStorage.getItem("user_name") || "";
  const userEmail = localStorage.getItem("user_email") || "";

  const handleGenerate = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setError("Please provide a valid job description (at least 15 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/v1/premium/cover-letter", { 
        jobDescription,
        companyName: companyName || "Target Company",
        targetRole: targetRole || "Target Role",
        hiringManager: hiringManager || "Hiring Manager"
      });
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
    if (!coverLetterData) return;
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
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover_Letter_${(targetRole || "Application").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-[#090a0f] text-zinc-100 min-h-screen font-sans">
      <Sidebar activeTab="cover-letter" />
      <Header title="Cover Letter Generator" />

      <main className="ml-64 pt-20 px-8 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Title */}
          <div className="space-y-1 border-b border-zinc-800/60 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-white">AI Cover Letter Generator</h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Draft tailored, recruiter-grade cover letters aligned with target job descriptions and industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Form Controls */}
            <div className="space-y-5">
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Role & Context</h2>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">Job Title</label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Software Engineer" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">Company Name</label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="e.g. Stripe / Notion" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">Hiring Manager (Optional)</label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="e.g. Sarah Jenkins / Hiring Team" 
                      value={hiringManager}
                      onChange={(e) => setHiringManager(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Job Description</h2>
                <textarea 
                  rows={8}
                  placeholder="Paste job description requirements & key objectives..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none font-mono"
                />

                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Drafting Cover Letter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Tailored Cover Letter</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Letter Output Preview */}
            <div className="p-6 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Generated Preview</span>
                {coverLetterData && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloading ? "PDF..." : "PDF"}</span>
                    </button>
                  </div>
                )}
              </div>

              {coverLetterData ? (
                <div className="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans overflow-y-auto max-h-[500px] pr-2">
                  <div className="text-zinc-400 text-[11px]">
                    <p className="font-semibold text-zinc-200">{userName}</p>
                    <p>{userEmail}</p>
                  </div>

                  <p className="font-semibold text-zinc-200 border-b border-zinc-800/60 pb-2">
                    RE: {coverLetterData.subjectLine || `Application for ${targetRole || "Software Engineering Role"}`}
                  </p>

                  <p>Dear {hiringManager || "Hiring Manager"},</p>
                  <p>{coverLetterData.openingParagraph}</p>
                  <p>{coverLetterData.bodyParagraph1}</p>
                  <p>{coverLetterData.bodyParagraph2}</p>
                  <p>{coverLetterData.closingParagraph}</p>

                  <div className="pt-2">
                    <p>Sincerely,</p>
                    <p className="font-semibold text-zinc-200 mt-1">{userName}</p>
                  </div>
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 min-h-[350px]">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-xs font-medium text-zinc-300">No cover letter drafted yet</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Fill out the target role details and paste the job description to generate a structured, recruiter-grade cover letter.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
