import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type TierName = "FREE" | "STARTER" | "ACTIVE_HUNTER" | "PRO_ACHIEVER" | "ELITE";

const TIER_ORDER: TierName[] = ["FREE", "STARTER", "ACTIVE_HUNTER", "PRO_ACHIEVER", "ELITE"];

const Pricing = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<TierName>("FREE");
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Fetch current user tier from backend
  useEffect(() => {
    if (!token) return;
    
    const fetchTier = async () => {
      try {
        const response = await axios.get("/api/v1/user/usage", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tier = response.data.tier as TierName;
        setCurrentTier(tier);
        setIsPremium(tier !== "FREE");
      } catch (err: any) {
        console.error("Failed to fetch user tier:", err);
        if (err.response && err.response.status === 401) {
          handleLogout();
          return;
        }
        // Fallback: try /api/v1/auth/me
        try {
          const meResp = await axios.get("/api/v1/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const tier = meResp.data.subscriptionTier as TierName;
          setCurrentTier(tier);
          setIsPremium(tier !== "FREE");
        } catch (meError: any) {
          console.error("Could not fetch user info at all");
          if (meError.response && meError.response.status === 401) {
            handleLogout();
          }
        }
      }
    };
    
    fetchTier();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_tier");
    alert("Your session has expired. Please log in again to continue.");
    navigate("/login");
  };

  // Helper: is this tier at or below current?
  const isTierOwned = (cardTier: TierName) => {
    return TIER_ORDER.indexOf(cardTier) <= TIER_ORDER.indexOf(currentTier);
  };

  const isCurrentTier = (cardTier: TierName) => {
    return cardTier === currentTier;
  };

  // Get button text based on user's tier vs card tier
  const getButtonConfig = (cardTier: TierName, defaultBuyText: string) => {
    if (isCurrentTier(cardTier)) {
      return { text: "✓ Current Plan", disabled: true, style: "active" as const };
    }
    if (isTierOwned(cardTier)) {
      return { text: "✓ Included", disabled: true, style: "included" as const };
    }
    // If the card tier is lower than current tier
    if (TIER_ORDER.indexOf(cardTier) < TIER_ORDER.indexOf(currentTier)) {
      return { text: "✓ Included", disabled: true, style: "included" as const };
    }
    return { text: defaultBuyText, disabled: false, style: "buy" as const };
  };

  const handlePayment = async (amountInRupees: number, planName: string) => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      if (!scriptLoaded || !window.Razorpay) {
        alert("Payment gateway is still loading. Please wait a moment.");
        return;
      }

      setLoading(true);

      const response = await axios.post("/api/v1/payments/create-order", {
        planId: planName,
        amount: amountInRupees
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderData = response.data;

      const options = {
        key: "rzp_test_SbLtEkEnC0pYEr",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ResuMatch AI",
        description: `Subscription for ${planName} Plan`,
        order_id: orderData.orderId,
        handler: async function (paymentResponse: any) {
          try {
            setLoading(true);
            await axios.post("/api/v1/payments/verify", {
              paymentId: paymentResponse.razorpay_payment_id,
              orderId: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
              email: localStorage.getItem("user_email")
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            // Immediately update local state to reflect the new tier
            setCurrentTier(planName as TierName);
            setIsPremium(true);
            localStorage.setItem("user_tier", planName);

            alert("🎉 Payment Successful! Your plan has been upgraded to " + planName.replace("_", " ") + ".");
            navigate("/dashboard");
          } catch (error: any) {
            console.error("Verification failed:", error);
            if (error.response) {
              console.error("Error Details:", error.response.data);
            }
            alert("Verification failed but payment was made. Please check your Dashboard in a moment.");
            navigate("/dashboard");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem("user_name") || "User",
          email: localStorage.getItem("user_email") || "user@example.com",
          contact: "+919330789221",
          method: "upi"
        },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss: function() { setLoading(false); },
          backdrop_close: true
        },
        retry: { enabled: false },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI / QR',
                instruments: [{ method: 'upi' }]
              }
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: true }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();
      setLoading(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
        return;
      }
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      alert(`Payment Initialization Failed: ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070d1f] text-[#dfe4fe] min-h-screen font-body selection:bg-primary/30">
      <Sidebar />
      <Header title="Invest in Your Career" />

      <main className="lg:ml-64 pt-24 px-8 pb-20">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black mb-4 font-headline tracking-tight">Simple, transparent <span className="text-primary">pricing</span></h2>
          <p className="text-[#dfe4fe]/60 max-w-2xl mx-auto font-medium">Unlock elite AI interview preparation. Cancel anytime.</p>
          {isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary text-lg">verified</span>
              <span className="text-sm font-bold text-primary">
                You are on the <span className="uppercase">{currentTier.replace("_", " ")}</span> plan
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {/* FREE TIER */}
          <PricingCard 
            name="Free"
            tierKey="FREE"
            price="0"
            description="Perfect for testing the waters."
            features={[
              { text: "1 Resume Audit", included: true },
              { text: "Basic ATS Score", included: true },
              { text: "Top 3 Suggestions", included: true },
              { text: "PDF Downloads", included: false }
            ]}
            buttonConfig={getButtonConfig("FREE", "Current Plan")}
            onBuy={() => navigate("/dashboard")}
            isCurrentTier={isCurrentTier("FREE")}
            isOwned={isTierOwned("FREE")}
          />

          {/* STARTER TIER */}
          <PricingCard 
            name="Starter"
            tierKey="STARTER"
            price="19"
            description="Essential tools for active seekers."
            features={[
              { text: "5 AI Audits", included: true },
              { text: "Full Keyword Analysis", included: true },
              { text: "MCQ Tests (5 Qs)", included: true },
              { text: "Standard PDF Export", included: true }
            ]}
            buttonConfig={getButtonConfig("STARTER", "Buy Starter")}
            onBuy={() => handlePayment(19, "STARTER")}
            isCurrentTier={isCurrentTier("STARTER")}
            isOwned={isTierOwned("STARTER")}
          />

          {/* ACTIVE_HUNTER TIER */}
          <PricingCard 
            name="Active Hunter"
            tierKey="ACTIVE_HUNTER"
            price="59"
            recommended
            description="Our most popular plan for engineers."
            features={[
              { text: "Unlimited AI Audits", included: true },
              { text: "STAR Method Generator", included: true },
              { text: "Dynamic MCQ Assessments", included: true },
              { text: "Priority Support", included: true }
            ]}
            buttonConfig={getButtonConfig("ACTIVE_HUNTER", "Go Unlimited")}
            onBuy={() => handlePayment(59, "ACTIVE_HUNTER")}
            isCurrentTier={isCurrentTier("ACTIVE_HUNTER")}
            isOwned={isTierOwned("ACTIVE_HUNTER")}
          />

          {/* PRO_ACHIEVER TIER */}
          <PricingCard 
            name="Pro Achiever"
            tierKey="PRO_ACHIEVER"
            price="99"
            description="For elite candidates aiming higher."
            features={[
              { text: "Everything in Hunter", included: true },
              { text: "AI Cover Letter Gen", included: true },
              { text: "Rank Predictor", included: true },
              { text: "Multi-Format Export", included: true }
            ]}
            buttonConfig={getButtonConfig("PRO_ACHIEVER", "Get Everything")}
            onBuy={() => handlePayment(99, "PRO_ACHIEVER")}
            isCurrentTier={isCurrentTier("PRO_ACHIEVER")}
            isOwned={isTierOwned("PRO_ACHIEVER")}
          />
        </div>

        {/* Trust Section */}
        <div className="mt-24 text-center">
            <h3 className="text-[#dfe4fe]/40 text-sm font-black uppercase tracking-[0.3em] mb-12">Beyond just keywords. We curate your professional identity.</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto text-left">
                <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-3xl mb-4">leaderboard</span>
                    <h4 className="text-xl font-bold mb-3 font-headline">Rank Prediction</h4>
                    <p className="text-sm text-[#dfe4fe]/60 leading-relaxed font-medium">See how you stack up against 5,000+ candidates for similar roles in our anonymized database.</p>
                </div>
                <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-emerald-400 text-3xl mb-4">auto_awesome</span>
                    <h4 className="text-xl font-bold mb-3 font-headline">STAR Evolution</h4>
                    <p className="text-sm text-[#dfe4fe]/60 leading-relaxed font-medium">Transform boring bullets into high-impact narratives that command attention from hiring managers.</p>
                </div>
            </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-[#070d1f]/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-headline font-bold text-2xl text-[#dfe4fe]">Initializing Secure Checkout...</p>
            <p className="text-[#dfe4fe]/60 text-sm mt-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">lock</span>
              Secure Payment Powered by Razorpay
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

interface ButtonConfig {
  text: string;
  disabled: boolean;
  style: "active" | "included" | "buy";
}

const PricingCard = ({ name, price, description, features, onBuy, buttonConfig, recommended, isCurrentTier, isOwned }: {
  name: string;
  tierKey: string;
  price: string;
  description: string;
  features: { text: string; included: boolean }[];
  onBuy: () => void;
  buttonConfig: ButtonConfig;
  recommended?: boolean;
  isCurrentTier: boolean;
  isOwned: boolean;
}) => (
  <div className={`relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col
    ${isCurrentTier 
      ? 'bg-[#171f36] border-emerald-500 shadow-[0_20px_50px_rgba(16,185,129,0.15)] z-10 ring-2 ring-emerald-500/30' 
      : recommended 
        ? 'bg-[#171f36] border-primary shadow-[0_20px_50px_rgba(79,70,229,0.15)] z-10' 
        : 'bg-[#11192e] border-[#ffffff]/10 hover:border-[#ffffff]/20'
    }`}>
    
    {/* Badge area */}
    {isCurrentTier && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Your Plan
      </div>
    )}
    {!isCurrentTier && recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
        Most Popular
      </div>
    )}

    <div className="mb-6">
      <h3 className="text-lg font-bold mb-1 font-headline">{name}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-black">₹{price}</span>
        <span className="text-[#dfe4fe]/40 text-xs">/mo</span>
      </div>
      <p className="text-xs text-[#dfe4fe]/60 leading-relaxed font-medium h-10">{description}</p>
    </div>
    
    <div className="space-y-3 mb-8 flex-1">
      {features.map((feature, i) => (
        <div key={i} className="flex items-start gap-2.5 group/item">
          <span className={`material-symbols-outlined text-lg transition-transform mt-0.5 group-hover/item:scale-110 ${feature.included ? (isOwned ? 'text-emerald-400' : 'text-primary') : 'text-[#dfe4fe]/20'}`}>
            {feature.included ? 'check_circle' : 'cancel'}
          </span>
          <span className={`text-xs font-medium transition-colors ${feature.included ? 'text-[#dfe4fe]/80 group-hover:text-[#dfe4fe]' : 'text-[#dfe4fe]/40 line-through decoration-1 opacity-50'}`}>{feature.text}</span>
        </div>
      ))}
    </div>

    <button 
      onClick={buttonConfig.disabled ? undefined : onBuy}
      disabled={buttonConfig.disabled}
      className={`w-full py-3.5 rounded-xl font-black text-xs tracking-tight transition-all cursor-pointer
        ${buttonConfig.style === "active" 
          ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 cursor-default' 
          : buttonConfig.style === "included" 
            ? 'bg-[#171f36]/50 text-emerald-400/60 border border-emerald-500/20 cursor-default' 
            : recommended 
              ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95' 
              : 'bg-[#171f36] text-[#dfe4fe] border border-[#ffffff]/10 hover:bg-[#1f2945] active:scale-95'
        }`}
    >
      {buttonConfig.text}
    </button>
  </div>
);

export default Pricing;
