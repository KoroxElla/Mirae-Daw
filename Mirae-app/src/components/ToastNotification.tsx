import { useState, useEffect } from "react";

export const ToastNotification = ({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsVisible(false);
          setTimeout(onClose, 300);
          return 0;
        }
        return prev - 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down w-[90%] max-w-md">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg text-center relative overflow-hidden`}>
        <p className="text-sm sm:text-base">{message}</p>
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};