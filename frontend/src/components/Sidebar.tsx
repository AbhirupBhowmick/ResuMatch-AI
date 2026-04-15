import { Link, useNavigate } from "react-router-dom";

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (setActiveTab) {
      setActiveTab("dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleHistoryClick = () => {
    if (setActiveTab) {
      setActiveTab("history");
    } else {
      // If we are not on dashboard, we go to dashboard and then set history?
      // For now, simpler: always navigate if not on dashboard
      navigate("/dashboard");
      // Use a timeout or state in localStorage to ensure "history" is selected upon landing
      localStorage.setItem("dashboard_view", "history");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("dashboard_view");
    navigate("/login");
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-[#11192e] shadow-[32px_0_32px_rgba(79,70,229,0.06)] flex flex-col px-4 z-50 font-headline tracking-tight">
      <div className="h-16 px-2 flex items-center mb-6 cursor-default">
        <div className="flex flex-col leading-none">
          <div className="text-[20px] font-black text-[#dfe4fe] tracking-tighter">ResuMatch AI</div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-primary/70 font-bold mt-1 opacity-70">The Digital Curator</div>
        </div>
      </div>
      
      <div className="flex-1 space-y-1">
        <button 
          onClick={handleDashboardClick}
          className={`flex w-full items-center gap-3 px-4 py-3 transition-all cursor-pointer rounded-lg ${activeTab === "dashboard" ? "text-[#4F46E5] font-bold bg-[#171f36]/40 border-r-2 border-[#4F46E5]" : "text-[#dfe4fe]/60 hover:text-[#dfe4fe] hover:bg-[#171f36]"}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm">Dashboard</span>
        </button>
        <button 
          onClick={handleHistoryClick}
          className={`flex w-full items-center gap-3 px-4 py-3 transition-all cursor-pointer rounded-lg ${activeTab === "history" ? "text-[#4F46E5] font-bold bg-[#171f36]/40 border-r-2 border-[#4F46E5]" : "text-[#dfe4fe]/60 hover:text-[#dfe4fe] hover:bg-[#171f36]"}`}
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-sm">History</span>
        </button>
        <Link 
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg cursor-pointer ${window.location.pathname === "/interview" ? "text-[#4F46E5] font-bold bg-[#171f36]/40 border-r-2 border-[#4F46E5]" : "text-[#dfe4fe]/60 hover:text-[#dfe4fe] hover:bg-[#171f36]"}`} 
          to="/interview"
        >
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-sm">Interview Prep</span>
        </Link>
        <Link 
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg cursor-pointer ${window.location.pathname === "/cover-letter" ? "text-[#4F46E5] font-bold bg-[#171f36]/40 border-r-2 border-[#4F46E5]" : "text-[#dfe4fe]/60 hover:text-[#dfe4fe] hover:bg-[#171f36]"}`} 
          to="/cover-letter"
        >
          <span className="material-symbols-outlined">note_add</span>
          <span className="text-sm">Cover Letter</span>
          <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full">Pro</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="flex w-full items-center gap-3 px-4 py-3 text-[#dfe4fe]/60 hover:text-[#dfe4fe] hover:bg-[#171f36] transition-all rounded-lg cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm">Log Out</span>
        </button>
      </div>
      
      <div className="pt-8 mt-8 border-t border-outline-variant/10 pb-8">
        <button 
          onClick={() => {
            if (activeTab === "dashboard") {
              window.location.reload(); // Simple way to clear dashboard state if already there
            } else {
              localStorage.setItem("dashboard_view", "dashboard");
              if (setActiveTab) setActiveTab("dashboard");
              else navigate("/dashboard");
            }
          }} 
          className="w-full bg-primary-container text-on-primary-container py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_4px_12px_rgba(167,165,255,0.2)]"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Audit
        </button>
      </div>
    </nav>
  );
}
