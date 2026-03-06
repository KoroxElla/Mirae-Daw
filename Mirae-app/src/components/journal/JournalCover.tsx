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
      <h1 className="absolute bottom-12 left-0 right-0 text-center text-white text-4xl font-comic drop-shadow-lg">
        {journalName}
      </h1>
      <button 
        onClick={onSwitchCover} 
        className="absolute top-5 right-5 px-4 py-2 bg-white/80 border-none rounded-md cursor-pointer hover:bg-white transition-colors"
      >
        Switch Cover
      </button>
    </motion.div>
  );
};

export default JournalCover;
