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
  const [resumeProfile, setResumeProfile] = useState("Senior Full Stack Engineer (Default)");
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState("FREE");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("user_name") || "Alex Rivera";
  const userEmail = localStorage.getItem("user_email") || "alex.rivera@example.com";

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
      // Ensure we hit the right object shape whether it returns data or data.data
      setCoverLetterData(response.data.data || response.data);
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
      a.download = "My_Cover_Letter.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("PDF generation error:", err);
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
    <div className="bg-surface text-on-surface overflow-hidden min-h-screen font-body selection:bg-primary-container/30">
      <Sidebar />
      <Header title="Cover Letter Generator" />

      <main className="ml-0 md:ml-64 pt-24 h-screen flex flex-col md:flex-row bg-surface">
        {/* ═══════════ Left Panel: Input ═══════════ */}
        <section className="w-full md:w-1/2 p-8 border-r border-outline-variant/10 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-32">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black font-headline tracking-tight text-on-surface">
              Cover Letter Generator
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Let AI craft a high-impact, tailored narrative for your next big role.
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-surface-container-low/60 backdrop-blur-[12px] p-8 rounded-xl border-t border-outline-variant/20 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="font-headline font-semibold text-sm text-primary tracking-wider uppercase">
                JOB DESCRIPTION
              </label>
              <textarea
                className="w-full h-64 bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-4 text-on-surface text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none placeholder:text-outline outline-none"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => { setJobDescription(e.target.value); setError(null); }}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="font-headline font-semibold text-sm text-primary tracking-wider uppercase">
                SELECT RESUME PROFILE
              </label>
              <div className="relative group">
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-3.5 text-on-surface text-sm focus:border-primary/50 focus:ring-0 appearance-none cursor-pointer"
                  value={resumeProfile}
                  onChange={(e) => setResumeProfile(e.target.value)}
                >
                  <option>Senior Full Stack Engineer (Default)</option>
                  <option>Product Manager - Tech Core</option>
                  <option>UI/UX Designer Profile</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none group-hover:text-primary transition-colors">expand_more</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error-container/10 border border-error-container/20 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-sm mt-0.5">error</span>
                <p className="text-error text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-4 bg-primary-container text-on-primary-container disabled:opacity-70 disabled:cursor-not-allowed rounded-xl font-bold font-headline text-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/10"
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
            <div className="relative group overflow-hidden rounded-xl h-48 border border-outline-variant/15 bg-surface-container-low/50">
              <div className="absolute inset-0 backdrop-blur-[2px] bg-slate-950/40 flex flex-col items-center justify-center gap-3 z-10">
                <span
                  className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                <div className="text-center">
                  <p className="font-headline font-bold text-on-surface">Pro Customizations</p>
                  <p className="text-xs text-on-surface-variant">Unlock custom tones, character limits, and more.</p>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-full font-headline font-bold text-sm hover:bg-primary/30 transition-all cursor-pointer"
                >
                  Upgrade to Pro
                </button>
              </div>
              <div className="p-6 opacity-30 grayscale blur-sm flex flex-col gap-4">
                <div className="h-2 w-3/4 bg-outline-variant rounded"></div>
                <div className="h-2 w-1/2 bg-outline-variant rounded"></div>
                <div className="h-2 w-2/3 bg-outline-variant rounded"></div>
                <div className="h-2 w-full bg-outline-variant rounded"></div>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════ Right Panel: A4 Paper Preview ═══════════ */}
        <section className="w-full md:w-1/2 bg-surface-container-low p-8 flex items-start justify-center overflow-y-auto no-scrollbar relative pb-32">
          <div className="relative w-full flex flex-col items-center pt-8">
            
            {/* Preview Toolbar */}
            {coverLetterData && (
              <div className="absolute -top-4 right-0 flex gap-2 animate-[fadeIn_0.5s_ease-out] z-30">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-bright px-4 py-2 rounded-lg text-sm font-headline font-medium text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "Copied!" : "Copy Text"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-lg text-sm font-headline font-bold transition-colors hover:brightness-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full max-w-[680px] bg-white rounded-xl shadow-2xl shadow-black/40 p-12 text-slate-900 flex flex-col gap-6 selection:bg-primary-container/40 overflow-hidden relative"
              style={{ aspectRatio: "1 / 1.414", minHeight: "700px" }}
            >
              {/* Internal Toolbar (Shows if cover letter active, alternative position)  */}
              {coverLetterData && (
                <div className="absolute top-6 right-6 z-30">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-headline font-semibold text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer"
                    >
                    <span className={`material-symbols-outlined text-[18px] ${isDownloading ? 'animate-spin' : ''}`}>
                        {isDownloading ? "refresh" : "download"}
                    </span>
                    {isDownloading ? "Downloading..." : "Download PDF"}
                    </button>
                </div>
              )}

              {/* ── Loading Skeleton ── */}
              {isLoading && (
                <div className="absolute inset-0 z-20 bg-white p-12 flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
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
                      <span className="material-symbols-outlined text-primary animate-[spin_2s_linear_infinite]">
                        auto_awesome
                      </span>
                      <p className="text-sm font-headline font-bold text-primary transition-opacity">
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
                <div className="flex flex-col gap-6">
                  {/* Header Info */}
                  <div className="border-b border-slate-100 pb-8 hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded">
                    <h3 className="text-2xl font-bold text-slate-900 font-headline">{userName}</h3>
                    <p className="text-sm text-slate-500 font-body mt-1">San Francisco, CA | {userEmail} | 555-0123</p>
                  </div>
                  
                  {/* Recipient Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{today}</p>
                    <p className="text-sm font-bold">Hiring Manager</p>
                    <p className="text-sm text-slate-600">Company Name</p>
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
                        className="text-sm leading-relaxed text-slate-700 hover:bg-slate-50 transition-colors"
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
                </div>
              ) : !isLoading ? (
                /* ── Empty State ── */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span
                      className="material-symbols-outlined text-slate-300 text-3xl"
                    >
                      description
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-slate-400 text-lg">
                    No Content Yet
                  </h4>
                  <p className="text-slate-400 text-sm max-w-xs mt-2">
                    Paste a job description and click "Generate" to create a tailored cover letter.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Bottom Paper Stack */}
            <div className="w-[98%] h-2 bg-white/20 rounded-b-xl -mt-1 mx-auto hidden md:block"></div>
            <div className="w-[96%] h-2 bg-white/10 rounded-b-xl -mt-1 mx-auto hidden md:block"></div>
          </div>
        </section>
      </main>

      {/* Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-surface to-tertiary"></div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CoverLetter;
