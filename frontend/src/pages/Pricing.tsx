import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";

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
  const { showNotification } = useNotification();

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
    showNotification("error", "Your session has expired. Please log in again to continue.", "Session Expired");
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
        showNotification("info", "Payment gateway is still loading. Please wait a moment.");
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

            showNotification("payment_success", `Welcome to the ${planName.replace("_", " ")} Plan!`, "Payment Successful!");
            
            // Add a slight delay for celebration
            setTimeout(() => {
              navigate("/dashboard");
            }, 2500);
          } catch (error: any) {
            console.error("Verification failed:", error);
            if (error.response) {
              console.error("Error Details:", error.response.data);
            }
            showNotification("info", "Verification failed but payment was made. Please check your Dashboard in a moment.");
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
        showNotification("error", response.error.description, "Payment Failed");
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
      showNotification("error", errorMsg, "System Error");
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-32 relative overflow-hidden font-body bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-dim/15 via-background to-background pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-6">Simple, transparent pricing</h1>
          <p className="text-lg font-body text-on-surface-variant max-w-2xl mx-auto">Elevate your professional narrative with our curated AI tools. Choose the plan that fits your career trajectory.</p>
          {isPremium && (
            <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-sm font-bold text-primary">
                You are on the <span className="uppercase">{currentTier.replace("_", " ")}</span> plan
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* FREE TIER */}
          <PricingCard 
            name="Free"
            tierKey="FREE"
            price="0"
            features={[
              { text: "1 Resume Audit", included: true },
              { text: "Basic ATS Score", included: true },
              { text: "Top 3 Suggestions", included: true },
              { text: "Export to PDF", included: false }
            ]}
            buttonConfig={getButtonConfig("FREE", "Current Plan")}
            onBuy={() => navigate("/dashboard")}
            isCurrentTier={isCurrentTier("FREE")}
          />

          {/* STARTER TIER */}
          <PricingCard 
            name="Starter"
            tierKey="STARTER"
            price="19"
            features={[
              { text: "5 Deep-Dive Audits", included: true },
              { text: "Keyword optimization", included: true },
              { text: "ATS compatibility score", included: true },
              { text: "Email support", included: true }
            ]}
            buttonConfig={getButtonConfig("STARTER", "Buy Starter")}
            onBuy={() => handlePayment(19, "STARTER")}
            isCurrentTier={isCurrentTier("STARTER")}
          />

          {/* ACTIVE_HUNTER TIER */}
          <PricingCard 
            name="Active Hunter"
            tierKey="ACTIVE_HUNTER"
            price="59"
            recommended
            features={[
              { text: "Unlimited Resume Audits", included: true },
              { text: "Cover Letter Generator", included: true },
              { text: "LinkedIn Profile Analysis", included: true },
              { text: "Priority Support", included: true }
            ]}
            buttonConfig={getButtonConfig("ACTIVE_HUNTER", "Upgrade Now")}
            onBuy={() => handlePayment(59, "ACTIVE_HUNTER")}
            isCurrentTier={isCurrentTier("ACTIVE_HUNTER")}
          />

          {/* PRO_ACHIEVER TIER */}
          <PricingCard 
            name="Pro Achiever"
            tierKey="PRO_ACHIEVER"
            price="99"
            features={[
              { text: "Everything in Hunter", included: true },
              { text: "Mock Interview AI Bot", included: true },
              { text: "Rank Predictor", included: true },
              { text: "Multi-Format Export", included: true }
            ]}
            buttonConfig={getButtonConfig("PRO_ACHIEVER", "Get Everything")}
            onBuy={() => handlePayment(99, "PRO_ACHIEVER")}
            isCurrentTier={isCurrentTier("PRO_ACHIEVER")}
          />
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
      </div>
    </section>
  );
};

interface ButtonConfig {
  text: string;
  disabled: boolean;
  style: "active" | "included" | "buy";
}

const PricingCard = ({ name, price, features, onBuy, buttonConfig, recommended, isCurrentTier }: {
  name: string;
  tierKey: string;
  price: string;
  features: { text: string; included: boolean }[];
  onBuy: () => void;
  buttonConfig: ButtonConfig;
  recommended?: boolean;
  isCurrentTier: boolean;
}) => {
  const cardContent = (
    <div className={`bg-surface-container-low rounded-xl p-8 flex flex-col h-full relative ${recommended ? 'z-10' : 'border-t border-outline-variant/20'}`}>
      <div className="flex justify-between items-center mb-4 min-h-[32px]">
        <h3 className={`font-headline text-xl font-semibold ${recommended ? 'text-primary' : 'text-on-surface'}`}>{name}</h3>
        {isCurrentTier && (
          <span className="inline-flex items-center px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">Your Plan</span>
        )}
        {!isCurrentTier && recommended && (
          <span className="inline-flex items-center px-2 py-1 rounded bg-primary-dim/20 text-primary-dim text-xs font-bold uppercase tracking-wider">Most Popular</span>
        )}
      </div>
      <div className="mb-6">
        <span className="text-4xl font-headline font-bold text-on-surface">₹{price}</span>
        <span className="text-sm text-on-surface-variant">/mo</span>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <span className={`material-symbols-outlined text-[20px] mr-3 mt-0.5 ${feature.included ? 'text-primary' : 'text-outline/50 opacity-50'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {feature.included ? 'check_circle' : 'cancel'}
            </span>
            <span className={`text-sm ${feature.included ? 'text-on-surface' : 'text-on-surface-variant opacity-50 line-through decoration-1'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      <button 
        onClick={buttonConfig.disabled ? undefined : onBuy}
        disabled={buttonConfig.disabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all text-sm tracking-wide ${
          buttonConfig.style === "active" 
            ? 'border-2 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 cursor-default'
            : buttonConfig.style === "included"
              ? 'border border-emerald-500/20 text-emerald-400/60 bg-surface-container/50 cursor-default'
              : recommended
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[inset_0_2px_4px_rgba(20,0,126,0.3)] hover:brightness-110 active:scale-95'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95 border border-outline-variant/20 tracking-normal'
        }`}
      >
        {buttonConfig.text}
      </button>
    </div>
  );

  if (recommended) {
    return (
      <div className="relative p-[1px] rounded-xl bg-gradient-to-b from-primary to-surface-container-low shadow-[0_0_32px_rgba(167,165,255,0.15)] flex flex-col h-full">
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

export default Pricing;
