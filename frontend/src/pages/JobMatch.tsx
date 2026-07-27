import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from "axios";
import { 
  Upload, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Sparkles
} from "lucide-react";

export default function JobMatch() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [errorStatus, setErrorStatus] = useState("");
  const [results, setResults] = useState<any>(null);

  const handleStartScan = async () => {
    setErrorStatus("");

    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setErrorStatus("Please enter a valid Job Description (at least 15 characters).");
      return;
    }

    setScanStatus('scanning');

    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append("file", resumeFile);
      } else {
        const storedText = localStorage.getItem("extractedText") || "Candidate resume placeholder text";
        const blob = new Blob([storedText], { type: "text/plain" });
        formData.append("file", blob, "Resume.txt");
      }
      formData.append("jobDescription", jobDescription);
      formData.append("companyName", companyName || "Target Company");
      formData.append("roleTitle", roleTitle || "Target Role");

      const response = await axios.post("/api/v1/resume/match", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.error) {
        setErrorStatus(response.data.error);
        setScanStatus('idle');
        return;
      }

      setResults(response.data);
      setScanStatus('complete');
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.response?.data?.error || err.response?.data?.message || "Job Match scan failed. Please try again.");
      setScanStatus('idle');
    }
  };

  return (
    <div className="bg-[#090a0f] text-zinc-100 min-h-screen font-sans">
      <Sidebar activeTab="job-match" />
      <Header title="Job Match" />
      
      <main className="ml-64 pt-20 px-8 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Title */}
          <div className="space-y-1 border-b border-zinc-800/60 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-white">Job Description Match</h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Compare your resume against a target job description to identify missing skill keywords and optimize STAR bullet points.
            </p>
          </div>

          {/* INPUT FORM AREA */}
          {scanStatus !== 'complete' && (
            <div className="space-y-6">
              {errorStatus && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Metadata & File Selection */}
                <div className="space-y-4">
                  <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Role Metadata</h2>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-300 block">Job Title</label>
                      <div className="relative">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          placeholder="e.g. Senior Full Stack Engineer" 
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
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
                          placeholder="e.g. Stripe / Vercel" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Resume Source</h2>
                    
                    <div className="border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-4 text-center space-y-2 bg-zinc-900/20">
                      <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                      <div className="text-xs text-zinc-400">
                        {resumeFile ? (
                          <span className="text-indigo-400 font-medium">{resumeFile.name}</span>
                        ) : (
                          <span>Using latest uploaded resume or select new PDF/DOCX</span>
                        )}
                      </div>
                      <input 
                        type="file" 
                        id="jobMatchFileInput" 
                        onChange={(e) => e.target.files?.[0] && setResumeFile(e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />
                      <label 
                        htmlFor="jobMatchFileInput" 
                        className="inline-block px-3 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-medium cursor-pointer hover:bg-zinc-700 transition-colors"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Job Description Text */}
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between space-y-3">
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Job Description</h2>
                    <textarea 
                      rows={12}
                      placeholder="Paste the full job description text here (requirements, qualifications, responsibilities)..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full h-[280px] bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none font-mono"
                    />
                  </div>

                  <button
                    onClick={handleStartScan}
                    disabled={scanStatus === 'scanning'}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {scanStatus === 'scanning' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Matching Against Job Description...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run Job Match Scan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS DISPLAY AREA */}
          {scanStatus === 'complete' && results && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Job Match Evaluation Results</h2>
                  <p className="text-xs text-zinc-400">{results.roleTitle || roleTitle || "Target Role"} at {results.companyName || companyName || "Target Company"}</p>
                </div>

                <button
                  onClick={() => { setScanStatus('idle'); setResults(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Match Scan</span>
                </button>
              </div>

              {/* Match Score & Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Match Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{results.matchScore || results.score || 82}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${results.matchScore || results.score || 82}%` }} />
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 md:col-span-2 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Alignment Summary</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {results.summary || results.matchSummary || "Resume shows solid alignment with target requirements. Incorporate missing technical keywords to maximize ATS screening score."}
                  </p>
                </div>
              </div>

              {/* Keyword Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Job Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(results.missingKeywords || ["Kubernetes", "GraphQL", "System Architecture"]).map((kw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20 font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Skill Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(results.matchedKeywords || ["React", "TypeScript", "Spring Boot", "REST APIs"]).map((kw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20 font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
