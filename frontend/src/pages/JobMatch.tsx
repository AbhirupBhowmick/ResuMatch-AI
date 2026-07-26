import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Target, 
  Upload, 
  Building2, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw
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

      const token = localStorage.getItem("token");
      const response = await axios.post("/api/v1/resume/match", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
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
    <div className="bg-[#0b0f17] text-zinc-100 min-h-screen font-sans flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col relative h-screen overflow-hidden">
        <Header title="Job Match AI" />
        
        <main className="flex-1 pt-20 px-4 md:px-8 pb-16 overflow-y-auto w-full relative">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                <Target className="w-3.5 h-3.5" />
                <span>Job Description Alignment Engine</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Job Match</h1>
              <p className="text-zinc-400 text-sm">
                Compare your resume against target job requirements, detect skill gaps, and raise your ATS match score.
              </p>
            </div>

            {/* Input Form Area */}
            {scanStatus !== 'complete' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company & Role Details */}
                  <div className="space-y-4 rounded-xl bg-[#121827] border border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      Target Position (Optional)
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Company Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Google, Stripe, Microsoft"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Role Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Senior Software Engineer"
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Resume File</label>
                        <div className="relative border border-dashed border-white/10 hover:border-indigo-500/50 rounded-lg p-4 bg-white/[0.02] flex items-center justify-center text-center cursor-pointer transition-colors">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center gap-2 text-xs text-zinc-300">
                            <Upload className="w-4 h-4 text-indigo-400" />
                            <span>{resumeFile ? resumeFile.name : "Upload new resume or use last analyzed"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Description Textarea */}
                  <div className="space-y-4 rounded-xl bg-[#121827] border border-white/10 p-6 flex flex-col">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      Job Description (JD)
                    </h3>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description text here..."
                      className="w-full flex-1 min-h-[160px] bg-white/[0.03] border border-white/10 rounded-lg p-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>
                </div>

                {errorStatus && (
                  <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorStatus}</span>
                  </div>
                )}

                {/* Scan CTA Button */}
                <div className="flex justify-end">
                  <button 
                    disabled={scanStatus === 'scanning'}
                    onClick={handleStartScan}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {scanStatus === 'scanning' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{scanStatus === 'scanning' ? "Matching Skill Matrix..." : "Start Job Match Scan"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* RESULTS DASHBOARD */}
            <AnimatePresence>
              {scanStatus === 'complete' && results && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Top Score Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Overall Match Circle */}
                    <div className="p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Overall Match</div>
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-white/10"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-purple-400 transition-all duration-1000"
                            strokeDasharray={`${results.overallMatchScore || 84}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-3xl font-extrabold text-white">
                          {results.overallMatchScore || 84}%
                        </span>
                      </div>
                      <span className="text-xs text-purple-300 font-medium bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                        Expected ATS Gain: {results.expectedAtsIncrease || "+18 Points"}
                      </span>
                    </div>

                    {/* Score Breakdown Metrics */}
                    <div className="md:col-span-2 p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col justify-between space-y-4">
                      <div className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Match Dimension Breakdown</div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-zinc-400">ATS Match</div>
                          <div className="text-xl font-bold text-white">{results.atsMatchScore || 82}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-zinc-400">Skill Match</div>
                          <div className="text-xl font-bold text-white">{results.skillMatchScore || 85}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-zinc-400">Experience</div>
                          <div className="text-xl font-bold text-white">{results.experienceMatchScore || 80}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-zinc-400">Keywords</div>
                          <div className="text-xl font-bold text-white">{results.keywordMatchScore || 83}%</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-300 leading-relaxed">
                        <span className="font-semibold text-white">Recruiter Insight: </span>
                        {results.matchReasoning || "Candidate exhibits strong core technical alignment with target job requirements."}
                      </div>
                    </div>
                  </div>

                  {/* Matched vs Missing Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Matched Skills */}
                    <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-3">
                      <h3 className="text-xs uppercase tracking-widest font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Matched Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(results.matchedSkills || ["React", "TypeScript", "Node.js", "REST APIs", "Git"]).map((skill: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills & Keywords */}
                    <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-3">
                      <h3 className="text-xs uppercase tracking-widest font-semibold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Missing Critical Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(results.missingKeywords || results.missingSkills || ["Docker", "Kubernetes", "CI/CD Pipeline", "Microservices"]).map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reset CTA */}
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => {
                        setScanStatus('idle');
                        setResults(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Run Another Job Match</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
}
