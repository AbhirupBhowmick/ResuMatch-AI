import { FileSearch, Target, FileText, CheckCircle2 } from "lucide-react";

export default function Features() {
  return (
    <section className="py-20 px-6 md:px-8 max-w-6xl mx-auto space-y-10" id="features">
      
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Intelligent Career Tools
        </h2>
        <p className="text-xs md:text-sm text-zinc-400">
          Everything you need to optimize your resume and land more interviews.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Resume Analysis */}
        <div className="p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-colors shadow-lg">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Resume Analysis</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Recruiter-grade 100-point audit covering formatting, impact metrics, STAR formula rewrites, and executive feedback.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-medium text-indigo-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recruiter Feedback Included</span>
          </div>
        </div>

        {/* Card 2: Job Match */}
        <div className="p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-colors shadow-lg">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Job Match</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Compare your resume against any target job description. Detect missing technical keywords and raise your match score.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-medium text-purple-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Keyword Matrix Extraction</span>
          </div>
        </div>

        {/* Card 3: AI Cover Letter */}
        <div className="p-6 rounded-xl bg-[#121827] border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-colors shadow-lg">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">AI Cover Letter</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate tailored, recruiter-grade cover letters tailored to your target position with instant copy and PDF export.
            </p>
          </div>
          <div className="pt-2 text-[11px] font-medium text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instant PDF Export</span>
          </div>
        </div>

      </div>
    </section>
  );
}
