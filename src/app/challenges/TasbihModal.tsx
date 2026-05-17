"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { X } from "lucide-react";

interface TasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName?: string;
}

export default function TasbihModal({
  isOpen,
  onClose,
  taskName,
}: TasbihModalProps) {
  const [count, setCount] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [ripple, setRipple] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasShownCelebration = useRef(false);

  // Load count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem("tasbih-count");

    if (savedCount) {
      setCount(Number(savedCount));
    }
  }, []);

  // Save count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tasbih-count", String(count));
  }, [count]);

  // Reset celebration state only when modal opens
  useEffect(() => {
    if (isOpen) {
      setCelebrated(false);
      hasShownCelebration.current = false;
    }
  }, [isOpen]);

  // Fire confetti once when hitting 100
  // useEffect(() => {
  //   if (count === 100 && !hasShownCelebration.current) {
  //     hasShownCelebration.current = true;
  //     setCelebrated(true);

  //     const fire = (particleRatio: number, opts: confetti.Options) => {
  //       confetti({
  //         origin: { y: 0.7 },
  //         ...opts,
  //         particleCount: Math.floor(200 * particleRatio),
  //       });
  //     };

  //     fire(0.25, {
  //       spread: 26,
  //       startVelocity: 55,
  //       colors: ["#f59e0b", "#d97706", "#fbbf24"],
  //     });
  //     fire(0.2, { spread: 60, colors: ["#10b981", "#34d399", "#6ee7b7"] });
  //     fire(0.35, {
  //       spread: 100,
  //       decay: 0.91,
  //       scalar: 0.8,
  //       colors: ["#f59e0b", "#fbbf24", "#ffffff"],
  //     });
  //     fire(0.1, {
  //       spread: 120,
  //       startVelocity: 25,
  //       decay: 0.92,
  //       scalar: 1.2,
  //       colors: ["#d97706"],
  //     });
  //     fire(0.1, {
  //       spread: 120,
  //       startVelocity: 45,
  //       colors: ["#f59e0b", "#fbbf24"],
  //     });

  //     // Auto-hide celebration message after 4s
  //     setTimeout(() => setCelebrated(false), 4000);
  //   }
  // }, [count]);

  const handlePress = useCallback(() => {
    setCount((c) => c + 1);
    setRipple(true);
    setTimeout(() => setRipple(false), 300);
  }, []);

  const handleReset = () => {
    setCount(0);
    setCelebrated(false);
    hasShownCelebration.current = false;

    localStorage.removeItem("tasbih-count");
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  // Color zones
  const progress = Math.min(count / 100, 1);
  const ringColor =
    count >= 100
      ? "#10b981" // green when done
      : count >= 70
        ? "#f59e0b" // gold approaching
        : "#d97706"; // amber default

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeInOverlay 0.25s ease",
      }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl pb-10 pt-6 px-6 flex flex-col items-center gap-5"
        style={{
          animation: "slideUpModal 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        dir="rtl"
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-800">
              مسبحة إلكترونية
            </h2>
            {taskName && (
              <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                {taskName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-stone-200 absolute top-2.5 left-1/2 -translate-x-1/2" />

        {/* Celebration banner */}
        <div
          className="w-full overflow-hidden transition-all duration-500"
          style={{
            maxHeight: celebrated ? "60px" : "0px",
            opacity: celebrated ? 1 : 0,
          }}
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 text-center">
            <p className="text-emerald-700 text-sm font-semibold">
              🎉 ما شاء الله! أتممت 100 مرة، بارك الله فيك
            </p>
          </div>
        </div>

        {/* Circular progress ring + counter */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 160, height: 160 }}
        >
          <svg width="160" height="160" className="absolute inset-0 -rotate-90">
            {/* Track */}
            <circle
              cx="80"
              cy="80"
              r="54"
              fill="none"
              stroke="#f5f5f4"
              strokeWidth="8"
            />
            {/* Progress */}
            <circle
              cx="80"
              cy="80"
              r="54"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: "stroke-dashoffset 0.3s ease, stroke 0.4s ease",
              }}
            />
          </svg>

          {/* Count display */}
          <div className="flex flex-col items-center z-10">
            <span
              className="text-5xl font-bold leading-none transition-all duration-200"
              style={{ color: ringColor }}
            >
              {count}
            </span>
            <span className="text-[11px] text-stone-400 mt-1">
              {count < 100
                ? `${100 - count} متبقي`
                : `+ ${count - 100} بعد المئة`}
            </span>
          </div>
        </div>

        {/* Big fingerprint tap button */}
        <div className="relative flex items-center justify-center">
          {/* Ripple ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 130,
              height: 130,
              background: ringColor,
              opacity: ripple ? 0.15 : 0,
              transform: ripple ? "scale(1.3)" : "scale(1)",
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
          />

          <button
            onPointerDown={handlePress}
            className="relative select-none flex flex-col items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform duration-100"
            style={{
              width: 120,
              height: 120,
              background: `linear-gradient(135deg, #fef3c7, #fde68a)`,
              border: `3px solid ${ringColor}`,
              boxShadow: `0 8px 32px ${ringColor}40`,
              touchAction: "manipulation",
            }}
          >
            {/* Fingerprint SVG icon */}
            <FingerprintIcon color={ringColor} />
            <span
              className="text-[10px] mt-1 font-medium"
              style={{ color: ringColor }}
            >
              اضغط
            </span>
          </button>
        </div>

        {/* Sub-info row */}
        <div className="flex items-center gap-4 text-[11px] text-stone-400">
          <span>
            جلسة: <span className="font-semibold text-stone-600">{count}</span>
          </span>
          <span>•</span>
          <span>
            دورات مكتملة:{" "}
            <span className="font-semibold text-stone-600">
              {Math.floor(count / 100)}
            </span>
          </span>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="text-[11px] text-stone-400 hover:text-red-400 transition-colors py-1 px-4 rounded-full border border-stone-200 hover:border-red-200"
        >
          إعادة تعيين
        </button>
      </div>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Fingerprint SVG
function FingerprintIcon({ color }: { color: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 17c1 .5 2.5 1.5 4 1.5" />
      <path d="M20 12c0 2-.54 4.64-1.61 6.42" />
      <path d="M22 10a14.8 14.8 0 0 1-.18 2" />
      <path d="M6 10a6 6 0 0 1 12 0c0 1.25-.16 2.48-.46 3.67" />
      <path d="M6.18 19.73c-.15-.55-.33-1.8-.18-3.73" />
      <path d="M8.93 21.87C9 21.05 9 20.05 9 19" />
    </svg>
  );
}
