import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate, useLocation, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import InterviewPrep from "./pages/InterviewPrep";
import Assessment from "./pages/Assessment";
import AssessmentResult from "./pages/AssessmentResult";
import Pricing from "./pages/Pricing";
import CoverLetter from "./pages/CoverLetter";
import Settings from "./pages/Settings";

function AuthWatcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // 1. Check for token in URL (from OAuth2 success redirect)
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const urlName = params.get("name");
    const urlEmail = params.get("email");
    const urlTier = params.get("tier");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      if (urlName) localStorage.setItem("user_name", urlName);
      if (urlEmail) localStorage.setItem("user_email", urlEmail);
      if (urlTier) localStorage.setItem("user_tier", urlTier);
      
      // Clean URL and navigate to dashboard
      navigate("/dashboard", { replace: true });
      return;
    }

    // 2. Track current path (ignore auth paths)
    if (!["/", "/login", "/pricing"].includes(location.pathname)) {
      localStorage.setItem("lastPath", location.pathname);
    }

    // 3. Auto-login redirect if on landing/login with token
    if (token && ["/", "/login"].includes(location.pathname)) {
      const lastPath = localStorage.getItem("lastPath");
      navigate(lastPath || "/dashboard", { replace: true });
    }
  }, [location, navigate, token]);

  return null;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-primary/30">
      <BrowserRouter>
        <AuthWatcher />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/assessment-result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/cover-letter" element={<ProtectedRoute><CoverLetter /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
