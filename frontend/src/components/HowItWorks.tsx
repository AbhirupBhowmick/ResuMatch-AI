export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 z-10 relative flex flex-col items-center">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
          The Anatomy of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed to-tertiary-fixed">Precision Placement.</span>
        </h2>
        <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
          Discover how our intelligent auditing engine deconstructs your experience to perfectly align with enterprise expectations.
        </p>
      </div>

      {/* Vertical Timeline Layout */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Glowing Dashed Line (Background) */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-tertiary/50 to-transparent -translate-x-1/2 hidden md:block" style={{ borderLeft: "2px dashed rgba(167, 165, 255, 0.3)" }}></div>
        <div className="space-y-16 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 relative group">
            {/* Mobile Line Segment */}
            <div className="absolute left-8 top-16 bottom-[-4rem] w-px bg-gradient-to-b from-primary/50 to-tertiary/50 block md:hidden" style={{ borderLeft: "2px dashed rgba(167, 165, 255, 0.3)" }}></div>
            {/* Content Card (Left on Desktop) */}
            <div className="w-full md:w-1/2 flex justify-end pl-16 md:pl-0 md:pr-12">
              <div className="w-full bg-surface-container-low rounded-xl p-8 relative overflow-hidden transition-all duration-300 hover:bg-surface-container shadow-[0_4px_32px_rgba(151,149,255,0.03)] border-t border-outline-variant/15">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>upload_file</span>
                </div>
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-[0_0_15px_rgba(151,149,255,0.1)]">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2 tracking-tight">Drop Your Resume.</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Upload your existing PDF or DOCX into our secure vault. We handle the parsing instantly.
                </p>
              </div>
            </div>
            {/* Number Marker (Center) */}
            <div className="absolute left-0 md:left-1/2 -translate-x-2 md:-translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-surface border-4 border-surface-container z-10 shadow-[0_0_20px_rgba(100,94,251,0.2)]">
              <span className="font-headline text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-fixed to-tertiary">1</span>
            </div>
            {/* Spacer (Right on Desktop) */}
            <div className="hidden md:block w-1/2"></div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 relative group">
            {/* Mobile Line Segment */}
            <div className="absolute left-8 top-16 bottom-[-4rem] w-px bg-gradient-to-b from-tertiary/50 to-primary/50 block md:hidden" style={{ borderLeft: "2px dashed rgba(167, 165, 255, 0.3)" }}></div>
            {/* Content Card (Right on Desktop) */}
            <div className="w-full md:w-1/2 flex justify-start pl-16 md:pl-12">
              <div className="w-full bg-surface-container-low rounded-xl p-8 relative overflow-hidden transition-all duration-300 hover:bg-surface-container shadow-[0_4px_32px_rgba(151,149,255,0.03)] border-t border-outline-variant/15">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl text-tertiary" style={{ fontVariationSettings: "'FILL' 0" }}>document_scanner</span>
                </div>
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-[0_0_15px_rgba(144,147,255,0.1)]">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>troubleshoot</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2 tracking-tight">The AI Audit.</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Our Gemini-powered engine scans your layout, keywords, and metrics exactly like an enterprise ATS.
                </p>
              </div>
            </div>
            {/* Number Marker (Center) */}
            <div className="absolute left-0 md:left-1/2 -translate-x-2 md:-translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-surface border-4 border-surface-container z-10 shadow-[0_0_20px_rgba(144,147,255,0.2)]">
              <span className="font-headline text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-tertiary to-primary-fixed">2</span>
            </div>
            {/* Spacer (Left on Desktop) */}
            <div className="hidden md:block w-1/2"></div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8 relative group">
            {/* Content Card (Left on Desktop) */}
            <div className="w-full md:w-1/2 flex justify-end pl-16 md:pl-0 md:pr-12">
              <div className="w-full bg-surface-container-low rounded-xl p-8 relative overflow-hidden transition-all duration-300 hover:bg-surface-container shadow-[0_4px_32px_rgba(151,149,255,0.03)] border-t border-outline-variant/15">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 0" }}>rocket_launch</span>
                </div>
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-[0_0_15px_rgba(136,133,255,0.1)]">
                  <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>rocket</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2 tracking-tight">Curate & Conquer.</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Review your 100-point score, fix the highlighted gaps, and start landing interviews with confidence.
                </p>
              </div>
            </div>
            {/* Number Marker (Center) */}
            <div className="absolute left-0 md:left-1/2 -translate-x-2 md:-translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-surface border-4 border-surface-container z-10 shadow-[0_0_20px_rgba(136,133,255,0.2)]">
              <span className="font-headline text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-fixed-dim to-tertiary-fixed-dim">3</span>
            </div>
            {/* Spacer (Right on Desktop) */}
            <div className="hidden md:block w-1/2"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
