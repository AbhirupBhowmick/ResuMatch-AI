import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface CoverLetterData {
  subject_line: string;
  body_paragraphs: string[];
}

const CoverLetter = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState("FREE");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("user_name") || "Candidate";
  const userEmail = localStorage.getItem("user_email") || "candidate@example.com";

  /* ── Animated loading messages ── */
  const loadingMessages = [
    "Analyzing your resume profile...",
    "Mapping skills to job requirements...",
    "Writing persuasive intro...",
    "Connecting your achievements...",
    "Crafting a compelling narrative...",
    "Polishing final draft...",
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  /* ── Fetch user tier ── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const resp = await axios.get("/api/v1/user/usage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserTier(resp.data.tier);
      } catch {
        /* ignore */
      }
    })();
  }, [token]);

  const isProUser = ["PRO_ACHIEVER", "ELITE"].includes(userTier);

  /* ── Generate ── */
  const handleGenerate = async () => {
    if (!token) { navigate("/login"); return; }
    if (!jobDescription.trim()) {
      setError("Please provide a job description to get started.");
      return;
    }
    if (!isProUser) {
      setError("Cover Letter Generator requires Pro Achiever tier.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCoverLetterData(null);
    setLoadingMsgIdx(0);

    try {
      const response = await axios.post(
        "/api/v1/premium/cover-letter",
        { jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoverLetterData(response.data);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;
      if (msg?.includes("NO_RESUME_DATA")) {
        setError("Please upload and analyze your resume on the Dashboard first.");
      } else if (msg?.includes("INSUFFICIENT_CREDITS")) {
        setError("This feature requires Pro Achiever tier. Please upgrade your plan.");
      } else {
        setError("Failed to generate cover letter. " + msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Copy ── */
  const handleCopy = () => {
    if (!coverLetterData) return;
    const text = [
      `RE: ${coverLetterData.subject_line}`,
      "",
      "Dear Hiring Manager,",
      "",
      ...coverLetterData.body_paragraphs,
      "",
      "Sincerely,",
      userName,
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Download PDF ── */
  const handleDownloadPdf = async () => {
    if (!coverLetterData || !token) return;
    setIsDownloading(true);
    try {
      const response = await axios.post(
        "/api/v1/premium/generate-pdf",
        {
          subject_line: coverLetterData.subject_line,
          body_paragraphs: coverLetterData.body_paragraphs,
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
      a.download = "CoverLetter.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("PDF download failed:", err);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-[#070d1f] text-[#dfe4fe] min-h-screen font-body selection:bg-primary/30">
      <Sidebar />
      <Header title="Cover Letter Generator" />

      <main className="lg:ml-64 pt-16 h-[calc(100vh)] flex flex-col lg:flex-row">
        {/* ═══════════ Left Panel: Input ═══════════ */}
        <section className="w-full lg:w-1/2 p-8 border-r border-[#ffffff]/5 flex flex-col gap-8 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black font-headline tracking-tight text-[#dfe4fe]">
              Cover Letter Generator
            </h2>
            <p className="text-[#a5aac2] leading-relaxed">
              Let AI craft a high-impact, tailored narrative for your next big role.
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-[#11192e]/60 backdrop-blur-xl p-8 rounded-xl border-t border-[#ffffff]/10 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="font-headline font-semibold text-sm text-primary tracking-wider uppercase">
                Job Description
              </label>
              <textarea
                className="w-full h-64 bg-black/30 border border-[#ffffff]/10 rounded-xl p-4 text-[#dfe4fe] text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none placeholder:text-[#6f758b] outline-none"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => { setJobDescription(e.target.value); setError(null); }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">error</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold font-headline text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 cursor-pointer
                ${isLoading
                  ? "bg-primary-container/70 text-[#14007e] cursor-wait"
                  : !jobDescription.trim()
                    ? "bg-[#171f36] text-[#6f758b] cursor-not-allowed"
                    : "bg-primary-container text-[#14007e] hover:brightness-110 active:scale-95"
                }`}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>✨ Crafting your narrative...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Magic Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Pro Lock State */}
          {!isProUser && (
            <div className="relative group overflow-hidden rounded-xl h-48 border border-[#ffffff]/10 bg-[#0c1326]/50">
              <div className="absolute inset-0 backdrop-blur-[2px] bg-[#070d1f]/60 flex flex-col items-center justify-center gap-3 z-10">
                <span
                  className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                <div className="text-center">
                  <p className="font-headline font-bold text-[#dfe4fe]">Pro Customizations</p>
                  <p className="text-xs text-[#a5aac2]">Unlock custom tones, character limits, and more.</p>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-full font-headline font-bold text-sm hover:bg-primary/30 transition-all cursor-pointer"
                >
                  Upgrade to Pro
                </button>
              </div>
              <div className="p-6 opacity-30 grayscale blur-sm flex flex-col gap-4">
                <div className="h-2 w-3/4 bg-[#41475b] rounded"></div>
                <div className="h-2 w-1/2 bg-[#41475b] rounded"></div>
                <div className="h-2 w-2/3 bg-[#41475b] rounded"></div>
                <div className="h-2 w-full bg-[#41475b] rounded"></div>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════ Right Panel: A4 Paper Preview ═══════════ */}
        <section className="w-full lg:w-1/2 bg-[#0c1326] p-8 flex items-start justify-center overflow-y-auto no-scrollbar relative">
          <div className="relative w-full flex flex-col items-center pt-12">
            {/* Preview Toolbar */}
            {coverLetterData && (
              <div className="absolute top-0 right-0 flex gap-2 animate-[fadeIn_0.5s_ease-out]">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-[#171f36] hover:bg-[#222b47] px-4 py-2 rounded-lg text-sm font-headline font-medium text-[#dfe4fe] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "Copied!" : "Copy Text"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-headline font-bold transition-colors hover:bg-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isDownloading ? 'animate-spin' : ''}`}>
                    {isDownloading ? "refresh" : "download"}
                  </span>
                  {isDownloading ? "Downloading..." : "Download PDF"}
                </button>
              </div>
            )}

            {/* ── A4 Paper ── */}
            <div
              className="w-full max-w-[680px] bg-white rounded-xl shadow-2xl shadow-black/40 p-12 text-slate-900 flex flex-col gap-6 selection:bg-indigo-100 overflow-hidden relative"
              style={{ aspectRatio: "1 / 1.414", minHeight: "700px" }}
            >
              {/* ── Loading Skeleton ── */}
              {isLoading && (
                <div className="absolute inset-0 z-20 bg-white p-12 flex flex-col gap-6 animate-pulse">
                  <div className="border-b border-slate-100 pb-8 flex flex-col gap-4">
                    <div className="h-8 w-1/3 bg-slate-100 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
                    <div className="h-4 w-1/5 bg-slate-100 rounded"></div>
                  </div>
                  <div className="mt-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-indigo-400 animate-[spin_2s_linear_infinite]">
                        auto_awesome
                      </span>
                      <p className="text-sm font-headline font-bold text-indigo-400 transition-opacity">
                        {loadingMessages[loadingMsgIdx]}
                      </p>
                    </div>
                    <div className="h-4 w-full bg-slate-50 rounded"></div>
                    <div className="h-4 w-[90%] bg-slate-50 rounded"></div>
                    <div className="h-4 w-[95%] bg-slate-50 rounded"></div>
                    <div className="h-4 w-full bg-slate-50 rounded"></div>
                    <div className="h-4 w-[40%] bg-slate-50 rounded"></div>
                  </div>
                </div>
              )}

              {/* ── Generated Content ── */}
              {coverLetterData && !isLoading ? (
                <>
                  {/* Header */}
                  <div className="border-b border-slate-100 pb-8 animate-[fadeIn_0.6s_ease-out]">
                    <h3 className="text-2xl font-bold text-slate-900 font-headline">{userName}</h3>
                    <p className="text-sm text-slate-500 mt-1">{userEmail}</p>
                  </div>

                  {/* Date & Recipient */}
                  <div className="space-y-1 animate-[fadeIn_0.8s_ease-out]">
                    <p className="text-sm font-medium">{today}</p>
                    <p className="text-sm font-bold">Hiring Manager</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-4">
                    <p className="text-sm font-bold mt-2 animate-[fadeIn_1s_ease-out]">
                      RE: {coverLetterData.subject_line}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700 animate-[fadeIn_1.1s_ease-out]">
                      Dear Hiring Manager,
                    </p>

                    {coverLetterData.body_paragraphs.map((para, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-slate-700"
                        style={{
                          animation: `fadeIn ${0.5 + i * 0.3}s ease-out both`,
                          animationDelay: `${1.2 + i * 0.15}s`,
                        }}
                      >
                        {para}
                      </p>
                    ))}

                    {/* Sign-off */}
                    <div
                      className="pt-8"
                      style={{
                        animation: `fadeIn 0.5s ease-out both`,
                        animationDelay: `${1.2 + coverLetterData.body_paragraphs.length * 0.15 + 0.3}s`,
                      }}
                    >
                      <p className="text-sm text-slate-700">Sincerely,</p>
                      <p className="text-sm font-bold mt-2">{userName}</p>
                    </div>
                  </div>
                </>
              ) : !isLoading ? (
                /* ── Empty State ── */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                  <span
                    className="material-symbols-outlined text-6xl text-slate-200"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    draft
                  </span>
                  <div>
                    <p className="text-lg font-bold text-slate-400 font-headline">
                      Your cover letter will appear here
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      Paste a job description and click "Generate" to create a tailored cover letter.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Bottom Paper Stack */}
            <div className="w-[98%] h-2 bg-white/20 rounded-b-xl -mt-1 mx-auto"></div>
            <div className="w-[96%] h-2 bg-white/10 rounded-b-xl -mt-1 mx-auto"></div>
          </div>
        </section>
      </main>

      {/* Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-[#070d1f] to-[#9093ff]"></div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CoverLetter;
