import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, FileSearch, Target, FileText } from "lucide-react";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import InteractiveScratchReport from "../components/InteractiveScratchReport";
import VideoModal from "../components/VideoModal";
import DotField from "../components/ui/DotField";

export default function Landing() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const token = localStorage.getItem("token");

  return (
    <div className="bg-[#090B14] text-zinc-100 selection:bg-indigo-500/30 overflow-x-hidden min-h-screen relative font-sans">
      
      {/* Interactive Dot Field Background (Kept intact as required) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-60">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <nav className="fixed top-0 w-full z-50 bg-[#090B14]/80 backdrop-blur-md border-b border-white/10 font-sans">
          <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-[1px]">
                <div className="w-full h-full bg-[#0d121f] rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <span className="text-base font-bold text-white tracking-tight">ResuMatch AI</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-xs font-medium text-zinc-400">
              <a className="hover:text-white transition-colors" href="#features">Features</a>
              <a className="hover:text-white transition-colors" href="#how-it-works">How It Works</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link to={token ? "/dashboard" : "/login"} className="text-xs font-medium text-zinc-300 hover:text-white transition-colors">
                {token ? "Dashboard" : "Log In"}
              </Link>
              <Link 
                to={token ? "/dashboard" : "/login"} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {token ? "Console" : "Get Started"}
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Section */}
        <main className="relative pt-28">
          
          {/* HERO SECTION */}
          <section className="px-6 md:px-8 pt-12 pb-16 text-center max-w-5xl mx-auto space-y-8">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Career Workspace</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15]">
              Build Better Job Applications <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Analyze resumes, compare them against job descriptions, and generate tailored cover letters in one intelligent workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link 
                to={token ? "/dashboard" : "/login"} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Analyze Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button 
                onClick={() => setIsDemoOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 font-medium text-sm transition-all cursor-pointer"
              >
                View Demo
              </button>
            </div>

            {/* Trust Bar below Hero */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 text-xs font-medium text-zinc-400 max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-indigo-400" />
                <span>Resume Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Job Match</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>AI Cover Letter</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Google Authentication</span>
              </div>
            </div>

            {/* INTERACTIVE CANVAS SCRATCH REPORT DEMO */}
            <InteractiveScratchReport />

          </section>

          {/* FEATURES SECTION */}
          <div id="features">
            <Features />
          </div>

          {/* HOW IT WORKS SECTION */}
          <div id="how-it-works">
            <HowItWorks />
          </div>

          {/* CALL TO ACTION SECTION */}
          <section className="py-20 px-6 md:px-8 max-w-5xl mx-auto text-center space-y-6">
            <div className="p-10 rounded-2xl bg-gradient-to-b from-[#141b2d] to-[#0e1424] border border-white/10 shadow-2xl space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to transform your job search?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Upload your resume to get instant recruiter-grade feedback, keyword match analysis, and tailored cover letters.
              </p>
              <div className="pt-2">
                <Link 
                  to={token ? "/dashboard" : "/login"} 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95"
                >
                  <span>Analyze Resume for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="bg-[#090B14] w-full py-8 border-t border-white/10 text-xs text-zinc-500">
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-8 max-w-7xl mx-auto gap-4">
            <div>
              <span className="font-bold text-white">ResuMatch AI</span> • Executive Career Workspace
            </div>
            <div className="flex items-center gap-6">
              <a className="hover:text-zinc-300 transition-colors" href="#features">Features</a>
              <a className="hover:text-zinc-300 transition-colors" href="#how-it-works">How It Works</a>
              <button onClick={() => window.open('mailto:support@resumatch.ai')} className="hover:text-zinc-300 transition-colors cursor-pointer">Support</button>
            </div>
          </div>
        </footer>

      </div>

      <VideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
