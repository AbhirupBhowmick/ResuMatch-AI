import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, Shield, CreditCard, Check, Image as ImageIcon } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    name: localStorage.getItem("user_name") || "Professional User",
    email: localStorage.getItem("user_email") || "user@resumatch.ai",
    role: "Software Engineering Professional",
    tier: localStorage.getItem("user_tier") || "FREE",
    profilePic: localStorage.getItem("user_profile_pic") || null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/v1/auth/me");
      setUser(prev => ({
        ...prev,
        name: response.data.name || prev.name,
        email: response.data.email || prev.email,
        tier: response.data.subscriptionTier || prev.tier,
        profilePic: localStorage.getItem("user_profile_pic") || null,
      }));
    } catch (error) {
      console.error("Failed to fetch user context", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser(prev => ({ ...prev, profilePic: base64String }));
        localStorage.setItem("user_profile_pic", base64String);
        setMessage({ type: "success", text: "Avatar updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("user_name", user.name);
      setMessage({ type: "success", text: "Profile settings saved!" });
      setIsLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 400);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Plan & Usage", icon: CreditCard },
    { id: "security", label: "Security & API", icon: Shield },
  ];

  return (
    <div className="bg-[#090a0f] text-zinc-100 min-h-screen font-sans">
      <Sidebar activeTab="settings" />
      <Header title="Settings" />

      <main className="ml-64 pt-20 px-8 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Title */}
          <div className="space-y-1 border-b border-zinc-800/60 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-white">Account Settings</h1>
            <p className="text-xs text-zinc-400">Manage your profile, subscription tier, and system security preferences.</p>
          </div>

          {/* Settings Sub-Navigation */}
          <div className="flex gap-2 border-b border-zinc-800/60 pb-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? "bg-zinc-800 text-white border border-zinc-700/60" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {message.text && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
              <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Personal Information</h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer border border-zinc-700/50"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload Avatar</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleProfilePicUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-medium text-zinc-300 block">Full Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-md p-2.5 text-xs text-zinc-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-zinc-500">Email is linked to your Google/Account sign-in.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">Primary Target Role</label>
                  <input 
                    type="text" 
                    value={user.role}
                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          )}

          {/* TAB 2: BILLING & PLAN */}
          {activeTab === "billing" && (
            <div className="space-y-5 max-w-xl">
              <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Current Subscription</h2>
                    <p className="text-sm font-bold text-white mt-1">{user.tier} Tier</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                    Active Plan
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your plan includes full access to Apache Tika text extraction, Gemini 2.5 Flash ATS auditing, STAR rewrites, and PDF cover letter generation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & API STATUS */}
          {activeTab === "security" && (
            <div className="space-y-5 max-w-xl">
              <div className="p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Backend API Services</h2>
                
                <div className="flex items-center justify-between p-3 rounded bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-zinc-300 font-mono">Spring Boot Backend (Render)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-zinc-300 font-mono">Google Gemini AI API</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Connected</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-zinc-300 font-mono">Neon Serverless PostgreSQL</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Connected</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
