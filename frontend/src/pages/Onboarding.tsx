import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Onboarding() {
  const [industry, setIndustry] = useState("");
  const [expLevel, setExpLevel] = useState("Mid-Level");
  const navigate = useNavigate();

  const handleNext = () => {
    // Save to local storage or backend if needed, then navigate
    navigate("/dashboard");
  };

  return (
    <div className="bg-[#070d1f] text-[#dfe4fe] font-body min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-primary-fixed">
      {/* Background Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-dim opacity-10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[50%] bg-tertiary-dim opacity-5 blur-[100px] rounded-full"></div>
      </div>

      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 bg-surface backdrop-blur-md bg-opacity-80 border-b border-outline-variant/10 shadow-[0_0_32px_rgba(79,70,229,0.06)]">
        <div className="flex justify-between items-center h-16 px-6 max-w-full mx-auto">
          <div className="text-xl font-bold tracking-tighter text-on-surface font-headline">
              ResuMatch AI
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-primary font-semibold font-headline transition-all duration-300 hover:text-primary-fixed" to="/">Back to Home</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-variant transition-all duration-300 active:scale-95 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-4 py-24 relative z-10">
        <div className="w-full max-w-xl">
          {/* Onboarding Card */}
          <div className="backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-outline-variant/10" style={{ background: "linear-gradient(135deg, rgba(28, 37, 62, 0.4) 0%, rgba(7, 13, 31, 0.8) 100%)", borderTop: "1px solid rgba(65, 71, 91, 0.3)" }}>
            {/* Progress Header */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <span className="text-primary font-headline font-bold text-sm tracking-widest uppercase">Step 1 of 1</span>
                <span className="text-on-surface-variant text-xs font-medium">Profile Personalization</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-full rounded-full shadow-[0_0_12px_rgba(151,149,255,0.4)]"></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface">Tailor Your Experience</h1>
                <p className="text-on-surface-variant leading-relaxed">Let's fine-tune our AI curator to align with your career trajectory.</p>
              </div>

              {/* Target Industry Dropdown */}
              <div className="space-y-3">
                <label className="block font-headline font-semibold text-sm text-on-surface tracking-wide">Target Industry</label>
                <div className="relative">
                  <select 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full appearance-none bg-surface-container-lowest border-none text-on-surface py-4 px-5 rounded-xl font-body focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option disabled value="">Select your field...</option>
                    <option value="tech">Technology & Software</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare & Biotech</option>
                    <option value="creative">Creative & Design</option>
                    <option value="education">Education & Research</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Experience Level Radio Group */}
              <div className="space-y-3">
                <label className="block font-headline font-semibold text-sm text-on-surface tracking-wide">Experience Level</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Junior */}
                  <label className="group cursor-pointer">
                    <input className="sr-only peer" name="exp_level" type="radio" value="Junior" checked={expLevel === "Junior"} onChange={(e) => setExpLevel(e.target.value)} />
                    <div className="h-full p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low peer-checked:bg-primary-container peer-checked:border-transparent transition-all duration-300 hover:bg-surface-container-high group-hover:border-primary/30 flex flex-col items-center justify-center text-center gap-2">
                      <span className="material-symbols-outlined text-primary peer-checked:text-on-primary-container group-hover:scale-110 transition-transform">school</span>
                      <span className="font-headline font-bold text-sm text-on-surface peer-checked:text-on-primary-container">Junior</span>
                    </div>
                  </label>
                  {/* Mid-Level */}
                  <label className="group cursor-pointer">
                    <input className="sr-only peer" name="exp_level" type="radio" value="Mid-Level" checked={expLevel === "Mid-Level"} onChange={(e) => setExpLevel(e.target.value)} />
                    <div className="h-full p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low peer-checked:bg-primary-container peer-checked:border-transparent transition-all duration-300 hover:bg-surface-container-high group-hover:border-primary/30 flex flex-col items-center justify-center text-center gap-2">
                      <span className="material-symbols-outlined text-primary peer-checked:text-on-primary-container group-hover:scale-110 transition-transform">work</span>
                      <span className="font-headline font-bold text-sm text-on-surface peer-checked:text-on-primary-container">Mid-Level</span>
                    </div>
                  </label>
                  {/* Senior */}
                  <label className="group cursor-pointer">
                    <input className="sr-only peer" name="exp_level" type="radio" value="Senior" checked={expLevel === "Senior"} onChange={(e) => setExpLevel(e.target.value)} />
                    <div className="h-full p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low peer-checked:bg-primary-container peer-checked:border-transparent transition-all duration-300 hover:bg-surface-container-high group-hover:border-primary/30 flex flex-col items-center justify-center text-center gap-2">
                      <span className="material-symbols-outlined text-primary peer-checked:text-on-primary-container group-hover:scale-110 transition-transform">star</span>
                      <span className="font-headline font-bold text-sm text-on-surface peer-checked:text-on-primary-container">Senior</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <button onClick={handleNext} disabled={!industry} className="w-full disabled:opacity-50 bg-primary-container text-on-primary-container font-headline font-extrabold py-4 px-8 rounded-xl shadow-[0_12px_24px_-8px_rgba(151,149,255,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(151,149,255,0.6)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2">
                  Save & Continue
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <p className="text-center text-on-surface-variant text-xs mt-6 opacity-60">
                   You can update these preferences at any time in your profile settings.
                </p>
              </div>
            </div>
          </div>

          {/* Contextual Detail */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">AI Matched Insights</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-xl">verified_user</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Privacy Shield Active</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
