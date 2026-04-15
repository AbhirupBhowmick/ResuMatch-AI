import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(localStorage.getItem("user_profile_pic"));
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Resume Audit complete!", time: "2m ago", read: false },
    { id: 2, text: "Welcome to ResuMatch AI", time: "1h ago", read: true },
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userName = localStorage.getItem("user_name") || "User";
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
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-[#070d1f]/80 backdrop-blur-md border-b border-[#ffffff]/15 z-40 flex items-center justify-between px-8 font-headline font-medium">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-black text-[#dfe4fe]">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>
          <input 
            className="bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 focus:ring-primary text-sm rounded-full py-2 pl-10 pr-4 w-64 transition-all focus:w-80 outline-none" 
            placeholder="Search audits..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="w-10 h-10 flex items-center justify-center hover:bg-[#171f36] rounded-full transition-all relative text-on-surface-variant cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#070d1f]"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#11192e] border border-[#ffffff]/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-[#ffffff]/10 flex justify-between items-center bg-[#171f36]/40">
                  <h3 className="text-sm font-bold text-[#dfe4fe]">Notifications</h3>
                  <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-[10px] text-primary hover:underline uppercase font-bold">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-[#ffffff]/5 transition-colors border-b border-[#ffffff]/5 ${!n.read ? 'bg-[#4F46E5]/5' : ''}`}>
                      <p className="text-xs text-[#dfe4fe] mb-1">{n.text}</p>
                      <p className="text-[10px] text-[#dfe4fe]/40">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => window.open('mailto:support@resumatch.ai')} className="w-10 h-10 flex items-center justify-center hover:bg-[#171f36] rounded-full transition-all text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>

          {/* Profile */}
          <div className="relative">
            <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 ml-2 group cursor-pointer">
              <span className="text-sm font-bold text-[#dfe4fe]/80 group-hover:text-[#dfe4fe] transition-colors">{userName}</span>
              <div className="w-10 h-10 flex items-center justify-center hover:bg-[#171f36] rounded-full transition-all text-on-surface-variant overflow-hidden border border-[#ffffff]/10">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[24px] text-outline">account_circle</span>
                )}
              </div>
            </div>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-[#11192e] border border-[#ffffff]/10 rounded-2xl shadow-2xl z-50 py-2">
                <div className="px-4 py-3 border-b border-[#ffffff]/10 mb-2">
                  <p className="text-xs font-bold text-[#dfe4fe]">{userName}</p>
                  <p className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">
                    {localStorage.getItem("user_tier")?.replace("_", " ") || "Free"} Member
                  </p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 px-4 py-2 hover:bg-[#ffffff]/5 text-[#dfe4fe]/80 hover:text-[#dfe4fe] transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-lg">image</span>
                  Change Photo
                </button>
                <button 
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 hover:bg-[#ffffff]/5 text-[#dfe4fe]/80 hover:text-[#dfe4fe] transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  Settings
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
      </div>
    </header>
  );
}
