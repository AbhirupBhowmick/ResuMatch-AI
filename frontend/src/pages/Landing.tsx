import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

import VideoModal from "../components/VideoModal";
import DotField from "../components/ui/DotField";

const phrases = [
  "Land the Interview.",
  "Optimize your Career.",
  "Beat the Competition.",
  "Secure your Future."
];

export default function Landing() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleTyping = () => {
      const fullText = phrases[index];
      
      if (isDeleting) {
        setDisplayText(fullText.substring(0, displayText.length - 1));
        setTypingSpeed(40);
      } else {
        setDisplayText(fullText.substring(0, displayText.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, typingSpeed]);

  return (
    <div className="bg-[#030712] text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden min-h-screen relative font-body">
      {/* Interactive Dot Lattice (Per-Dot Reaction) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
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
        {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/40 backdrop-blur-md shadow-indigo-500/5 font-headline tracking-tight">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="text-2xl font-black text-[#dfe4fe] cursor-pointer tracking-tighter hover:text-primary transition-all active:scale-95"
          >
            ResuMatch AI
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors scale-95 duration-200" href="#how-it-works">How it Works</a>
            <a className="text-slate-400 hover:text-indigo-300 transition-colors scale-95 duration-200" href="#pricing">Pricing</a>
            <a className="text-slate-400 hover:text-indigo-300 transition-colors scale-95 duration-200" href="#features">Features</a>
          </div>
          <div className="flex items-center space-x-6">
            <Link to={token ? "/dashboard" : "/login"} className="text-slate-400 hover:text-indigo-300 transition-colors text-sm font-medium">
              {token ? "Dashboard" : "Log In"}
            </Link>
            <Link to={token ? "/dashboard" : "/login"} className="bg-indigo-500 text-on-primary-fixed px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary-container transition-all shadow-lg shadow-indigo-500/20">
              {token ? "Go to Console" : "Sign Up"}
            </Link>
          </div>
        </div>
      </nav>
      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-8 overflow-hidden" style={{ backgroundImage: "radial-gradient(at top center, rgba(167, 165, 255, 0.15) 0%, transparent 70%)" }}>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-dim mr-2"></span>
              <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest font-bold">Now Powered by GEMMA 4</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-on-surface mb-6 tracking-tight leading-[1.1] font-headline min-h-[2.2em]">
              Master the ATS.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed via-primary-container to-tertiary drop-shadow-sm selection:bg-primary-container/30">
                {displayText}
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-on-surface-variant mb-12 font-body leading-relaxed">
              Our Digital Curator audits your resume through the eyes of elite hiring algorithms. Get instant, high-fidelity feedback and secure your dream role.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={token ? "/dashboard" : "/login"} className="group relative px-8 py-4 bg-indigo-600 rounded-xl font-bold text-on-surface overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(78,69,228,0.3)]">
                <span className="relative z-10">{token ? "Go to Dashboard" : "Analyze Resume for Free"}</span>
              </Link>
              <button onClick={() => setIsDemoOpen(true)} className="px-8 py-4 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-high transition-colors">
                View Demo
              </button>
            </div>
            {/* Abstract UI Element */}
            <div className="mt-20 relative max-w-5xl mx-auto">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-primary-dim/5 blur-[120px] rounded-full"></div>
              <div className="relative bg-surface-container-low rounded-t-2xl p-4 shadow-2xl border-t border-outline-variant/20">
                <div className="flex gap-2 mb-4 border-b border-outline-variant/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-error/40"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary/20"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                </div>
                <img alt="ResuMatch AI Analysis Engine Infographic" className="rounded-lg w-full shadow-2xl brightness-90 hover:brightness-100 transition-all duration-700" src="/IMG_3248.JPG" />
              </div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <Features />
        {/* Editorial Section */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-8 leading-tight tracking-tight font-headline">
                Your career is a story.<br/> We make it <span className="text-primary-container">unforgettable.</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">Quantify your impact with AI-suggested bullet point improvements that highlight measurable results.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">Targeted keyword extraction ensures you never miss a critical requirement for top-tier roles.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 flex flex-col justify-end shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-surface-container-highest hover:shadow-primary/5 cursor-default">
                  <div className="text-4xl font-extrabold text-primary-container mb-2 transition-transform duration-300">94%</div>
                  <div className="text-sm text-on-surface-variant font-label uppercase tracking-widest font-bold">Match Accuracy</div>
                </div>
                <div className="aspect-square bg-primary-container rounded-2xl p-6 flex flex-col justify-end shadow-xl transition-all duration-300 hover:scale-[1.02] hover:brightness-110 cursor-default">
                  <div className="text-4xl font-extrabold text-on-primary-container mb-2">12k+</div>
                  <div className="text-sm text-on-primary-container/80 font-label uppercase tracking-widest font-bold">Resumes Audited</div>
                </div>
                <div className="col-span-2 bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10 transition-all duration-300 hover:bg-surface-container-highest/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)] hover:border-primary/30 group cursor-default">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 transition-transform group-hover:scale-110" data-alt="profile portrait of a smiling executive woman"></div>
                    <div>
                      <div className="text-on-surface font-bold transition-all group-hover:text-primary">Sarah Jenkins</div>
                      <div className="text-xs text-on-surface-variant">Senior Lead at Fintech Co.</div>
                    </div>
                  </div>
                  <p className="italic text-on-surface/90 leading-relaxed transition-all group-hover:text-on-surface">"ResuMatch AI helped me restructure my 10-year experience into a narrative that actually converts. I landed 3 interviews in a week."</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-slate-950 w-full py-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto font-body text-sm">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-bold text-slate-200 mb-2">ResuMatch AI</div>
            <div className="text-slate-500">© 2024 ResuMatch AI. The Digital Curator.</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <Link className="text-slate-500 hover:text-indigo-300 opacity-80 hover:opacity-100 transition-opacity" to="#">Product</Link>
            <Link className="text-slate-500 hover:text-indigo-300 opacity-80 hover:opacity-100 transition-opacity" to="#">Company</Link>
            <Link className="text-slate-500 hover:text-indigo-300 opacity-80 hover:opacity-100 transition-opacity" to="#">Support</Link>
            <Link className="text-slate-500 hover:text-indigo-300 opacity-80 hover:opacity-100 transition-opacity" to="#">Privacy</Link>
          </div>
        </div>
      </footer>
      </div>
      <VideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
