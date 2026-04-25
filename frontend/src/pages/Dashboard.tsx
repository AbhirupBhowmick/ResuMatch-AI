import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TierLimitModal from "../components/TierLimitModal";
import { useNotification } from "../context/NotificationContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboard_view") || "dashboard";
  });
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    localStorage.setItem("dashboard_view", activeTab);
    if (activeTab === "dashboard") {
      setFile(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("industry", "Software Engineering");
    formData.append("experienceLevel", "Mid-Level");

    try {
      const response = await axios.post("/api/v1/resume/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      localStorage.setItem("analysisResult", JSON.stringify(response.data));
      localStorage.setItem("extractedText", response.data.extractedText || "");
      
      const newHistoryItem = { 
        id: Date.now(), 
        name: file.name, 
        role: response.data.role || "Software Engineering",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        score: response.data.score || 0
      };
      const existingHistory = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
      localStorage.setItem("resumeHistory", JSON.stringify([newHistoryItem, ...existingHistory]));

      navigate("/results");
    } catch (error: any) {
      console.error("Analysis failed:", error);
      const errorData = error.response?.data;
      if (errorData?.error === "INSUFFICIENT_CREDITS") {
        setLimitMessage(errorData.message);
        setShowLimitModal(true);
      } else if (errorData?.message) {
        showNotification("error", errorData.message, "Server Error");
      } else {
        showNotification("error", error.message, "Analysis Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const history = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
  const displayHistory = history;

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen font-body">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header title={activeTab === "dashboard" ? "Command Center" : "Audit History"} />

      <main className="ml-64 pt-24 px-8 pb-12 min-h-screen">
        {activeTab === "dashboard" ? (
          <>
            {/* Hero Section / Upload Zone */}
            <section className="mb-12">
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Curate Your Career</h2>
                <p className="text-on-surface-variant mt-1">Upload your resume to get an AI-powered ATS audit and role alignment analysis.</p>
              </div>
              <div className="relative group/upload">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-xl blur-lg opacity-50 group-hover/upload:opacity-100 transition duration-1000 group-hover/upload:duration-200"></div>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative bg-surface-container-low border-2 border-dashed ${isDragging || file ? 'border-primary bg-surface-container-high' : 'border-[#4F46E5]/50'} rounded-xl p-16 flex flex-col items-center justify-center transition-all hover:bg-surface-container-high hover:border-primary cursor-pointer`}
                >
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 shadow-xl transition-transform duration-300 group-hover/upload:scale-110">
                    <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>cloud_upload</span>
                  </div>
                  <h3 className="text-xl font-bold font-headline text-on-surface mb-2">{file ? file.name : "Drop your resume here or click to browse."}</h3>
                  <p className="text-on-surface-variant text-sm font-medium mb-6">Supports PDF, DOCX up to 10MB</p>
                  
                  {!file ? (
                    <div className="mt-2 flex gap-4">
                      <label className="bg-surface-variant hover:bg-surface-container-highest px-6 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface cursor-pointer ring-offset-2 ring-primary">
                        Browse Files
                        <input id="file-upload" type="file" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-4">
                        <button disabled={loading} onClick={(e) => { e.stopPropagation(); handleUpload(); }} className="bg-primary hover:bg-primary-fixed disabled:opacity-50 px-8 py-3 rounded-xl shadow-[0_4px_12px_rgba(167,165,255,0.2)] text-on-primary font-bold transition-all flex items-center gap-2">
                            {loading ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">play_arrow</span>}
                            {loading ? "Analyzing Engine..." : "Analyze Resume"}
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Stats Grid (Bento Grid Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="glass-module p-6 rounded-xl">
                <div className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Total Audits</div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black font-headline text-on-surface leading-none">{history.length}</span>
                  <span className="text-primary text-sm font-bold mb-1">{(history.length > 0) ? '+1' : '+0'} this week</span>
                </div>
              </div>
              <div className="glass-module p-6 rounded-xl">
                <div className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Average Score</div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black font-headline text-on-surface leading-none">
                    {history.length > 0 ? Math.round(history.reduce((acc: number, cur: any) => acc + (cur.score || 0), 0) / history.length) : 0}
                  </span>
                  <span className="text-on-surface-variant text-sm font-medium mb-1">/100</span>
                </div>
              </div>
              <div className="glass-module p-6 rounded-xl">
                <div className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Role Matches</div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black font-headline text-on-surface leading-none">
                    {history.filter((h: any) => h.score >= 80).length}
                  </span>
                  <span className="text-primary-container text-sm font-bold mb-1">High fit</span>
                </div>
              </div>
              <div className="glass-module p-6 rounded-xl border-l-2 border-primary/40">
                <div className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">AI Credits</div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black font-headline text-on-surface leading-none">
                    {userData?.subscriptionTier === 'PRO_ACHIEVER' ? '∞' : userData?.subscriptionTier === 'ACTIVE_HUNTER' ? '2500' : '100'}
                  </span>
                  <span className="material-symbols-outlined text-primary text-lg mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold tracking-tight font-headline text-on-surface">Recent History</h2>
              <button 
                onClick={() => {
                  localStorage.removeItem("resumeHistory");
                  window.location.reload();
                }}
                className="text-primary text-sm font-bold hover:underline"
              >
                Clear All history
              </button>
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse font-body">
                <thead>
                  <tr className="bg-surface-container-highest/50 border-b border-outline-variant/10">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Filename</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Target Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">ATS Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {displayHistory.map((item: any, i: number) => {
                    let badgeClass = "bg-primary-container/20 text-primary border-primary/30";
                    if (item.score < 60) badgeClass = "bg-error-container/20 text-error border-error-container/40";
                    else if (item.score < 80) badgeClass = "bg-tertiary/20 text-tertiary border-tertiary/30";

                    return (
                      <tr key={item.id || i} className="hover:bg-surface-container-high/50 transition-colors group">
                        <td className="px-6 py-5 max-w-[250px]">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary-container shrink-0">picture_as_pdf</span>
                            <span className="font-semibold text-on-surface truncate" title={item.name}>{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-on-surface-variant truncate max-w-[200px]" title={item.role || "Software Engineering"}>{item.role || "Software Engineering"}</td>
                        <td className="px-6 py-5 text-on-surface-variant/70 text-sm whitespace-nowrap">{item.date}</td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                              {item.score}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {displayHistory.length === 0 && (
                <div className="py-20 text-center text-on-surface-variant opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4">history</span>
                  <p>No audit history found yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom Insights - Asymmetric Layout */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
          <div className="md:col-span-2 glass-module p-8 rounded-xl flex items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-[120px]">psychology</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3 font-headline text-on-surface">AI Career Coaching</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed max-w-lg">Based on your recent audits, your experience in <span className="text-primary font-bold">Distributed Systems</span> is highly valued but needs better keyword density in your "Frontend Eng" focused resume.</p>
              <Link to="/interview" className="inline-block bg-tertiary-container text-on-tertiary-container px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg">Start Prep Session</Link>
            </div>
            <div className="hidden md:block w-48 h-48 flex-shrink-0 bg-surface-container-highest rounded-full border border-outline-variant/10 flex items-center justify-center p-4 z-10">
                <div className="relative w-full h-full rounded-full border-4 border-primary/20 flex items-center justify-center bg-surface-container-highest">
                    <div className="text-center">
                    <div className="text-3xl font-black font-headline text-primary">82%</div>
                    <div className="text-[10px] uppercase font-bold text-on-surface-variant">Market Fit</div>
                    </div>
                    {/* SVG Ring for Visual */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle className="text-primary drop-shadow-[0_0_8px_rgba(167,165,255,0.6)]" cx="50%" cy="50%" fill="none" r="48%" stroke="currentColor" strokeDasharray="240 60" strokeWidth="6"></circle>
                    </svg>
                </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-xl border border-primary/20 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Pro Subscription</h3>
              <p className="text-sm text-on-surface-variant">Unlock unlimited audits, deep-dive interview simulations, and direct export to LinkedIn format.</p>
            </div>
            <button onClick={() => window.location.href = "/#pricing"} className="mt-8 w-full border-2 border-primary text-primary py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-on-primary transition-all cursor-pointer">Upgrade Now</button>
          </div>
        </section>

        <TierLimitModal 
          isOpen={showLimitModal} 
          onClose={() => setShowLimitModal(false)} 
          message={limitMessage} 
        />
      </main>
    </div>
  );
}
