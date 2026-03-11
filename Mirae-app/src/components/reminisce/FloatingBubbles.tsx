import React from "react";

const FloatingBubbles: React.FC = () => {
  const bubbles = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((_, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${6 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
          }}
        />
      ))}

      <style>
        {`
        .bubble {
          position: absolute;
          bottom: -60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(2px);
          animation: floatUp linear infinite;
        }

        @keyframes floatUp {
          from {
            transform: translateY(0);
            opacity: 0.7;
          }
          to {
            transform: translateY(-120vh);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
};

export default FloatingBubbles;
