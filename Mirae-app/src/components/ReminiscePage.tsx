import React, { useState, useEffect } from "react";
import AvatarCustomizer from "./reminisce/AvatarCustomizer";
import FloatingBubbles from "./reminisce/FloatingBubbles";
import GameTimeline from "./reminisce/GameTimeline";
import ScrapbookView from "./reminisce/ScrapbookView"
import {generateTimeline} from "./reminisce/generateTimeline";

type Mode = "game" | "scrapbook";

const ReminiscePage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("game");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
  "https://api.dicebear.com/7.x/avataaars/svg?avatarStyle=Circle"
);
  const [entries, setEntries] = useState<any[]>([])
  const [nodes, setNodes] = useState<any[]>([])

  const toggleMode = () => {
    setMode(mode === "game" ? "scrapbook" : "game");
  };
  
  useEffect(() => {

  async function loadHistory() {

    try {

      const res = await fetch("http://localhost:5000/journal/history?range=month")

      if (!res.ok) {
        console.warn("History request failed")
        setEntries([])
        return
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        console.warn("History is not an array:", data)
        setEntries([])
        return
      }

      setEntries(data)

      const generated = generateTimeline(data)
      setNodes(generated)

    } catch (err) {
      console.error("History load failed", err)
      setEntries([])
    }

  }

  loadHistory()

}, [])

  return (
    <div className="w-full h-full flex flex-col relative bg-gray-50 p-4">

      {/* MAIN AREA */}
      <div className="flex flex-1 gap-6 h-full">

        {/* LEFT SIDE - AVATAR */}
        <div className="w-[280px] flex flex-col items-center justify-start relative bg-white rounded-xl shadow-md p-4">

          <div
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="cursor-pointer mb-2"
          >
            <img
              src={avatarUrl}
              className="w-40 h-40 rounded-full border-4 border-indigo-200 hover:border-indigo-400 transition"
              alt="Avatar"
            />
          </div>
 
          <p className="text-sm text-gray-600 mb-4">
            Click avatar to customize
          </p>

          {/* Floating customization bubbles */}
          {showCustomizer && <FloatingBubbles />}

          {/* Avatar customization window */}
          {showCustomizer && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <AvatarCustomizer
                avatarUrl={avatarUrl}
                onCategorySelect={(category) => {
                  console.log("Selected category:", category);
                }}
              />
            </div>
          )}

       
        </div>

        {/* CENTER AREA - TIMELINE / MAP */}
        <div className="flex-1 bg-white rounded-xl shadow-inner flex items-center justify-center relative  min-h-[500px]">

          {mode === "game" ? (
              <GameTimeline nodes={nodes} />
          ) : (
              <ScrapbookView entries={entries} />
          )}

        </div>

      </div>

      {/* MODE SWITCH BUTTON */}
      <button
        onClick={toggleMode}
        className="absolute bottom-6 right-6 px-6 py-3 bg-indigo-500 text-white rounded-full shadow-lg hover:scale-105 transition z-10"
      >
        {mode === "game" ? "Switch to Scrapbook" : "Switch to Game Mode"}
      </button>

    </div>
  );
};

export default ReminiscePage;
