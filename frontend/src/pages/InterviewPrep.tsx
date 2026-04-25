import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useNotification } from "../context/NotificationContext";

interface Question {
  id?: number;
  question: string;
  redFlagAddressed: string;
  strategy: string;
  sampleAnswer: string;
  confidence?: "UNRATED" | "EASY" | "HARD";
}

export default function InterviewPrep() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({ show: false, message: "" });
  
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const resumeText = localStorage.getItem("extractedText");
    if (!resumeText) {
      setToast({ show: true, message: "No Resume Found. Please upload a resume first." });
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  }, [navigate]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setErrorMsg("Please provide a Job Description to tailor the interview.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    setHasStarted(true);
    setFlippedIndex(null);
    setQuestions([]);
    
    try {
      const resumeText = localStorage.getItem("extractedText") || "Sample Fallback Resume text...";
      const response = await axios.post("/api/v1/interview/generate", 
        { extractedText: resumeText, jobDescription: jobDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setQuestions(response.data);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.status === "UPGRADE_REQUIRED") {
        showNotification("error", errorData.message, "Upgrade Required");
        window.location.href = "/#pricing";
      } else {
        setErrorMsg(`Failed to generate: ${errorData?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartMCQ = async () => {
    if (!jobDescription.trim()) return;
    setMcqLoading(true);
    try {
      const resumeText = localStorage.getItem("extractedText") || "";
      const response = await axios.post("/api/v1/assessment/generate", 
        { extractedText: resumeText, jobDescription: jobDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      localStorage.setItem("assessmentQuestions", JSON.stringify(response.data));
      navigate("/assessment");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.status === "UPGRADE_REQUIRED") {
        showNotification("error", errorData.message, "Upgrade Required");
        window.location.href = "/#pricing";
      } else {
        setErrorMsg(`MCQ Error: ${errorData?.message || err.message}`);
      }
      setMcqLoading(false);
    }
  };

  const handleConfidenceToggle = async (e: React.MouseEvent, idx: number, qId: number | undefined, level: "EASY" | "HARD") => {
    e.preventDefault();
    e.stopPropagation();
    const updatedQuestions = [...questions];
    updatedQuestions[idx].confidence = level;
    setQuestions(updatedQuestions);
    if (qId) {
       try {
            await axios.put(`/api/v1/interview/question/${qId}/confidence`, 
               { confidence: level },
               { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
       } catch (err) {
           console.error("Failed to update confidence", err);
       }
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary/30 min-h-screen">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
        .glass-gradient { background: radial-gradient(circle at top left, rgba(167, 165, 255, 0.05), transparent 60%); }
      `}</style>
      
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-error text-on-error px-6 py-3 rounded-full flex items-center shadow-2xl font-medium" >
            <span className="material-symbols-outlined mr-2">warning</span> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />

      <main className="lg:ml-64 pt-24 px-8 pb-12 min-h-screen glass-gradient">
        <section className="max-w-4xl mx-auto mb-16 text-center">
            <h2 className="font-headline text-4xl font-extrabold mb-4 tracking-tight text-on-surface">Curate Your <span className="text-primary">Perfect Response</span></h2>
            <p className="text-on-surface-variant mb-8 max-w-2xl mx-auto">Paste the job description below. Our AI will analyze the key competencies required and generate targeted behavioral questions to prepare you.</p>
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="relative w-full h-48 bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 rounded-xl p-6 text-on-surface focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-outline/50 font-body resize-none outline-none" 
                  placeholder="Paste the technical and soft skills requirements from the job posting here..." 
                />
            </div>
            {errorMsg && <p className="text-error font-bold mt-4">{errorMsg}</p>}
            <button 
                onClick={handleAnalyze} disabled={loading}
                className="mt-8 px-10 py-4 disabled:opacity-50 bg-primary-container text-on-primary-container font-headline font-extrabold rounded-xl shadow-[0_0_20px_rgba(167,165,255,0.3)] hover:shadow-[0_0_30px_rgba(167,165,255,0.5)] active:scale-95 transition-all flex items-center justify-center mx-auto gap-2"
            >
                {loading ? "Analyzing..." : "Generate Mock Interview"}
            </button>
        </section>

        {hasStarted && questions.length > 0 && (
          <section className="max-w-7xl mx-auto space-y-12">
            <div>
              <div className="flex items-center justify-between mb-10">
                  <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">auto_awesome</span>
                      Tailored Behavioral Questions
                  </h3>
                  <div className="text-sm text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Click to reveal strategy
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {questions.map((q, idx) => (
                      <div key={idx} className="perspective-1000 h-[400px] w-full">
                          <motion.div
                              className="relative w-full h-full preserve-3d cursor-pointer shadow-xl rounded-xl"
                              animate={{ rotateY: flippedIndex === idx ? 180 : 0 }}
                              transition={{ duration: 0.6 }}
                              onClick={() => setFlippedIndex(flippedIndex === idx ? null : idx)}
                          >
                              <div className="absolute inset-0 bg-surface-container-high rounded-xl p-8 backface-hidden flex flex-col justify-center items-center text-center border-t border-outline-variant/20">
                                  <span className="text-primary text-sm font-headline font-bold mb-4 tracking-widest uppercase">Behavioral Question</span>
                                  <h4 className="font-headline text-2xl font-bold text-on-surface leading-tight">"{q.question}"</h4>
                              </div>

                              <div className="absolute inset-0 bg-[#0c1326]/90 backdrop-blur-xl rounded-xl p-6 backface-hidden border-t border-primary/30 flex flex-col" style={{ transform: "rotateY(180deg)" }}>
                                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                      <div className="mb-4">
                                          <h5 className="text-primary text-xs font-headline font-black uppercase tracking-tighter mb-1">Recruiter's Perspective</h5>
                                          <p className="text-sm text-on-surface-variant">{q.redFlagAddressed}</p>
                                      </div>
                                      <div className="mb-4 border-t border-outline-variant/10 pt-2">
                                          <h5 className="text-emerald-400 text-xs font-headline font-black uppercase tracking-tighter mb-1">Winning Strategy</h5>
                                          <p className="text-sm text-on-surface">{q.strategy}</p>
                                      </div>
                                      <div className="mb-4 border-t border-outline-variant/10 pt-2">
                                          <h5 className="text-primary text-xs font-headline font-black uppercase tracking-tighter mb-1">Sample Answer</h5>
                                          <p className="text-sm text-on-surface-variant italic">"{q.sampleAnswer}"</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
                                      <button 
                                          className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-colors z-10 ${q.confidence === "HARD" ? 'bg-error-dim text-on-error border-error-dim' : 'border-error-dim text-error-dim hover:bg-error-dim/10'}`}
                                          onClick={(e) => handleConfidenceToggle(e, idx, q.id, "HARD")}
                                      >
                                          Needs Practice
                                      </button>
                                      <button 
                                          className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-colors z-10 ${q.confidence === "EASY" ? 'bg-primary-dim text-on-primary border-primary-dim' : 'border-primary-dim text-primary-dim hover:bg-primary-dim/10'}`}
                                          onClick={(e) => handleConfidenceToggle(e, idx, q.id, "EASY")}
                                      >
                                          Got It
                                      </button>
                                  </div>
                              </div>
                          </motion.div>
                      </div>
                  ))}
              </div>
            </div>

            <div className="mt-20 p-10 bg-surface-container-low rounded-xl border-t border-outline-variant/10 relative overflow-hidden text-center max-w-3xl mx-auto">
              <div className="relative z-10">
                <h4 className="font-headline text-2xl font-bold mb-4">Master the Technical Interview</h4>
                <p className="text-on-surface-variant mb-6">Generated technical multiple-choice questions based on your resume gaps and job description.</p>
                <button 
                  onClick={handleStartMCQ} disabled={mcqLoading}
                  className="px-8 py-3 bg-tertiary-container text-on-tertiary-container font-bold rounded-xl active:scale-95 transition-transform"
                >
                  {mcqLoading ? "Generating..." : "Start MCQ Assessment"}
                </button>
              </div>
            </div>
            
          </section>
        )}
      </main>
    </div>
  );
}
