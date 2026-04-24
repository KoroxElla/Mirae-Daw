import { useState } from "react";

export default function GameSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-20 bg-green-600 text-white rounded-l-xl shadow-lg flex items-center justify-center hover:bg-green-700 transition"
      >
        {isOpen ? ">" : "<"}
      </button>

      {/* Sidebar */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          isOpen ? "w-[320px]" : "w-0"
        } h-[500px] bg-green-100 border-l border-green-300 shadow-xl rounded-l-xl`}
      >
        {isOpen && (
          <div className="w-full h-full flex flex-col">
            
            {/* Header */}
            <div className="p-3 bg-green-200 text-green-900 font-bold text-sm">
              🌿 Capucine's Garden
            </div>

            {/* Game iframe */}
            <iframe
              src="https://gamesnacks.com/games/pandapizzaparlor#eids=95329202,95381967,95379098"
              className="flex-1 border-none"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}