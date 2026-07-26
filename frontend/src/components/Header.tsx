import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Settings, Image as ImageIcon } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(localStorage.getItem("user_profile_pic"));
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Resume Audit complete!", time: "2m ago", read: false },
    { id: 2, text: "Welcome to ResuMatch AI Workspace", time: "1h ago", read: true },
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userName = localStorage.getItem("user_name") || "Developer";
  const userEmail = localStorage.getItem("user_email") || "user@resumatch.ai";
  const userInitial = userName.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        localStorage.setItem("user_profile_pic", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-8 font-sans">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
          <input 
            className="bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 text-xs text-white placeholder:text-zinc-500 rounded-full py-2 pl-9 pr-4 w-52 focus:w-64 transition-all outline-none" 
            placeholder="Search workspace..." 
            type="text"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.06] rounded-lg transition-colors relative text-zinc-400 hover:text-white cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-400 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#121827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} 
                  className="text-[10px] text-indigo-400 hover:underline uppercase font-bold"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                    <p className="text-zinc-200">{n.text}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <div 
            onClick={() => setShowProfile(!showProfile)} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/10">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                userInitial
              )}
            </div>
            <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{userName}</span>
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 bg-[#121827] border border-white/10 rounded-xl shadow-2xl z-50 py-2 text-xs">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="font-semibold text-white">{userName}</p>
                <p className="text-[10px] text-zinc-400">{userEmail}</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] text-zinc-300 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Change Avatar</span>
              </button>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] text-zinc-300 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                <span>Settings</span>
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleProfilePicUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      </div>
    </header>
  );
}
