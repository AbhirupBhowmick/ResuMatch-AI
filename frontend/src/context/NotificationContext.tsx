import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type NotificationType = "success" | "error" | "info";

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

  const showNotification = useCallback((type: NotificationType, message: string, title?: string) => {
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
