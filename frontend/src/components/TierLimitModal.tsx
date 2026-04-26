import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface TierLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function TierLimitModal({ isOpen, onClose, message }: TierLimitModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-container-lowest/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="modal-glass max-w-md w-full rounded-2xl p-8 text-center flex flex-col items-center gap-6 relative"
          >
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>lock_clock</span>
            </div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline uppercase leading-none">Tier Limit Reached</h3>
              <p className="text-on-surface-variant leading-relaxed font-body text-sm font-medium">
                {message || "You have reached your limit for this month."}
              </p>
            </div>
            
            <div className="flex flex-col w-full gap-3 relative z-10 mt-2">
              <button 
                onClick={() => {
                  onClose();
                  navigate("/pricing");
                }}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-[0_8px_16px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                View Premium Plans
              </button>
              <button 
                onClick={onClose}
                className="w-full text-on-surface-variant hover:text-on-surface font-semibold text-xs py-2 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
