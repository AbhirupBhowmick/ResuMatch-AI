import { motion, AnimatePresence } from "framer-motion";

interface ComparisonItem {
  original: string;
  improved: string;
}

interface ComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  comparisons: ComparisonItem[];
  isConfirming?: boolean;
  isLoading?: boolean;
}

export default function ComparisonView({ isOpen, onClose, onConfirm, comparisons, isConfirming, isLoading }: ComparisonViewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(17, 25, 46, 0.7) 0%, rgba(7, 13, 31, 0.95) 100%)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-5xl bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Glass Edge */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#41475b]/30 to-transparent"></div>

            {/* Dismiss Button */}
            <button
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-[#a5aac2] text-sm">close</span>
            </button>

            {/* Header */}
            <div className="px-10 pt-10 pb-6 text-center flex-shrink-0">
              <h2 className="text-3xl font-headline font-extrabold text-[#dfe4fe] tracking-tight">
                Optimization Comparison
              </h2>
              <p className="text-[#a5aac2] mt-2 font-medium">
                Review how AI transformed your resume bullets for maximum impact
              </p>
            </div>

            {/* Comparison Content — Scrollable */}
            <div className="flex-1 overflow-y-auto px-10 pb-4">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Column 1: Original */}
                <div className="flex-1 bg-red-500/10 rounded-xl border-t border-red-500/20 relative px-8 pb-8 pt-12">
                  <div className="absolute left-6 top-3 px-4 py-1.5 bg-red-900/60 text-red-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/40 flex items-center justify-center backdrop-blur-sm">
                    Original
                  </div>
                  <h3 className="text-xl font-headline font-bold text-[#dfe4fe] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400">block</span>
                    Passive Phrasing
                  </h3>
                  <ul className="space-y-6">
                    {isLoading ? (
                      [1, 2, 3].map(i => (
                        <li key={i} className="flex gap-4 items-start animate-pulse">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 mt-1"></div>
                          <div className="flex-1 space-y-2">
                             <div className="h-3 bg-red-500/10 rounded w-full"></div>
                             <div className="h-3 bg-red-500/10 rounded w-[80%]"></div>
                          </div>
                        </li>
                      ))
                    ) : (
                      comparisons.map((item, idx) => (
                        <motion.li
                          key={idx}
                          className={`flex gap-4 items-start ${idx === comparisons.length - 1 ? "opacity-40" : ""}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: idx === comparisons.length - 1 ? 0.4 : 1, x: 0 }}
                          transition={{ delay: idx * 0.15 }}
                        >
                          <span className="material-symbols-outlined text-red-500/50 mt-1">remove</span>
                          <p className={`text-[#a5aac2] leading-relaxed ${idx === comparisons.length - 1 ? "italic" : ""}`}>
                            {item.original}
                          </p>
                        </motion.li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Column 2: AI Optimized */}
                <div className="flex-1 bg-[#171f36] rounded-xl border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative px-8 pb-8 pt-12">
                  <div className="absolute left-6 top-3 px-4 py-1.5 bg-emerald-900/80 text-emerald-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center backdrop-blur-sm">
                    AI Optimized
                  </div>
                  <h3 className="text-xl font-headline font-bold text-[#dfe4fe] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">bolt</span>
                    High Impact (STAR)
                  </h3>
                  <ul className="space-y-6">
                    {isLoading ? (
                      [1, 2, 3, 4].map(i => (
                        <li key={i} className="flex gap-4 items-start animate-pulse">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 mt-1"></div>
                          <div className="flex-1 space-y-2">
                             <div className="h-3 bg-emerald-500/20 rounded w-full"></div>
                             <div className="h-4 bg-emerald-500/10 rounded w-[90%]"></div>
                             <div className="h-3 bg-emerald-500/10 rounded w-[70%]"></div>
                          </div>
                        </li>
                      ))
                    ) : (
                      comparisons.map((item, idx) => (
                        <motion.li
                          key={idx}
                          className={`flex gap-4 items-start ${idx === 0 ? "bg-emerald-500/5 p-4 rounded-lg -m-4" : ""}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.2 }}
                        >
                          <span className="material-symbols-outlined text-emerald-400 mt-1">done_all</span>
                          <p className="text-[#dfe4fe] leading-relaxed">
                            {highlightMetrics(item.improved)}
                          </p>
                        </motion.li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-10 bg-slate-950/30 flex flex-col items-center gap-6 border-t border-slate-800/40 flex-shrink-0">
              <motion.button
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold text-lg rounded-full shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Saving to Profile...
                  </>
                ) : (
                  <>
                    Confirm & Save to Profile
                    <span className="material-symbols-outlined">save</span>
                  </>
                )}
              </motion.button>
              <button
                className="text-slate-500 hover:text-slate-300 font-body text-sm transition-colors cursor-pointer"
                onClick={onClose}
              >
                Discard changes and go back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Highlight numbers and percentages in emerald */
function highlightMetrics(text: string): React.ReactNode {
  const parts = text.split(/(\d+%?|\$\d+[kK]?)/g);
  return parts.map((part, i) => {
    if (/\d+%?|\$\d+[kK]?/.test(part)) {
      return (
        <span key={i} className="font-bold text-emerald-400">
          {part}
        </span>
      );
    }
    return part;
  });
}
