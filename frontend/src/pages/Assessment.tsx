import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export default function Assessment() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const rawQuestions = localStorage.getItem("assessmentQuestions");
    if (!rawQuestions) {
      navigate("/interview");
      return;
    }
    setQuestions(JSON.parse(rawQuestions));
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOptionSelect = (optIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("assessmentAnswers", JSON.stringify(selectedAnswers));
    navigate("/assessment-result");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="bg-surface text-on-surface selection:bg-primary/30 min-h-[100vh] flex flex-col font-body">
      <style>{`
        .zen-gradient {
            background: radial-gradient(circle at 50% -20%, #1c253e 0%, #070d1f 70%);
        }
      `}</style>
      
      <div className="flex-1 flex flex-col zen-gradient">
        {/* TopAppBar */}
        <header className="fixed top-0 left-0 w-full z-50 bg-[#070d1f]">
          <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-6">
              <span className="text-xl font-bold text-indigo-500 font-headline tracking-tight">ResuMatch AI</span>
              <nav className="hidden md:flex gap-6 items-center">
                <span className="text-indigo-400 font-bold font-headline tracking-tight text-on-surface">Question {currentIndex + 1} of {questions.length}</span>
              </nav>
            </div>
            <div className={cn("flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/10", timeLeft < 300 ? "text-error-dim border-error-dim/30" : "")}>
              <span className={cn("material-symbols-outlined text-lg", timeLeft < 300 ? "text-error-dim" : "text-indigo-400")}>timer</span>
              <span className={cn("font-headline font-semibold tracking-wider", timeLeft < 300 ? "text-error-dim" : "text-slate-400")}>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="bg-gradient-to-b from-[#11192e] to-transparent h-1"></div>
        </header>

        {/* Decorative Elements */}
        <div className="fixed top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="fixed bottom-1/4 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Main Content: Zen MCQ Interface */}
        <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-32 relative z-10 w-full">
          <div className="max-w-3xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Question Block */}
                <section className="mb-12 text-center">
                  <div className="inline-block px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest font-body">
                    Technical Assessment
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight font-headline">
                    {currentQ.question}
                  </h1>
                </section>

                {/* Options Grid */}
                <div className="space-y-4">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className={cn(
                          "w-full text-left p-6 rounded-xl transition-all duration-300 group flex items-center gap-5 relative overflow-hidden",
                          isSelected 
                            ? "bg-indigo-500/10 border-2 border-indigo-500/60 shadow-[0_0_30px_rgba(79,70,229,0.15)]" 
                            : "bg-surface-container-low hover:bg-surface-container-highest border border-transparent"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 p-2">
                            <span className="material-symbols-outlined text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold transition-colors",
                          isSelected ? "bg-indigo-500 text-white" : "bg-surface-container text-outline group-hover:text-primary"
                        )}>
                          {idx + 1}
                        </div>
                        <span className={cn(
                          "text-lg font-body leading-relaxed transition-colors",
                          isSelected ? "font-bold text-on-surface" : "font-medium text-on-surface-variant group-hover:text-on-surface"
                        )}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Footer Progress Hint */}
                <div className="mt-12 flex items-center justify-center md:justify-between text-outline text-sm uppercase tracking-widest opacity-60 font-body">
                  <div className="hidden md:flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    <span>Think critically</span>
                  </div>
                  <div>Press [1-4] or Click to select</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#070d1f]/80 backdrop-blur-md border-t border-indigo-500/15 shadow-[0_-8px_30px_rgb(79,70,229,0.06)] pt-[-10px]">
          <div className="w-full flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
            {/* Previous Button */}
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn("flex flex-col items-center justify-center px-8 py-2 rounded-xl transition-all duration-150 group disabled:opacity-30 disabled:pointer-events-none",
                currentIndex === 0 ? "text-slate-600" : "text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95")}
            >
              <span className="material-symbols-outlined mb-1 text-[20px]">arrow_back</span>
              <span className="font-headline text-xs uppercase tracking-wider font-bold">Previous</span>
            </button>
            
            {/* Submit/Next Button */}
            {currentIndex === questions.length - 1 ? (
              <button 
                onClick={handleFinish}
                className="flex flex-col items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-xl px-12 py-2 hover:bg-indigo-500/30 transition-all active:scale-95 duration-150 shadow-[0_0_20px_rgba(79,70,229,0.2)] border border-indigo-500/30"
              >
                <span className="material-symbols-outlined mb-1 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-headline text-xs uppercase tracking-wider font-bold">Submit Answer</span>
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={selectedAnswers[currentIndex] === undefined}
                className="flex flex-col items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-xl px-12 py-2 hover:bg-indigo-500/30 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 duration-150 shadow-[0_0_20px_rgba(79,70,229,0.1)] border border-indigo-500/20"
              >
                <span className="material-symbols-outlined mb-1 text-[22px]">arrow_forward</span>
                <span className="font-headline text-xs uppercase tracking-wider font-bold">Save & Next</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
