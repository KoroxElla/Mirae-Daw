import React, { useState } from "react";

interface Props {
  avatarUrl: string;
  onCategorySelect: (category: string) => void;
}

const AvatarCustomizer: React.FC<Props> = ({ avatarUrl, onCategorySelect }) => {
  const [showMenu, setShowMenu] = useState(false);

  const bubbles = [
    { id: "hair", icon: "💇" },
    { id: "accessories", icon: "🕶" },
    { id: "hairColor", icon: "🎨" },
    { id: "facialHair", icon: "🧔" },
    { id: "clothes", icon: "👕" },
    { id: "skin", icon: "🖐" }
  ];

  return (
    <div className="relative w-[160px] h-[160px] flex items-center justify-center">

      {/* Avatar */}
      <img
        src={avatarUrl}
        onClick={() => setShowMenu(!showMenu)}
        className="w-[120px] h-[120px] rounded-full cursor-pointer border-4 border-white shadow-lg hover:scale-105 transition"
      />

      {/* Floating bubbles */}
      {showMenu &&
        bubbles.map((bubble, index) => {
          const angle = (index / bubbles.length) * (Math.PI * 2);
          const radius = 90;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={bubble.id}
              onClick={() => onCategorySelect(bubble.id)}
              className="absolute w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl hover:scale-110 transition"
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
            >
              {bubble.icon}
            </button>
          );
        })}
    </div>
  );
};

export default AvatarCustomizer;
