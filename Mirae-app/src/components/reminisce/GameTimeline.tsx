import React, { useState, useEffect, useRef } from "react";
import AvatarDisplay from "./AvatarDisplay";
import { AvatarConfig } from "./AvatarDisplay";

export interface TimelineNode {
  id: number;
  date: string;
  emotion: string;
  preview: string;
  x: number;
  y: number;
  isUnlocked: boolean;
  isCurrent: boolean;
}

interface Props {
  nodes: TimelineNode[];
  avatarConfig: AvatarConfig;
  onNodeClick: (node: TimelineNode) => void;
}

const EMOTION_GLOW: Record<string, string> = {
  happy: "shadow-[0_0_20px_rgba(255,217,61,0.5)]",
  calm: "shadow-[0_0_20px_rgba(107,203,119,0.5)]",
  neutral: "shadow-[0_0_20px_rgba(160,160,160,0.5)]",
  sad: "shadow-[0_0_20px_rgba(77,150,255,0.5)]",
  anxious: "shadow-[0_0_20px_rgba(157,78,221,0.5)]",
  angry: "shadow-[0_0_20px_rgba(255,107,107,0.5)]",
};

const GameTimeline: React.FC<Props> = ({ nodes, avatarConfig, onNodeClick }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 300);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-full">
      {/* Container with scroll */}
      <div
        ref={containerRef}
        className="relative w-full h-[500px] overflow-y-auto bg-gradient-to-b from-indigo-900 to-purple-900 rounded-xl"
      >
        <div className="relative min-h-[1200px]">
          {/* Draw connecting paths */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {nodes.map((node, idx) => {
              if (idx < nodes.length - 1 && node.isUnlocked) {
                const nextNode = nodes[idx + 1];
                const startX = node.x + 60;
                const startY = node.y + 60;
                const endX = nextNode.x + 60;
                const endY = nextNode.y + 60;
                
                // Create zigzag curve
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2 - 40;
                
                return (
                  <path
                    key={`path-${idx}`}
                    d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                    stroke="#FBBF24"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={nextNode.isUnlocked ? "none" : "8,8"}
                    className="transition-all duration-500"
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute transition-all duration-300 ${
                node.isUnlocked ? "cursor-pointer group" : "cursor-not-allowed"
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => node.isUnlocked && onNodeClick(node)}
            >
              {/* Glow effect */}
              <div
                className={`
                  w-[120px] h-[120px] rounded-full flex items-center justify-center
                  ${node.isUnlocked ? EMOTION_GLOW[node.emotion] || "" : ""}
                  ${node.isCurrent ? "ring-4 ring-yellow-400 animate-pulse" : ""}
                `}
                style={{
                  background: node.isUnlocked
                    ? `radial-gradient(circle, rgba(255,255,255,0.2), rgba(0,0,0,0.2))`
                    : "radial-gradient(circle, rgba(100,100,100,0.3), rgba(0,0,0,0.5))",
                }}
              >
                {node.isUnlocked ? (
                  <AvatarDisplay
                    config={avatarConfig}
                    size={90}
                    emotion={node.emotion}
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl">🔒</span>
                    <span className="text-xs text-gray-300 mt-2">Locked</span>
                  </div>
                )}
              </div>

              {/* Date label */}
              {node.isUnlocked && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs text-gray-200 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    {new Date(node.date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Unlock message */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-gray-300 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {nodes.filter(n => n.isUnlocked).length < nodes.length ? (
                <>📝 {nodes.length - nodes.filter(n => n.isUnlocked).length} more entries to unlock</>
              ) : (
                <>🎉 All unlocked! Keep journaling!</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 bg-purple-600 text-white w-10 h-10 rounded-full shadow-lg hover:bg-purple-700 transition-all z-10"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default GameTimeline;
