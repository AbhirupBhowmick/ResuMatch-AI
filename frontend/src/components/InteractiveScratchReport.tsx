import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, CheckCircle2, Award, AlertTriangle, ArrowRight, RotateCcw, ShieldCheck, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InteractiveScratchReport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Demo State Machine: 'locked' -> 'unlocking' -> 'scanning' -> 'complete'
  const [demoState, setDemoState] = useState<'locked' | 'unlocking' | 'scanning' | 'complete'>('locked');
  const [scratchProgress, setScratchProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 250, y: 180 });
  const [isHovering, setIsHovering] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [activeSection, setActiveSection] = useState<number>(0); // 1: Summary, 2: Bullets, 3: Skills
  const [visibleConsoleLogs, setVisibleConsoleLogs] = useState<string[]>([]);
  const [visibleKeywords, setVisibleKeywords] = useState<string[]>([]);
  const [isBulletTransformed, setIsBulletTransformed] = useState(false);

  // Initialize Canvas Surface
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Dark metallic frosted layer
    ctx.fillStyle = "#0c1220";
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, []);

  // Handle Scratch Action with 110px Brush Radius
  const scratch = (clientX: number, clientY: number) => {
    if (demoState !== 'locked') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setMousePos({ x, y });

    // 110px eraser brush
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 110, 0, Math.PI * 2);
    ctx.fill();

    checkProgress(ctx, canvas.width, canvas.height);
  };

  // Check cleared percentage
  const checkProgress = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (demoState !== 'locked') return;
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      let clearPixels = 0;
      const totalPixels = imgData.data.length / 4;

      for (let i = 3; i < imgData.data.length; i += 128) {
        if (imgData.data[i] === 0) {
          clearPixels++;
        }
      }
      const percent = Math.min(100, Math.round((clearPixels / (totalPixels / 32)) * 100));
      setScratchProgress(percent);

      // Auto-dissolve overlay at 18% scratch threshold
      if (percent >= 18) {
        triggerCinematicSequence();
      }
    } catch (e) {
      // Fallback
    }
  };

  // Cinematic 3.5s Scanning Sequence Transition
  const triggerCinematicSequence = () => {
    setDemoState('unlocking');

    setTimeout(() => {
      setDemoState('scanning');
      setActiveSection(1);

      // Console logs & Section Highlights over 3.5 seconds
      setTimeout(() => {
        setVisibleConsoleLogs(prev => [...prev, "Reading Summary... ✓"]);
        setVisibleKeywords(["Java"]);
      }, 500);

      setTimeout(() => {
        setActiveSection(2);
        setIsBulletTransformed(true); // Live transformation of achievement bullet!
        setVisibleConsoleLogs(prev => [...prev, "Extracting Skills... ✓", "Checking ATS Formatting... ✓"]);
        setVisibleKeywords(prev => [...prev, "Spring Boot", "React"]);
      }, 1200);

      setTimeout(() => {
        setActiveSection(3);
        setVisibleConsoleLogs(prev => [...prev, "Comparing STAR Metrics... ✓", "Evaluating Impact Statements... ✓"]);
        setVisibleKeywords(prev => [...prev, "PostgreSQL"]);
      }, 2400);

      // ATS Score step count-up: 0 -> 18 -> 36 -> 59 -> 74 -> 88
      const scores = [0, 18, 36, 59, 74, 88];
      scores.forEach((sc, i) => {
        setTimeout(() => setAnimatedScore(sc), i * 500);
      });

      // Complete scan sequence at t = 3.5s
      setTimeout(() => {
        setDemoState('complete');
        setActiveSection(4);
        setVisibleConsoleLogs(prev => [...prev, "Generating Recruiter Verdict... ✓"]);
        setVisibleKeywords(prev => [...prev, "Missing: Kubernetes"]); // Missing keyword appears LAST
      }, 3500);

    }, 400);
  };

  const handleReplayScan = () => {
    setDemoState('locked');
    setScratchProgress(0);
    setAnimatedScore(0);
    setActiveSection(0);
    setVisibleConsoleLogs([]);
    setVisibleKeywords([]);
    setIsBulletTransformed(false);
    initCanvas();
  };

  const token = localStorage.getItem("token");

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto my-8 select-none font-sans" 
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-75 pointer-events-none" />

      {/* Main Glass Workspace Box */}
      <div className="relative rounded-2xl bg-[#0b0f19]/95 border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              demoState === 'complete' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]' 
                : demoState === 'scanning'
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {demoState === 'complete' ? (
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
              ) : demoState === 'scanning' ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 animate-pulse" />
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                <span>🔒 Confidential Recruiter Evaluation</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {demoState === 'locked' && "This report is hidden because it contains the AI's evaluation. Drag to unlock."}
                {demoState === 'unlocking' && "Unlocking confidential document..."}
                {demoState === 'scanning' && "AI scanning engine analyzing document structure & STAR impact metrics..."}
                {demoState === 'complete' && "Executive Recruiter Audit Complete"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {demoState === 'locked' && (
              <button 
                onClick={handleReplayScan}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Unlock</span>
              </button>
            )}

            {demoState === 'complete' && (
              <button 
                onClick={handleReplayScan}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay AI Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* WORKSPACE PREVIEW & AI METRICS GRID */}
        <div className="relative min-h-[440px] rounded-xl overflow-hidden">
          
          {/* UNDERLYING SAMPLE RESUME & AUDIT REPORT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            
            {/* LEFT: SAMPLE RESUME DOCUMENT WITH DEMO CANDIDATE BADGE */}
            <div className="lg:col-span-7 bg-[#101625] border border-white/10 rounded-xl p-5 relative overflow-hidden space-y-4 shadow-inner min-h-[420px]">
              
              {/* FULL VERTICAL SCANNING BEAM (3.5s traversal) */}
              {demoState === 'scanning' && (
                <motion.div 
                  initial={{ y: "-10%" }}
                  animate={{ y: "420%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  className="absolute left-0 right-0 z-30 pointer-events-none"
                >
                  <div className="h-10 bg-gradient-to-b from-cyan-400/0 via-cyan-400/25 to-transparent" />
                  <div className="h-0.5 bg-cyan-400 shadow-[0_0_25px_#38bdf8] w-full" />
                </motion.div>
              )}

              {/* Candidate Info Header with Demo Candidate Badge */}
              <div className="border-b border-white/10 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">Sample Resume</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono">
                      Demo Candidate
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Senior Full Stack Engineer</span>
                </div>
                <div className="text-xs text-zinc-400">candidate@resumatch-demo.io • San Francisco, CA</div>
              </div>

              {/* Professional Summary Section */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Professional Summary</div>
                <div className={`text-xs leading-relaxed p-2.5 rounded transition-all duration-500 border ${
                  activeSection === 1 
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                    : activeSection > 1
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                    : 'bg-white/[0.02] border-white/5 text-zinc-400'
                }`}>
                  Results-driven Senior Engineer with 6+ years of experience architecting distributed backend services using Java, Spring Boot, React, and PostgreSQL.
                </div>
              </div>

              {/* Work Experience STAR Bullets */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Key Achievements (STAR Method)</div>

                {/* Bullet 1 - Live Transformation */}
                <div className={`p-2.5 rounded text-xs transition-all duration-500 border flex items-start gap-2 ${
                  activeSection === 2 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.2)]' 
                    : activeSection > 2
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-white/[0.02] border-white/5 text-zinc-400'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {isBulletTransformed 
                      ? "Spearheaded microservices overhaul using Spring Boot, reducing API response latency by 42% for 2M daily users." 
                      : "Built REST APIs for client web applications."}
                  </span>
                </div>

                {/* Bullet 2 */}
                <div className={`p-2.5 rounded text-xs transition-all duration-500 border flex items-start gap-2 ${
                  activeSection === 2 
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                    : activeSection > 2
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                    : 'bg-white/[0.02] border-white/5 text-zinc-400'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Automated CI/CD release workflow via Docker & GitHub Actions, cutting deployment times from 45m to 8m.</span>
                </div>

                {/* Bullet 3 */}
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-xs text-zinc-400 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>Optimized database indexing across 15M records, preventing recurring outage incidents.</span>
                </div>
              </div>

            </div>

            {/* RIGHT: SEQUENTIAL REVEALED CARDS & AI CONSOLE LOG */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Card 1: ATS Score Animated Counter */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: demoState !== 'locked' ? 1 : 0.3, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 rounded-xl bg-gradient-to-br from-[#162038] to-[#0e1526] border border-indigo-500/30 flex items-center justify-between shadow-lg"
              >
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Overall ATS Score</div>
                  <div className="text-3xl font-extrabold text-white">
                    {animatedScore} <span className="text-sm font-normal text-zinc-400">/ 100</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Executive Recruiter Qualified</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                  <Award className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Card 2: Detected Skills Matrix (One by one) */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: demoState !== 'locked' ? 1 : 0.3, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-4 rounded-xl bg-[#101625] border border-white/10 space-y-3"
              >
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Detected Skill Keywords</div>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {visibleKeywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        kw.includes("Missing")
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* FLOATING AI CONSOLE LOG BOX */}
              {demoState === 'scanning' && (
                <div className="p-3 rounded-xl bg-[#0a0e1a] border border-cyan-500/20 text-xs font-mono space-y-1 text-cyan-300">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 border-b border-white/10 pb-1 mb-1">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>AI Console Analysis Log</span>
                  </div>
                  {visibleConsoleLogs.map((log, idx) => (
                    <div key={idx} className="text-[11px] text-zinc-300 font-mono flex items-center justify-between">
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Card 3: Full Recruiter Verdict (DELAYED UNTIL SCAN COMPLETES AT 3.5s) */}
              <AnimatePresence>
                {demoState === 'complete' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 rounded-xl bg-[#101625] border border-white/10 space-y-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Recruiter Verdict</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        Strong Hire
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Strength:</strong> Quantifiable 42% latency reduction STAR metric.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Gap:</strong> Missing containerization terms (Kubernetes/Helm).</span>
                      </div>
                      <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                        💡 <strong>Action:</strong> Add Kubernetes to Skills section to raise ATS score +12 points.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

          {/* HTML5 CANVAS SCRATCH OVERLAY */}
          {demoState === 'locked' && (
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => scratch(e.clientX, e.clientY)}
              onMouseMove={(e) => scratch(e.clientX, e.clientY)}
              onTouchStart={(e) => e.touches[0] && scratch(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => e.touches[0] && scratch(e.touches[0].clientX, e.touches[0].clientY)}
              className="absolute inset-0 w-full h-full cursor-crosshair z-20"
            />
          )}

          {/* LIVE SCRATCH PROGRESS RING (TOP-RIGHT CORNER OF SCRATCH CARD) */}
          {demoState === 'locked' && (
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-[#0c1220]/90 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/10" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-cyan-400 transition-all duration-300" strokeDasharray={`${scratchProgress * 5.5}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-zinc-200">
                {scratchProgress >= 18 ? "AI Report Unlocked" : `AI Decryption ${scratchProgress}%`}
              </span>
            </div>
          )}

          {/* GLOWING CIRCULAR BRUSH CURSOR FOLLOWING MOUSE */}
          {demoState === 'locked' && isHovering && (
            <div 
              className="absolute w-28 h-28 rounded-full border border-cyan-400/60 bg-cyan-400/15 blur-sm pointer-events-none z-25 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_#38bdf8]"
              style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
            />
          )}

        </div>

        {/* END-OF-ANIMATION CONVERSION CTA */}
        <AnimatePresence>
          {demoState === 'complete' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-5 rounded-xl border border-indigo-500/20"
            >
              <div className="text-left space-y-0.5">
                <div className="text-sm font-bold text-white">Ready to analyse your own resume?</div>
                <p className="text-xs text-zinc-400">
                  Upload your resume and generate a personalized AI recruiter analysis in seconds.
                </p>
              </div>

              <button
                onClick={() => navigate(token ? "/dashboard" : "/login")}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
              >
                <span>Analyze Your Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
