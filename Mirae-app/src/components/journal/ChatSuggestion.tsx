import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatSuggestionProps {
  entryId: string;
  onChatClick: (entryId: string) => void;
}

export default function ChatSuggestion({ entryId, onChatClick }: ChatSuggestionProps) {
  // Auto-hide after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById('chat-suggestion');
      if (element) {
        element.style.display = 'none';
      }
    }, 30000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      id="chat-suggestion"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-24 right-6 z-50"
    >
      <button
        onClick={() => onChatClick(entryId)}
        className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-xl transition-all hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">💬</span>
          <span className="hidden sm:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Want to talk about it?
          </span>
        </div>
        
        {/* Pulsing ring animation */}
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-50" />
      </button>
    </motion.div>
  );
}
