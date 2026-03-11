import React, { useState } from "react";
import AvatarCustomizer from "./reminisce/AvatarCustomizer";
import FloatingBubbles from "./reminisce/FloatingBubbles";
import GameTimeline from "./reminisce/GameTimeline";

type Mode = "game" | "scrapbook";

const ReminiscePage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("game");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
  "https://api.dicebear.com/7.x/avataaars/svg?avatarStyle=Circle"
);
  const [entries, setEntries] = useState([])
  const [nodes, setNodes] = useState([])

  const toggleMode = () => {
    setMode(mode === "game" ? "scrapbook" : "game");
  };
  
  useEffect(() => {

    async function loadHistory() {

      const res = await fetch("/journal/history?range=month")
      const data = await res.json()

      setEntries(data)

      const generated = generateTimeline(data)
      setNodes(generated)
    }

    loadHistory()

  }, [])

  return (
    <div className="w-full h-full flex flex-col relative">

      {/* MAIN AREA */}
      <div className="flex flex-1 gap-6">

        {/* LEFT SIDE - AVATAR */}
        <div className="w-[280px] flex flex-col items-center justify-end relative">

          <div
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="cursor-pointer"
          >
            <img
              src={avatarUrl}
              className="w-40 h-40"
            />
          </div>

          {/* Floating customization bubbles */}
          {showCustomizer && <FloatingBubbles />}

          {/* Avatar customization window */}
          {showCustomizer && (
            <AvatarCustomizer
              onClose={() => setShowCustomizer(false)}
            />
          )}

          <p className="mt-2 text-sm text-gray-600">
            Click avatar to customize
          </p>
        </div>

        {/* CENTER AREA - TIMELINE / MAP */}
        <div className="flex-1 bg-white rounded-xl shadow-inner flex items-center justify-center relative">

          {mode === "game" ? (
            <div className="text-center text-gray-500">
              <GameTimeline nodes={nodes} />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Scrapbook Cards will appear here
            </div>
          )}

        </div>

      </div>

      {/* MODE SWITCH BUTTON */}
      <button
        onClick={toggleMode}
        className="absolute bottom-6 right-6 px-6 py-3 bg-indigo-500 text-white rounded-full shadow-lg hover:scale-105 transition"
      >
        {mode === "game" ? "Switch to Scrapbook" : "Switch to Game Mode"}
      </button>

    </div>
  );
};

export default ReminiscePage;
