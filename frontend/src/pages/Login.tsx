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
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("remembered_email") !== null);
  
  const navigate = useNavigate();

  useState(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, { email, password }, { withCredentials: true });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_name", response.data.name);
        localStorage.setItem("user_tier", response.data.tier);
        
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        const lastPath = localStorage.getItem("lastPath");
        navigate(lastPath || "/dashboard");
        return;
      } else {
        // Sign Up Flow - Real Backend
        await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, { name, email, password }, { withCredentials: true });
        setIsLogin(true);
        setErrorMsg("Registration successful! Please sign in.");
      }
    } catch (err: any) {
      // Improved error reporting
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setErrorMsg(`Authentication Failed: ${msg}. Check API connection.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d1f] text-[#dfe4fe] font-body selection:bg-primary-container selection:text-primary-fixed">
      {/* TopNavBar */}
      <nav className="w-full sticky top-0 z-50 bg-surface-container transition-colors duration-300 shadow-2xl shadow-primary/5 border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-on-surface font-headline">ResuMatch AI</div>
          <div className="flex gap-6 items-center">
            <Link className="font-headline tracking-tight font-bold text-on-surface-variant hover:text-primary transition-all duration-200 cursor-pointer active:scale-95 text-sm" to="/">Back to Home</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left Panel: Visual */}
        <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-surface items-center justify-center p-12 border-r border-outline-variant/15">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary/5 blur-[100px]"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(var(--color-outline-variant) 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }}></div>
          </div>

          <div className="relative z-10 max-w-lg text-left">
            <div className="mb-8 flex items-center gap-2">
              <div className="h-1 w-12 bg-primary rounded-full"></div>
              <span className="font-headline font-bold text-primary tracking-widest text-xs uppercase">Career Excellence</span>
            </div>
            <h1 className="font-headline text-5xl lg:text-6xl font-extrabold tracking-tighter text-on-surface leading-tight mb-6">
                Join 10,000+ professionals <span className="text-primary-container">optimizing</span> their careers.
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed font-body max-w-md">
                Our AI-driven engine provides high-end, editorial precision for your professional narrative. Step into the future of job matching.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="bg-surface-container-low p-6 rounded-xl border-t border-outline-variant/10 shadow-lg border-x border-outline-variant/5">
                <div className="text-3xl font-headline font-bold text-primary-container">94%</div>
                <div className="text-xs text-on-surface-variant font-bold mt-1 uppercase tracking-wider">Success Rate</div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl border-t border-outline-variant/10 shadow-lg border-x border-outline-variant/5">
                <div className="text-3xl font-headline font-bold text-primary-container">2.4x</div>
                <div className="text-xs text-on-surface-variant font-bold mt-1 uppercase tracking-wider">Salary Growth</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Form */}
        <section className="flex-grow flex items-center justify-center p-6 sm:p-12 md:w-1/2 bg-surface-dim">
          <div className="w-full max-w-md space-y-8 z-10">
            <div className="text-center md:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-on-surface-variant font-body">
                {isLogin ? "Sign in to your curator dashboard" : "Sign up for your curator dashboard"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center w-full">
                <a
                  href={(() => {
                    const envUrl = import.meta.env.VITE_API_URL || '';
                    const baseUrl = envUrl === '' ? '' : (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`);
                    return `${baseUrl}/oauth2/authorization/google`;
                  })()}
                  className="w-full flex items-center justify-center bg-[#131314] text-[#e3e3e3] border border-[#8e918f]/30 font-bold py-4 rounded-full shadow-lg hover:bg-[#2b2b2b] transition-all font-headline"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </a>
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant/15"></div>
                <span className="flex-shrink mx-4 text-outline text-xs uppercase tracking-widest font-bold">Or with Email</span>
                <div className="flex-grow border-t border-outline-variant/15"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-sm text-center">
                    {errorMsg}
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider ml-1" htmlFor="name">Full Name</label>
                    <input required className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body" id="name" placeholder="John Doe" type="text" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider ml-1" htmlFor="email">Email Address</label>
                  <input required className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body" id="email" placeholder="curator@resumatch.ai" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider" htmlFor="password">Password</label>
                    {isLogin && <Link className="text-xs font-bold text-primary hover:text-primary-container transition-colors" to="#">Forgot Password?</Link>}
                  </div>
                  <input required className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body" id="password" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                {isLogin && (
                  <div className="flex items-center space-x-2 border-l-2 border-primary/20 pl-3 py-1">
                    <input 
                      type="checkbox" 
                      id="rememberMe" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container text-primary focus:ring-primary/20 accent-primary"
                    />
                    <label htmlFor="rememberMe" className="text-sm font-body text-on-surface-variant cursor-pointer select-none">
                      Remember this account
                    </label>
                  </div>
                )}

                <button disabled={loading} className="w-full flex items-center justify-center bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] font-headline disabled:opacity-50" type="submit">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <span className="tracking-wide">{isLogin ? "Sign In" : "Sign Up"}</span>
                </button>
              </form>

              <div className="pt-6 text-center">
                <p className="text-on-surface-variant font-body text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline ml-2">
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-surface border-t border-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4">
          <p className="font-body text-xs tracking-wide text-on-surface-variant opacity-70">© 2024 ResuMatch AI. The Digital Curator.</p>
          <div className="flex gap-6">
            <Link className="font-body text-xs tracking-wide text-on-surface-variant opacity-70 hover:text-primary transition-colors" to="#">Privacy Policy</Link>
            <Link className="font-body text-xs tracking-wide text-on-surface-variant opacity-70 hover:text-primary transition-colors" to="#">Terms of Service</Link>
            <Link className="font-body text-xs tracking-wide text-on-surface-variant opacity-70 hover:text-primary transition-colors" to="#">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
