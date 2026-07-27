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
import LogoutModal from "./LogoutModal";

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userName = localStorage.getItem("user_name") || "Professional User";
  const userEmail = localStorage.getItem("user_email") || "user@resumatch.ai";
  const userInitial = userName.charAt(0).toUpperCase();

  const currentPath = location.pathname;

  const navItems = [
    {
      id: "dashboard",
      label: "Workspace",
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
      navigate("/dashboard");
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
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#090a0f] border-r border-zinc-800/60 flex flex-col justify-between p-4 z-50 select-none font-sans">
        {/* Top Header / Logo */}
        <div>
          <div className="flex items-center justify-between px-2 py-3 mb-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                  ResuMatch AI
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">Career Workspace</span>
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "text-white bg-zinc-800/70 border border-zinc-700/50" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="pt-3 border-t border-zinc-800/60">
          <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-zinc-200 truncate leading-tight">{userName}</span>
                <span className="text-[10px] text-zinc-500 truncate leading-tight">{userEmail}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
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
