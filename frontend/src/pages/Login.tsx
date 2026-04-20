import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/oauth2/authorization/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, { email, password });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_name", response.data.name);
        navigate("/dashboard");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, { name, email, password });
        setIsLogin(true);
        setErrorMsg("Registration successful! Please sign in.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setErrorMsg(`Authentication Failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F111A] text-[#E2E8F0] font-body px-4 selection:bg-primary-container selection:text-on-primary-container overflow-hidden relative">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-dim/10 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="w-full max-w-[440px] z-10 glass-module rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 rounded-t-3xl"></div>
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6 transition-transform hover:scale-105 active:scale-95">
            <div className="text-2xl font-black font-headline text-[#dfe4fe] tracking-tighter">
              ResuMatch AI
            </div>
          </Link>
          <h1 className="text-3xl font-bold font-headline text-white mb-2 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[#a5aac2] text-sm">
            {isLogin ? "Sign in to your curator dashboard" : "Sign up for your curator dashboard"}
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-[#181C2A] text-white border border-[#2A3143] hover:bg-[#202538] hover:border-primary/40 active:bg-[#151923] py-3.5 rounded-xl transition-all duration-200 font-semibold shadow-sm"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="flex items-center my-8">
          <div className="flex-grow border-t border-[#2A3143]"></div>
          <span className="px-4 text-xs font-semibold text-[#6f758b] uppercase tracking-wider">
            Or continue with email
          </span>
          <div className="flex-grow border-t border-[#2A3143]"></div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-error/10 border border-error/50 rounded-lg text-error text-sm text-center font-medium animate-in fade-in zoom-in duration-300">
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#a5aac2] uppercase tracking-wider ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full bg-[#181C2A] border border-[#2A3143] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-[#41475b]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#a5aac2] uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="curator@resumatch.ai"
              className="w-full bg-[#181C2A] border border-[#2A3143] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-[#41475b]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="block text-xs font-bold text-[#a5aac2] uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <Link to="#" className="text-xs font-bold text-primary hover:text-primary-dim transition-colors">
                  Forgot?
                </Link>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#181C2A] border border-[#2A3143] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-[#41475b]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-primary text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all font-headline disabled:opacity-50 mt-4"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#a5aac2]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:text-primary-dim transition-colors ml-1"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
