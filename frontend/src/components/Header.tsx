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
    { id: 1, text: "Resume analysis complete", time: "Just now", read: false },
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userName = localStorage.getItem("user_name") || "Professional User";
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
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-14 bg-[#090a0f]/90 backdrop-blur-md border-b border-zinc-800/60 z-40 flex items-center justify-between px-8 font-sans">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          <input 
            className="bg-zinc-900/60 border border-zinc-800/80 focus:border-zinc-700 text-xs text-zinc-200 placeholder:text-zinc-500 rounded-md py-1.5 pl-8 pr-4 w-52 focus:w-64 transition-all outline-none" 
            placeholder="Search workspace..." 
            type="text"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800/60 rounded-md transition-colors relative text-zinc-400 hover:text-zinc-200 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
              <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-medium text-zinc-200">Notifications</h3>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} 
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-zinc-800/60">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                    <p className="text-zinc-300">{n.text}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{n.time}</p>
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
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 text-xs font-semibold shrink-0">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                userInitial
              )}
            </div>
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 py-1.5 text-xs">
              <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                <p className="font-medium text-zinc-200 truncate">{userName}</p>
                <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/60 text-zinc-300 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Upload Avatar</span>
              </button>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/60 text-zinc-300 transition-colors"
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
