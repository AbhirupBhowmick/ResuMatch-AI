import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export default function AssessmentResult() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    const rawQuestions = localStorage.getItem("assessmentQuestions");
    const rawAnswers = localStorage.getItem("assessmentAnswers");
    
    if (!rawQuestions || !rawAnswers) {
      navigate("/dashboard");
      return;
    }

    const parsedQ = JSON.parse(rawQuestions) as MCQQuestion[];
    const parsedA = JSON.parse(rawAnswers) as Record<number, number>;
    
    setQuestions(parsedQ);
    setAnswers(parsedA);

    let correctCount = 0;
    parsedQ.forEach((q, idx) => {
      if (parsedA[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    setScore(Math.round((correctCount / parsedQ.length) * 100));
  }, [navigate]);

  if (questions.length === 0) return null;

  const topicsToReview = questions
    .map((q, idx) => ({ ...q, userAnswer: answers[idx], idx }))
    .filter(item => item.userAnswer !== item.correctAnswerIndex);

  return (
    <div className="min-h-screen bg-background pb-12 relative selection:bg-primary/30">
      <Sidebar />
      <Header title="Assessment Report" />

      <main className="ml-0 lg:ml-64 px-4 py-24 max-w-5xl mx-auto space-y-12">
        <div className="flex items-center gap-4 mb-4">
           <Link to="/interview" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold group">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back to Interview Prep
           </Link>
        </div>

        {/* Scorecard Hero */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
          <h1 className="text-2xl font-bold mb-6 text-foreground/80 uppercase tracking-widest relative">Preparation Readiness Score</h1>
          
          <div className="relative inline-flex items-center justify-center">
             <svg className="w-48 h-48 transform -rotate-90">
               <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" />
               <circle 
                  cx="96" 
                  cy="96" 
                  r="88" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 88} 
                  strokeDashoffset={2 * Math.PI * 88 - (score / 100) * 2 * Math.PI * 88}
                  className={cn(
                    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500",
                    "transition-all duration-1000 ease-out"
                  )}
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black">{score}%</span>
             </div>
          </div>
          <p className="mt-6 text-lg text-muted-foreground relative">
             {score >= 80 ? "Excellent! You are highly prepared." : score >= 50 ? "Good start, but you have key areas to review." : "Significant gaps identified. Please review the topics below."}
          </p>
        </motion.div>

        {/* Dynamic Topic Review */}
        {topicsToReview.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-amber-500">
               <AlertCircle /> Critical Gaps & Topics to Review
            </h2>
            <div className="space-y-6">
              {topicsToReview.map((item, i) => (
                <div key={i} className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
                   <h3 className="font-semibold text-lg text-foreground mb-4 pl-4">{item.question}</h3>
                   
                   <div className="pl-4 space-y-4">
                     <div>
                       <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-1">Your Answer</p>
                       <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2 text-sm">
                         <XCircle className="w-4 h-4 flex-shrink-0" />
                         {item.userAnswer !== undefined ? item.options[item.userAnswer] : "Skipped"}
                       </div>
                     </div>

                     <div>
                       <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-1">Correct Answer</p>
                       <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2 text-sm font-medium">
                         <CheckCircle className="w-4 h-4 flex-shrink-0" />
                         {item.options[item.correctAnswerIndex]}
                       </div>
                     </div>

                     <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mt-4">
                       <p className="text-sm flex items-start gap-2 text-indigo-300">
                          <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed"><strong>Explanation:</strong> {item.explanation}</span>
                       </p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
