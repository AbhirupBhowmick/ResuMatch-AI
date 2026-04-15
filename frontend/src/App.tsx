import { Routes, Route, BrowserRouter } from "react-router-dom";
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
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AuthWatcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // 1. Track current path (ignore auth paths)
    if (!["/", "/login"].includes(location.pathname)) {
      localStorage.setItem("lastPath", location.pathname);
    }

    // 2. Auto-login redirect if on landing/login with token
    if (token && ["/", "/login"].includes(location.pathname)) {
      const lastPath = localStorage.getItem("lastPath");
      navigate(lastPath || "/dashboard");
    }
  }, [location, navigate, token]);

  return null;
}

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-primary/30">
      <BrowserRouter>
        <AuthWatcher />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/interview" element={<InterviewPrep />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment-result" element={<AssessmentResult />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
