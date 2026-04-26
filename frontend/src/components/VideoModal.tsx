import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCloseHandler();
      };
      window.addEventListener("keydown", handleKeyDown);
      
      // Auto-play attempt on open
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.error("Autoplay prevented:", e));
      }

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const onCloseHandler = () => {
    setIsVideoFinished(false);
    onClose();
  };

  const handleReplay = () => {
    setIsVideoFinished(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleSignUp = () => {
    onCloseHandler();
    navigate("/login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8 font-body">
      {/* Mesh Background Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(at 40% 20%, hsla(242, 95%, 67%, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(226, 85%, 21%, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(226, 85%, 21%, 0.15) 0px, transparent 50%)
          `
        }}
      />

      {/* Video Container */}
      <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] bg-[#11192e] border border-white/10 group">
        
        {/* Close Button */}
        <button 
          onClick={onCloseHandler}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-[#1c253e]/80 backdrop-blur-sm border border-[#41475b]/20 text-[#dfe4fe] hover:bg-[#222b47] hover:text-[#a7a5ff] transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="w-full h-full relative">
          <video 
            ref={videoRef}
            src="https://www.w3schools.com/html/mov_bbb.mp4" 
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            disablePictureInPicture
            onEnded={() => setIsVideoFinished(true)}
          />

          {/* Post-Roll State Overlay */}
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c1326]/80 backdrop-blur-md p-8 text-center transition-opacity duration-500 ${isVideoFinished ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-[#dfe4fe] tracking-tight mb-4">
              Ready to Master the ATS?
            </h2>
            <p className="font-body text-lg text-[#a5aac2] max-w-2xl mb-8">
              Experience the precision of ResuMatch AI. Optimize your resume for human readers and machine scanners instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button 
                onClick={handleSignUp}
                className="px-8 py-4 bg-[#9795ff] text-[#14007e] rounded-lg font-bold text-sm shadow-[inset_0_2px_4px_rgba(20,0,126,0.3)] hover:brightness-110 transition-all duration-200 flex items-center gap-2"
              >
                <span>Analyze My Resume Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button 
                onClick={handleReplay}
                className="px-8 py-4 bg-transparent border border-[#41475b]/50 text-[#a7a5ff] rounded-lg font-bold text-sm hover:bg-[#222b47] transition-all duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">replay</span>
                <span>Replay Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
