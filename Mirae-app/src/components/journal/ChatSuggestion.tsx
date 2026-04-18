import React from 'react';
import { motion } from 'framer-motion';

interface ChatSuggestionProps {
  entryId: string;
  onChatClick: (entryId: string) => void;
}

export default function ChatSuggestion({ entryId, onChatClick }: ChatSuggestionProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-24 right-6 z-40"
    >
      <button
        onClick={() => onChatClick(entryId)}
        className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-xl transition-all hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Want to talk about it?
          </span>
        </div>
        
        {/* Pulsing ring animation */}
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-50" />
      </button>
    </motion.div>
  );
}
