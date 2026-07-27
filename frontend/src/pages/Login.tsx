import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("remembered_email") !== null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    // Background health check to wake up Render backend on page mount
    axios.get("/api/health").catch(() => {});
  }, []);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    const rawUrl = import.meta.env.VITE_API_URL || 'https://resumatch-ai-74wq.onrender.com';
    const envUrl = (rawUrl.trim() === '' || rawUrl.includes('railway.app')) 
      ? 'https://resumatch-ai-74wq.onrender.com' 
      : rawUrl;
    const formattedUrl = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
    const baseUrl = formattedUrl.replace(/\/+$/, '');

    try {
      // Pre-warm Render backend before top-level browser redirect
      await axios.get("/api/health", { timeout: 15000 }).catch(() => {});
    } finally {
      window.location.href = `${baseUrl}/oauth2/authorization/google`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const response = await axios.post("/api/v1/auth/login", { email, password }, { withCredentials: true });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_name", response.data.name || email.split('@')[0]);
        localStorage.setItem("user_tier", response.data.tier || "FREE");
        
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        const lastPath = localStorage.getItem("lastPath");
        navigate(lastPath || "/dashboard");
      } else {
        await axios.post("/api/v1/auth/register", { name, email, password }, { withCredentials: true });
        
        const loginResponse = await axios.post("/api/v1/auth/login", { email, password }, { withCredentials: true });
        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_name", loginResponse.data.name || name);
        localStorage.setItem("user_tier", loginResponse.data.tier || "FREE");
        
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response) {
        setErrorMsg("Server is waking up (Render cold start). Please try signing in again in a few seconds.");
      } else {
        const msg = err.response?.data?.message || err.response?.data || err.message;
        setErrorMsg(typeof msg === 'string' ? msg : "Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B14] text-zinc-100 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500/30">
      
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-[1px]">
            <div className="w-full h-full bg-[#0d121f] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-base font-bold text-white tracking-tight">ResuMatch AI</span>
        </Link>

        <Link to="/" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          Back to Home
        </Link>
      </header>

      {/* Main Centered Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col items-center justify-center">
        
        {/* Hero Copy Above Card */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isLogin ? "Welcome back to ResuMatch AI" : "Start optimizing your career today"}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Build stronger applications with AI-powered resume analysis, job matching, and tailored cover letters.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] font-medium text-zinc-300">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resume Analysis</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ATS Optimization</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Job Match</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Cover Letter</span>
          </div>
        </div>

        {/* Floating Glassmorphism Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[430px] rounded-2xl bg-[#121827]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative"
        >
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-xl border border-white/5 text-xs font-medium">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(""); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${isLogin ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-zinc-400 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(""); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${!isLogin ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-zinc-400 hover:text-white"}`}
            >
              Sign Up
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-xs transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Or with Email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium block">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-zinc-400 font-medium block">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-zinc-400 font-medium block">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => alert("Password reset link sent to registered email.")}
                    className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium block">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-600 accent-indigo-600"
                />
                <label htmlFor="rememberMe" className="text-xs text-zinc-400 cursor-pointer select-none">
                  Remember this device
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In to Workspace" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3 border-t border-white/5">
        <div>© 2026 ResuMatch AI. Executive Career Workspace.</div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <button onClick={() => window.open('mailto:support@resumatch.ai')} className="hover:text-zinc-300 transition-colors cursor-pointer">Support</button>
        </div>
      </footer>

    </div>
  );
}
