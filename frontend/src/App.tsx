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

import CoverLetter from "./pages/CoverLetter";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";

function AuthWatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Capture and persist tokens IMMEDATELY
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
      
      // Navigate to dashboard and strip params from URL
      navigate("/dashboard", { replace: true });
      return;
    }

    // 2. Track current path (ignore auth paths)
    if (!["/", "/login"].includes(location.pathname)) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // 3. Auto-login redirect if on landing/login with token
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

  // If no token in storage AND no token in current URL params, redirect
  if (!token && !urlToken) {
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
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
