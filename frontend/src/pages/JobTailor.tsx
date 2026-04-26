import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";

export default function JobTailor() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [scanStatus, setScanStatus] = useState<'idle' | 'validating' | 'scanning' | 'complete'>('idle');
  const [errorStatus, setErrorStatus] = useState("");
  const [results, setResults] = useState<{
    score: number;
    missingKeywords: string[];
    weakKeywords: string[];
    suggestion: { original: string; optimized: string; } | null;
  } | null>(null);

  const handleStartScan = () => {
    setScanStatus('validating');
    setErrorStatus("");

    // Simulate validation
    setTimeout(() => {
      if (!resumeFile || jobDescription.trim().length < 10) {
        setErrorStatus("Invalid Document Type Detected. Please provide a valid Job Description and Resume.");
        setScanStatus('idle');
        return;
      }

      setScanStatus('scanning');

      // Simulate deep AI analysis
      setTimeout(() => {
        setResults({
          score: 85,
          missingKeywords: ["Design Systems", "Figma Auto Layout"],
          weakKeywords: ["Agile Methodology", "User Testing"],
          suggestion: {
            original: "Created mockups and wireframes for the new mobile app.",
            optimized: "Spearheaded the creation of scalable mockups and wireframes for the mobile application utilizing Figma Auto Layout, establishing foundational elements for a new Design System."
          }
        });
        setScanStatus('complete');
      }, 4000);
    }, 1000);
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen font-body flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col relative h-screen overflow-hidden">
        <Header title="Job Tailor X-Ray" />
        
        <main className="flex-1 pt-24 px-4 md:px-12 pb-12 overflow-y-auto w-full relative">
          <div className="fixed inset-0 pointer-events-none z-[-1] opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-dim via-surface to-surface"></div>
          
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mb-2">Resume Audit</h1>
              <p className="text-on-surface-variant text-lg font-body">Tailor your resume for specific job descriptions and bypass ATS filters.</p>
            </header>

            {/* Input Grid Area */}
            {scanStatus !== 'complete' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Resume Upload Column */}
                <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/20 flex flex-col gap-4">
                  <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Target Resume
                  </h3>
                  <div className="border border-dashed border-outline-variant/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface-container-highest/20 hover:bg-surface-container-highest/50 transition-colors cursor-pointer relative h-48">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                    />
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-3">upload_file</span>
                    <p className="font-bold text-on-surface">{resumeFile ? resumeFile.name : "Drop resume here or click to upload"}</p>
                    <p className="text-xs text-on-surface-variant mt-2">Supports PDF, DOCX up to 5MB</p>
                  </div>
                </div>

                {/* Job Description Column */}
                <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/20 flex flex-col gap-4">
                  <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">work</span>
                    Job Description
                  </h3>
                  <textarea 
                    className="w-full h-48 bg-surface-container-highest/20 border border-outline-variant/50 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 text-on-surface resize-none transition-colors"
                    placeholder="Paste the target job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="p-4 bg-error-dim/10 border border-error-dim/20 rounded-xl text-error flex items-center gap-3">
                <span className="material-symbols-outlined">warning</span>
                <p className="text-sm font-bold">{errorStatus}</p>
              </div>
            )}

            {/* Scan Button */}
            {scanStatus === 'idle' && (
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleStartScan}
                  className="bg-primary-container text-on-primary-container py-4 px-8 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary-fixed-dim transition-all shadow-[inset_0_2px_4px_rgba(20,0,126,0.3),_0_0_20px_rgba(151,149,255,0.2)] hover:shadow-[inset_0_2px_4px_rgba(20,0,126,0.3),_0_0_30px_rgba(151,149,255,0.4)]"
                >
                  <span className="material-symbols-outlined">document_scanner</span>
                  Start X-Ray Scan
                </button>
              </div>
            )}

            {/* Scanning State */}
            {(scanStatus === 'validating' || scanStatus === 'scanning') && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl animate-pulse">radar</span>
                  </div>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-2">
                  {scanStatus === 'validating' ? 'Validating Documents...' : 'Executing Deep X-Ray Scan...'}
                </h3>
                <p className="text-on-surface-variant text-sm">Our AI is cross-referencing your resume DNA with the job requirements.</p>
              </div>
            )}

            {/* Results Dashboard Bento Grid from Stitch */}
            <AnimatePresence>
              {scanStatus === 'complete' && results && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Main Score Radial */}
                  <section className="lg:col-span-5 bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant/20"></div>
                    <h2 className="text-xl font-headline font-bold text-on-surface absolute top-6 left-6">Match Score</h2>
                    <div className="relative w-48 h-48 flex items-center justify-center mt-4">
                      {/* Background track */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="6"></circle>
                        {/* Progress track */}
                        <circle className="text-primary drop-shadow-[0_0_4px_rgba(167,165,255,0.5)]" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset={283 - (283 * results.score) / 100} strokeWidth="6"></circle>
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-headline font-black text-on-surface tracking-tighter">{results.score}</span>
                        <span className="text-xs font-body text-on-surface-variant uppercase tracking-widest mt-1">/100</span>
                      </div>
                    </div>
                    <p className="text-sm font-body text-on-surface-variant mt-6 text-center max-w-[200px]">Strong alignment. High probability of ATS pass.</p>
                  </section>

                  {/* Insights Column */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Missing Keywords Card */}
                    <section className="bg-surface-container-low rounded-xl p-6 relative flex-1">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant/20"></div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-error-dim">warning</span>
                        <h3 className="text-lg font-headline font-semibold text-on-surface">Critical Missing Keywords</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {results.missingKeywords.map((kw, i) => (
                          <span key={`miss-${i}`} className="bg-surface-container-highest text-error-dim border border-error-dim/20 px-3 py-1.5 rounded-lg text-xs font-body flex items-center gap-2">
                            {kw}
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </span>
                        ))}
                        {results.weakKeywords.map((kw, i) => (
                          <span key={`weak-${i}`} className="bg-surface-container-highest text-tertiary border border-tertiary/20 px-3 py-1.5 rounded-lg text-xs font-body flex items-center gap-2">
                            {kw}
                            <span className="material-symbols-outlined text-[14px]">horizontal_rule</span>
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* AI Tailoring Suggestion */}
                    <section className="bg-surface-container-low rounded-xl relative flex-1">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant/20"></div>
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary-dim rounded-r-full shadow-[0_0_8px_rgba(100,94,251,0.6)]"></div>
                      <div className="p-6 pl-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary-dim">auto_fix_high</span>
                            <h3 className="text-lg font-headline font-semibold text-on-surface">AI Tailoring Suggestion</h3>
                          </div>
                          <button className="text-primary text-xs font-bold uppercase tracking-wider hover:text-primary-dim transition-colors">Apply Fix</button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 block">Original</span>
                            <p className="text-sm text-on-surface bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10">{results.suggestion?.original}</p>
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">arrow_downward</span>
                          </div>
                          <div>
                            <span className="text-xs text-primary uppercase tracking-wider mb-1 block">Optimized for Missing Keywords</span>
                            <p className="text-sm text-on-surface bg-surface-container-highest p-3 rounded-lg border border-primary/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                              {results.suggestion?.optimized}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                  
                  {/* Reset Scan CTA Area */}
                  <div className="lg:col-span-12 mt-4 flex justify-end">
                    <button 
                      onClick={() => {
                        setScanStatus('idle');
                        setResults(null);
                      }}
                      className="text-on-surface-variant hover:text-on-surface py-4 px-8 font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      Run Another Scan
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
