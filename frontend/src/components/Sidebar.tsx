import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  FileSearch, 
  Target, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import LogoutModal from "./LogoutModal";

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userName = localStorage.getItem("user_name") || "Developer";
  const userEmail = localStorage.getItem("user_email") || "user@resumatch.ai";
  const userInitial = userName.charAt(0).toUpperCase();

  const currentPath = location.pathname;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "results",
      label: "Resume Analysis",
      icon: FileSearch,
      path: "/results",
    },
    {
      id: "job-match",
      label: "Job Match",
      icon: Target,
      path: "/job-match",
    },
    {
      id: "cover-letter",
      label: "Cover Letter",
      icon: FileText,
      path: "/cover-letter",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      path: "/history",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === "dashboard" && setActiveTab) {
      setActiveTab("dashboard");
      localStorage.setItem("dashboard_view", "dashboard");
    } else if (item.id === "history" && setActiveTab && currentPath === "/dashboard") {
      setActiveTab("history");
      localStorage.setItem("dashboard_view", "history");
    } else {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#090d16] border-r border-white/10 flex flex-col justify-between px-3 py-4 z-50 select-none font-sans">
        {/* Top Header / Logo */}
        <div>
          <div className="flex items-center justify-between px-3 py-2 mb-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0d121f] rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                  ResuMatch AI
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">v2.5</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">AI Career Workspace</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                (activeTab && activeTab === item.id) || 
                (!activeTab && (currentPath === item.path || (item.id === "job-match" && currentPath === "/job-tailor")));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer relative group ${
                    isActive 
                      ? "text-white bg-white/[0.08] shadow-sm border border-white/10" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-300"}`} />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-white truncate leading-tight">{userName}</span>
                <span className="text-[10px] text-zinc-400 truncate leading-tight">{userEmail}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={handleLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </>
  );
}
