export default function Features() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto relative z-20" id="features">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hero Card (Spans 2 columns on lg) */}
        <div className="bento-card group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-transform duration-300 hover:scale-[1.02] md:col-span-2 lg:col-span-2 row-span-2 flex flex-col justify-end min-h-[320px] relative overflow-hidden bg-gradient-to-br from-surface-container to-surface-container-low">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <svg className="w-32 h-32 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-primary-container/20 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-on-surface mb-4">Elite ATS Auditing</h3>
            <p className="text-on-surface-variant font-body leading-relaxed max-w-xl text-lg">
              Deep-scan resume parsing powered by advanced AI models. We don't just scan words; our neural engine understands context, seniority, and industry-specific nuance.
            </p>
          </div>
        </div>
        {/* Small Card 1 */}
        <div className="bento-card group p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-transform duration-300 hover:scale-[1.05] bg-gradient-to-br from-surface-container to-surface-container-low">
          <div className="w-12 h-12 rounded-lg bg-tertiary-container/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-tertiary-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3">Smart Keyword Analysis</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Instantly identify missing skills and industry-specific keywords required for your target roles.
          </p>
        </div>
        {/* Small Card 2 */}
        <div className="bento-card group p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-transform duration-300 hover:scale-[1.05] bg-gradient-to-br from-surface-container to-surface-container-low">
          <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-secondary-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3">Role Alignment</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Compare your resume directly against target job descriptions to ensure perfect positioning.
          </p>
        </div>
        {/* Small Card 3 */}
        <div className="bento-card group p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-transform duration-300 hover:scale-[1.05] bg-gradient-to-br from-surface-container to-surface-container-low md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3">Actionable Scoring</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Get a real-time, 100-point metric on your hireability based on algorithmic parsing.
          </p>
        </div>
      </div>
    </section>
  );
}
