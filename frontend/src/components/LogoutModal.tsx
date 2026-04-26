import { useEffect } from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-md p-4 font-body">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      {/* Modal Card */}
      <div className="relative z-10 bg-[#1c253e] border-t border-[#41475b]/20 rounded-xl p-8 max-w-sm w-full shadow-[0_0_32px_0_rgba(167,165,255,0.06)] flex flex-col items-center text-center transform scale-100 transition-transform duration-200">
        
        {/* Icon */}
        <div className="w-12 h-12 bg-[#0c1326] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#41475b]/10">
          <span className="material-symbols-outlined text-[#6f758b] text-2xl">logout</span>
        </div>
        
        {/* Text Content */}
        <h2 className="font-headline font-semibold text-2xl text-[#dfe4fe] tracking-tight mb-2">Ready to leave?</h2>
        <p className="font-body text-[#a5aac2] text-sm mb-8 leading-relaxed">
            You are about to log out of your Command Center. Your progress and audits will be safely saved.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row w-full gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-lg font-body font-medium text-[#a7a5ff] border border-[#41475b]/15 hover:bg-[#222b47] transition-colors focus:outline-none focus:ring-2 focus:ring-[#a7a5ff]/50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-lg font-body font-medium bg-[#d73357]/10 text-[#d73357] border border-[#d73357]/20 hover:bg-[#d73357]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#d73357]/50"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
