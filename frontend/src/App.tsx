import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate, useLocation, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import CoverLetter from "./pages/CoverLetter";
import Settings from "./pages/Settings";
import JobMatch from "./pages/JobMatch";

function AuthWatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      const urlName = params.get("name");
      const urlEmail = params.get("email");
      const urlTier = params.get("tier");
      
      if (urlName) localStorage.setItem("user_name", urlName);
      if (urlEmail) localStorage.setItem("user_email", urlEmail);
      if (urlTier) localStorage.setItem("user_tier", urlTier);
      
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!["/", "/login"].includes(location.pathname)) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && ["/", "/login"].includes(location.pathname)) {
      const lastPath = localStorage.getItem("lastPath");
      navigate(lastPath || "/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const urlToken = params.get("token");

  if (!token && !urlToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <div className="dark min-h-screen bg-[#0b0f17] text-zinc-100 selection:bg-indigo-500/30">
      <BrowserRouter>
        <AuthWatcher />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/job-match" element={<ProtectedRoute><JobMatch /></ProtectedRoute>} />
          <Route path="/job-tailor" element={<ProtectedRoute><JobMatch /></ProtectedRoute>} />
          <Route path="/cover-letter" element={<ProtectedRoute><CoverLetter /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
