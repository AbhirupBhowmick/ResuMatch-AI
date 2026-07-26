import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, FileText, Award } from "lucide-react";

export default function AnimatedResumeAudit() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 mb-16 select-none font-sans">
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-75" />

      {/* Main Glass Document Container */}
      <div className="relative rounded-2xl bg-[#0d1322]/90 border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Top Window Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-3 text-xs text-zinc-400 font-mono">Live AI Scanning Engine v2.5</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Scanning Candidate Document</span>
          </div>
        </div>

        {/* Inner Grid: Left Resume Preview, Right Floating Live Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: RESUME DOCUMENT PREVIEW WITH LASER SCANNER */}
          <div className="lg:col-span-7 bg-[#12192b] border border-white/10 rounded-xl p-6 relative overflow-hidden text-left space-y-5 min-h-[380px]">
            
            {/* MOVING SCANNER LASER LINE */}
            <motion.div 
              animate={{ y: ["0%", "360%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] z-20 pointer-events-none"
            />

            {/* Candidate Info Header */}
            <div className="border-b border-white/10 pb-4 space-y-1">
              <div className="text-lg font-bold text-white">Alex Rivera</div>
              <div className="text-xs text-indigo-400 font-medium">Senior Software Engineer • alex.rivera@dev.io</div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Professional Summary</div>
              <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/5">
                Results-driven engineer with 5+ years of experience architecting distributed cloud backend services with Spring Boot, React, and AWS.
              </p>
            </div>

            {/* Experience Bullets */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Key Achievements</div>

              {/* Bullet 1 */}
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Engineered microservices architecture, reducing end-to-end API latency by 42% for 2M daily active users.</span>
              </div>

              {/* Bullet 2 */}
              <div className="p-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Automated CI/CD release pipeline using GitHub Actions & Docker, cutting deployment time from 40m to 8m.</span>
              </div>

              {/* Bullet 3 */}
              <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-xs text-zinc-400 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>Managed database migration to PostgreSQL with zero downtime and strict ACID compliance.</span>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE UPDATING FLOATING CARDS */}
          <div className="lg:col-span-5 space-y-4 text-left">
            
            {/* Card 1: ATS Score Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#161f36] to-[#101728] border border-indigo-500/30 flex items-center justify-between shadow-lg"
            >
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">ATS Match Score</div>
                <div className="text-2xl font-extrabold text-white">88 / 100</div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Optimized for Enterprise Screening</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
            </motion.div>

            {/* Card 2: Dimension Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#12192b] border border-white/10 space-y-1">
                <div className="text-[10px] text-zinc-400 uppercase">Formatting</div>
                <div className="text-lg font-bold text-white">90%</div>
                <div className="text-[10px] text-zinc-400">Single Column ATS</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12192b] border border-white/10 space-y-1">
                <div className="text-[10px] text-zinc-400 uppercase">Keywords</div>
                <div className="text-lg font-bold text-emerald-400">14 Found</div>
                <div className="text-[10px] text-zinc-400">Java, React, SQL</div>
              </div>
            </div>

            {/* Card 3: Recruiter Recommendation */}
            <div className="p-4 rounded-xl bg-[#12192b] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Recruiter Assessment</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Strong Hire
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                "High impact bullet metrics present. Candidate passes all automated screening criteria."
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
