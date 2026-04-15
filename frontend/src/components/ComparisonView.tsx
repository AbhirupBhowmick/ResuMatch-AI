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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-body"
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
            className="relative w-full max-w-5xl bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Signature Glass Edge */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent"></div>

            {/* Header */}
            <div className="px-10 pt-10 pb-6 text-center flex-shrink-0">
              <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                Optimization Comparison
              </h2>
              <p className="text-on-surface-variant mt-2 font-medium">
                Review how AI transformed your resume bullets for maximum impact
              </p>
            </div>

            {/* Comparison Content — Scrollable */}
            <div className="flex-1 overflow-y-auto px-10 pb-10">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Column 1: Original */}
                <div className="flex-1 bg-red-500/10 rounded-xl border-t border-red-500/20 relative group px-8 pb-8 pt-14 min-h-[300px]">
                  <div className="absolute left-6 top-4 px-4 py-1.5 bg-red-900/60 text-red-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/40 flex items-center justify-center backdrop-blur-sm z-10">
                    Original
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400">block</span>
                    Passive Phrasing
                  </h3>
                  <div className="space-y-6">
                    {isLoading ? (
                      <div className="space-y-6 animate-pulse">
                        <div className="flex gap-4 items-start">
                          <div className="w-6 h-6 mt-1 rounded bg-red-500/20"></div>
                          <div className="h-4 w-full bg-red-500/10 rounded"></div>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="w-6 h-6 mt-1 rounded bg-red-500/20"></div>
                          <div className="h-4 w-3/4 bg-red-500/10 rounded"></div>
                        </div>
                      </div>
                    ) : (
                      comparisons.map((item, idx) => (
                        <motion.div
                          key={idx}
                          className="flex gap-4 items-start group/item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.15 }}
                        >
                          <span className="material-symbols-outlined text-red-500/40 text-sm mt-1">remove_circle</span>
                          <p className={`text-sm text-red-200/70 leading-relaxed italic`}>
                            {item.original}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: AI Optimized */}
                <div className="flex-1 bg-surface-container-high rounded-xl border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative px-8 pb-8 pt-14 min-h-[300px]">
                  <div className="absolute left-6 top-4 px-4 py-1.5 bg-emerald-900/80 text-emerald-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center backdrop-blur-sm z-10">
                    AI Optimized
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">bolt</span>
                    High Impact (STAR)
                  </h3>
                  <div className="space-y-6">
                    {isLoading ? (
                      <div className="space-y-6 animate-pulse">
                        <div className="h-20 w-full bg-emerald-500/5 rounded-lg"></div>
                        <div className="flex gap-4 items-start">
                          <div className="w-6 h-6 mt-1 rounded bg-emerald-500/20"></div>
                          <div className="h-4 w-full bg-emerald-500/10 rounded"></div>
                        </div>
                      </div>
                    ) : (
                      comparisons.map((item, idx) => (
                        <motion.div
                          key={idx}
                          className="flex gap-4 items-start bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-default"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.2 }}
                        >
                          <span className="material-symbols-outlined text-emerald-400 text-sm mt-1">check_circle</span>
                          <p className="text-sm text-on-surface leading-relaxed font-medium">
                            {highlightMetrics(item.improved)}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
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
                className="text-slate-500 hover:text-slate-300 font-label text-sm transition-colors cursor-pointer"
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
