import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Sparkles, CheckCircle2, Award, AlertCircle, RotateCcw } from "lucide-react";

export default function InteractiveScratchReport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize Canvas Overlay with Dark Scratch Texture
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Fill dark metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#131a2c");
    gradient.addColorStop(0.5, "#0f1626");
    gradient.addColorStop(1, "#0a0f1d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Lock Icon Overlay Text on Canvas
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🔒 CONFIDENTIAL RECRUITER EVALUATION", width / 2, height / 2 - 10);

    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("Drag mouse or finger across card to unlock AI insights", width / 2, height / 2 + 15);
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, []);

  // Erase Circle on Drag
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    checkProgress(ctx, canvas.width, canvas.height);
  };

  // Calculate Scratch Progress
  const checkProgress = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (isFullyRevealed) return;
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      let clearPixels = 0;
      const totalPixels = imgData.data.length / 4;
      
      // Sample every 16th pixel for performance
      for (let i = 3; i < imgData.data.length; i += 64) {
        if (imgData.data[i] === 0) {
          clearPixels++;
        }
      }
      const percent = Math.min(100, Math.round((clearPixels / (totalPixels / 16)) * 100));
      setRevealedPercent(percent);

      if (percent > 25 && !isFullyRevealed) {
        setIsFullyRevealed(true);
        setIsScanning(true);
      }
    } catch (e) {
      // Fallback
    }
  };

  // Mouse & Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDrawing(true);
    if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleQuickReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setRevealedPercent(100);
    setIsFullyRevealed(true);
    setIsScanning(true);
  };

  const handleReset = () => {
    setIsFullyRevealed(false);
    setIsScanning(false);
    setRevealedPercent(0);
    initCanvas();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto my-8 select-none font-sans" ref={containerRef}>
      
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-75 pointer-events-none" />

      {/* Main Glass Box */}
      <div className="relative rounded-2xl bg-[#0d1322]/95 border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header Bar with Instruction */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6 text-left">
          <div className="flex items-center gap-2.5">
            {isFullyRevealed ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
            <div>
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                🔒 Confidential Recruiter Report
                {revealedPercent > 0 && !isFullyRevealed && (
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {revealedPercent}% Unlocked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {isFullyRevealed 
                  ? "Report unlocked. AI scanning sequence active." 
                  : "This report is hidden because it contains the AI's evaluation. Drag to unlock."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isFullyRevealed ? (
              <button 
                onClick={handleQuickReveal}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Unlock</span>
              </button>
            ) : (
              <button 
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-lock Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* INTERACTIVE CANVAS & REPORT CONTENT WRAPPER */}
        <div className="relative min-h-[380px] rounded-xl overflow-hidden">
          
          {/* UNDERLYING CONFIDENTIAL REPORT CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start p-2">
            
            {/* Left: Resume Document */}
            <div className="lg:col-span-7 bg-[#12192b] border border-white/10 rounded-xl p-5 relative overflow-hidden space-y-4">
              
              {/* LASER SCANNER LINE ON REVEAL */}
              {isScanning && (
                <motion.div 
                  animate={{ y: ["0%", "360%"] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] z-30 pointer-events-none"
                />
              )}

              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">Alex Rivera</h3>
                <p className="text-xs text-indigo-400">Senior Full Stack Engineer • San Francisco, CA</p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Executive Profile</div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/5">
                  Senior Engineer with 5+ years of experience architecting microservices with Spring Boot, React, and PostgreSQL.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Impact & Achievements</div>
                
                <motion.div 
                  initial={{ opacity: 0.4, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Spearheaded microservices overhaul, reducing API response latency by 42% for 2M active users.</span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0.4, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Automated CI/CD release workflow via Docker & GitHub Actions, cutting release cycles by 75%.</span>
                </motion.div>
              </div>
            </div>

            {/* Right: Live AI Evaluation Metrics */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* ATS Score Radial */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-[#161f36] to-[#101728] border border-indigo-500/30 flex items-center justify-between shadow-lg"
              >
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Overall ATS Score</div>
                  <div className="text-2xl font-extrabold text-white">88 / 100</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Top 5% Candidate Fit</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#12192b] border border-white/10 space-y-1">
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Matched Skills
                  </div>
                  <div className="text-xs font-semibold text-white">Java, React, SQL</div>
                </div>

                <div className="p-3 rounded-xl bg-[#12192b] border border-white/10 space-y-1">
                  <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Missing Keywords
                  </div>
                  <div className="text-xs font-semibold text-zinc-300">Docker, Kafka</div>
                </div>
              </div>

              {/* Recruiter Evaluation */}
              <div className="p-4 rounded-xl bg-[#12192b] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Recruiter Assessment</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Strong Hire
                  </span>
                </div>
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  "High impact bullet metrics present. Candidate passes all automated screening criteria."
                </p>
              </div>

            </div>

          </div>

          {/* HTML5 CANVAS SCRATCH OVERLAY (LAYERED ON TOP) */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className={`absolute inset-0 w-full h-full cursor-crosshair z-20 transition-opacity duration-700 ${
              isFullyRevealed ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          />

        </div>

      </div>
    </div>
  );
}
