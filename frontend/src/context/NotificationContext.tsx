import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import confetti from "canvas-confetti";

type NotificationType = "success" | "error" | "info" | "payment_success";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState<{ message: string; title: string } | null>(null);

  const showNotification = useCallback((type: NotificationType, message: string, title?: string) => {
    if (type === "payment_success") {
      setPaymentSuccess({ message, title: title || "Success!" });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#10b981", "#ffffff"],
      });
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                n.type === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-200"
                  : "bg-surface-container-high/80 border-outline-variant/10 text-on-surface"
              }`}
            >
              <div className="mt-0.5">
                {n.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="flex-grow">
                {n.title && <div className="font-bold text-sm mb-1">{n.title}</div>}
                <div className="text-sm opacity-90">{n.message}</div>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((notif) => notif.id !== n.id))}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Premium Payment Success Modal */}
      <AnimatePresence>
        {paymentSuccess && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#131314] border border-green-500/30 rounded-3xl p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.15)]"
            >
              <div className="mb-6 relative flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"
                />
              </div>

              <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">
                {paymentSuccess.title}
              </h3>
              <p className="font-body text-on-surface-variant mb-8">
                {paymentSuccess.message}
              </p>

              <div className="flex flex-col gap-3">
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="h-full bg-green-500"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-outline opacity-50">
                  Redirecting to dashboard...
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
