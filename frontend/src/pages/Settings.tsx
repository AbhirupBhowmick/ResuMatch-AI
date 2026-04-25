import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    name: localStorage.getItem("user_name") || "",
    email: localStorage.getItem("user_email") || "",
    role: "Full Stack Developer",
    tier: "FREE",
    bio: "Passionate about building scalable AI systems and intuitive user interfaces.",
    profilePic: localStorage.getItem("user_profile_pic") || null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({
        ...prev,
        name: response.data.name,
        email: response.data.email,
        tier: response.data.subscriptionTier || "FREE",
        profilePic: localStorage.getItem("user_profile_pic") || null,
      }));
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser(prev => ({ ...prev, profilePic: base64String }));
        localStorage.setItem("user_profile_pic", base64String);
        setMessage({ type: "success", text: "Profile picture updated!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mimic API call
    setTimeout(() => {
      localStorage.setItem("user_name", user.name);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 800);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "billing", label: "Billing & Plan", icon: "credit_card" },
    { id: "preferences", label: "AI Preferences", icon: "auto_awesome" },
    { id: "security", label: "Security", icon: "security" },
    { id: "data", label: "Data Privacy", icon: "encrypted" },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-[#dfe4fe] font-sans selection:bg-primary/30">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col relative">
        <Header title="Settings" />
        
        <main className="flex-1 p-8 pt-24 max-w-5xl mx-auto w-full">
          {/* Settings Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-[#dfe4fe] to-[#dfe4fe]/60 bg-clip-text text-transparent">Settings</h2>
            <p className="text-[#dfe4fe]/50">Manage your account, subscription, and AI preferences.</p>
          </div>

          <div className="flex gap-12">
            {/* Sidebar Tabs */}
            <aside className="w-64 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    activeTab === tab.id 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-[#dfe4fe]/50 hover:text-[#dfe4fe] hover:bg-[#ffffff]/5"
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? "text-primary" : ""}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <div className="flex-1 bg-[#11192e]/40 backdrop-blur-xl border border-[#ffffff]/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

              {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                  message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  <span className="material-symbols-outlined">{message.type === "success" ? "check_circle" : "error"}</span>
                  {message.text}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined">person</span>
                    Profile Information
                  </h3>
                  
                  {/* Profile Picture Section */}
                  <div className="flex items-center gap-6 mb-10 p-6 bg-[#070d1f] rounded-2xl border border-[#ffffff]/5">
                    <div className="relative group/pic">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-[#171f36] flex items-center justify-center">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-[#dfe4fe]/20">account_circle</span>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/pic:opacity-100 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleProfilePicUpload} 
                        className="hidden" 
                        accept="image/*" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{user.name}</h4>
                      <p className="text-xs text-[#dfe4fe]/40 mb-3">{user.email}</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-black text-primary hover:underline"
                      >
                        Change Avatar
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[#dfe4fe]/40">Full Name</label>
                        <input 
                          type="text" 
                          value={user.name}
                          onChange={(e) => setUser({...user, name: e.target.value})}
                          className="w-full bg-[#070d1f] border border-[#ffffff]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[#dfe4fe]/40">Email Address</label>
                        <input 
                          type="email" 
                          value={user.email}
                          disabled
                          className="w-full bg-[#070d1f]/50 border border-[#ffffff]/5 rounded-xl px-4 py-3 text-sm text-[#dfe4fe]/40 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#dfe4fe]/40">Current Role/Target</label>
                      <input 
                        type="text" 
                        value={user.role}
                        onChange={(e) => setUser({...user, role: e.target.value})}
                        className="w-full bg-[#070d1f] border border-[#ffffff]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#dfe4fe]/40">Professional Bio</label>
                      <textarea 
                        rows={4}
                        value={user.bio}
                        onChange={(e) => setUser({...user, bio: e.target.value})}
                        className="w-full bg-[#070d1f] border border-[#ffffff]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-black text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2 group"
                      >
                        {isLoading ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <>
                            Save Changes
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined">credit_card</span>
                    Subscription Plan
                  </h3>
                  
                  <div className="bg-[#171f36]/50 rounded-2xl p-6 border border-primary/20 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <span className="material-symbols-outlined text-8xl">diamond</span>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                          {user.tier} PLAN
                        </span>
                        <h4 className="text-2xl font-black">{user.tier === 'FREE' ? 'Standard Access' : 'Premium Pro'}</h4>
                        <p className="text-[#dfe4fe]/50 text-sm mt-1">Your subscription is active and in good standing.</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black">$0<span className="text-sm font-normal text-[#dfe4fe]/40">/mo</span></div>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Next reset: May 01</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => window.location.href = "/#pricing"}
                        className="bg-white text-[#11192e] px-6 py-2.5 rounded-full font-black text-xs hover:bg-[#dfe4fe] transition-all"
                      >
                        Compare Plans
                      </button>
                      {user.tier === 'FREE' && (
                        <button 
                          onClick={() => window.location.href = "/#pricing"}
                          className="bg-primary/20 text-primary border border-primary/30 px-6 py-2.5 rounded-full font-black text-xs hover:bg-primary/30 transition-all"
                        >
                          Upgrade Now
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-black uppercase tracking-widest text-[#dfe4fe]/40 mb-4">Billing History</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 rounded-xl border border-[#ffffff]/5 hover:bg-[#ffffff]/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#ffffff]/5 flex items-center justify-center text-[#dfe4fe]/60">
                          <span className="material-symbols-outlined text-xl">description</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">April 2026 Invoice</p>
                          <p className="text-[10px] text-[#dfe4fe]/40">Processed on Apr 01, 2026</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#dfe4fe]/60">-$0.00</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined">auto_awesome</span>
                    AI Preferences
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="flex items-center justify-between group">
                      <div>
                        <h4 className="font-bold text-sm">Deep Audit Analysis</h4>
                        <p className="text-xs text-[#dfe4fe]/40 mt-1">Enable more thorough AI scanning (uses 2x credits).</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#070d1f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#dfe4fe]/60 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-[#ffffff]/10"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm">Tone Preference</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['Professional', 'Creative', 'Academic'].map((tone) => (
                          <button key={tone} className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${tone === 'Professional' ? 'bg-primary/20 border-primary/40 text-primary' : 'border-[#ffffff]/10 hover:border-primary/20 hover:bg-primary/5 text-[#dfe4fe]/60 hover:text-primary'}`}>
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm">Target Industry Focus</h4>
                      <select className="w-full bg-[#070d1f] border border-[#ffffff]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer">
                        <option>Technology & Software</option>
                        <option>Finance & Banking</option>
                        <option>Healthcare</option>
                        <option>Engineering</option>
                        <option>Creative Arts</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined">security</span>
                    Security
                  </h3>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#dfe4fe]/40">Password Management</h4>
                      <p className="text-xs text-[#dfe4fe]/60">Change your password regularly to keep your data secure.</p>
                      <button className="bg-[#171f36] hover:bg-[#1f2945] text-[#dfe4fe] px-6 py-2.5 rounded-full font-black text-xs flex items-center gap-2 transition-all border border-[#ffffff]/10">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Modify Password
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#dfe4fe]/40">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">verified_user</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary">2FA is Not Enabled</p>
                            <p className="text-[10px] text-[#dfe4fe]/50">Enhance your security by adding an extra layer.</p>
                          </div>
                        </div>
                        <button className="text-xs font-black text-primary hover:underline">Enable Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined">encrypted</span>
                    Data Privacy
                  </h3>
                  
                  <div className="space-y-10">
                    <div className="p-4 rounded-2xl bg-[#070d1f] border border-[#ffffff]/5">
                      <h4 className="font-bold text-sm mb-2">GDPR Compliance</h4>
                      <p className="text-xs text-[#dfe4fe]/40 leading-relaxed">We process your data according to strictly established privacy norms. Your files are automatically purged following audit analysis completion.</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-rose-500/60">Danger Zone</h4>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-rose-500/10 hover:bg-rose-500/5 transition-all group">
                          <div>
                            <p className="text-sm font-bold text-rose-400">Clear Audit History</p>
                            <p className="text-[10px] text-rose-500/40">This will permanently delete all your previous resume audits.</p>
                          </div>
                          <span className="material-symbols-outlined text-rose-500 group-hover:scale-110 transition-transform">delete_sweep</span>
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-rose-500/10 hover:bg-rose-500/5 transition-all group">
                          <div>
                            <p className="text-sm font-bold text-rose-400">Delete Account</p>
                            <p className="text-[10px] text-rose-500/40">Once you delete your account, there is no going back.</p>
                          </div>
                          <span className="material-symbols-outlined text-rose-500 group-hover:scale-110 transition-transform">close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
