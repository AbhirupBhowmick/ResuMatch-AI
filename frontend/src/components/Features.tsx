export default function Features() {
  const cardStyle = "group p-8 rounded-2xl bg-[#0c1326]/60 backdrop-blur-xl border border-[#41475b]/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(79,70,229,0.1)] hover:border-indigo-500/30 flex flex-col justify-end min-h-[280px] overflow-hidden relative";

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto relative z-20" id="features">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Top Left: Huge Hero Card (Spans 2 columns) */}
        <div className={`${cardStyle} md:col-span-2 lg:col-span-2`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <svg className="w-48 h-48 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-3xl font-extrabold text-[#dfe4fe] mb-4 tracking-tight">Elite ATS Auditing</h3>
            <p className="text-[#a5aac2] font-body leading-relaxed max-w-xl text-lg">
              Deep-scan resume parsing powered by advanced AI models. We don't just scan words; our neural engine understands context, seniority, and industry-specific nuance.
            </p>
          </div>
        </div>

        {/* Top Right: Small Card 1 (Spans 1 column) */}
        <div className={`${cardStyle} lg:col-span-1`}>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#dfe4fe] mb-3">Smart Keyword Analysis</h3>
            <p className="text-[#a5aac2] font-body text-sm leading-relaxed">
              Instantly identify missing skills and industry-specific keywords required for your target roles.
            </p>
          </div>
        </div>

        {/* Bottom Left: Small Card 2 (Spans 1 column) */}
        <div className={`${cardStyle} lg:col-span-1`}>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#dfe4fe] mb-3">Role Alignment</h3>
            <p className="text-[#a5aac2] font-body text-sm leading-relaxed">
              Compare your resume directly against target job descriptions to ensure perfect positioning.
            </p>
          </div>
        </div>

        {/* Bottom Right: Medium Card 3 (Spans 2 columns) */}
        <div className={`${cardStyle} md:col-span-1 lg:col-span-2`}>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#dfe4fe] mb-3">Actionable Scoring</h3>
            <p className="text-[#a5aac2] font-body text-sm leading-relaxed">
              Get a real-time, 100-point metric on your hireability based on algorithmic parsing. We benchmark your document against successful hires in your field to give you an objective confidence score before you apply.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
