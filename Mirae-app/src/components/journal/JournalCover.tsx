import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  cover: string;
  onSwitchCover: () => void;
  journalName: string;
}

const JournalCover: React.FC<Props> = ({ cover, onSwitchCover, journalName }) => {
  const getCoverImage = (coverFile: string) => {
    return `/journal/${coverFile}`;
  };

  return (
    <motion.div 
      className="w-full h-full relative cursor-pointer rounded-[10px] overflow-hidden shadow-2xl"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <img 
        src={getCoverImage(cover)} 
        alt="Journal Cover" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />
      <h1 className="absolute bottom-12 left-0 right-0 text-center text-white text-2xl sm:text-3xl md:text-4xl font-comic drop-shadow-lg px-4">
        {journalName}
      </h1>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSwitchCover();
        }} 
        className="absolute top-5 right-5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 hover:bg-white border-none rounded-md cursor-pointer transition-colors text-sm sm:text-base shadow-md"
      >
        Switch Cover
      </button>
    </motion.div>
  );
};

export default JournalCover;
