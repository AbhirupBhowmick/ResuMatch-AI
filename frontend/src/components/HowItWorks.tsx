import { Upload, Sparkles, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 md:px-8 max-w-6xl mx-auto space-y-12">
      
      {/* Header Section */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          How It Works
        </h2>
        <p className="text-xs md:text-sm text-zinc-400">
          Three simple steps to build stronger job applications.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1 */}
        <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-4 relative">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload Resume
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload your existing PDF or DOCX resume into our workspace securely.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-4 relative">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Recruiter Audit
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our AI engine audits formatting, keywords, STAR metrics, and job match alignment.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-xl bg-[#121827] border border-white/10 space-y-4 relative">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Apply & Land Interviews
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Apply AI bullet rewrites, generate tailored cover letters, and submit applications.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
