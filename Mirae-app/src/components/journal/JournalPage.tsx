import React, { useEffect, useState } from 'react';
import type { JournalEntry } from './types';
import { motion } from 'framer-motion';
import { decryptText, isEncrypted } from '../../utils/decryption';

interface Props {
  entry?: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}

const JournalPage: React.FC<Props> = ({ entry, onEdit, onDelete }) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  useEffect(() => {
    const loadDecryptedText = async () => {
      if (!entry?.text) {
        setDisplayText('');
        return;
      }
      
      if (isEncrypted(entry.text)) {
        setIsDecrypting(true);
        setDecryptError(null);
        
        try {
          const decrypted = await decryptText(entry.text);
          setDisplayText(decrypted);
        } catch (error) {
          console.error('Failed to decrypt entry:', error);
          setDecryptError('Could not decrypt this entry');
          setDisplayText('[Encrypted Content]');
        } finally {
          setIsDecrypting(false);
        }
      } else {
        setDisplayText(entry.text);
      }
    };

    loadDecryptedText();
  }, [entry]);

  const formatDate = (date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!entry) {
    return (
      <div className="w-full h-full bg-amber-50 bg-[url('/journal/openjournal.png')] bg-cover bg-center p-6 rounded-[10px] shadow-md flex items-center justify-center font-comic">
        <p className="text-gray-400 italic text-sm">This page is blank</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full bg-amber-50 bg-[url('/journal/openjournal.png')] bg-cover bg-center rounded-[10px] shadow-md relative font-comic overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Inner scrollable content */}
      <div className="absolute inset-0 overflow-y-auto p-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded">
            {formatDate(entry.createdAt)}
          </span>
          {entry.arbitration && (
            <span className="text-xs text-amber-800 bg-amber-100/80 px-2 py-1 rounded border-l-4 border-amber-500">
              Mood: {entry.arbitration.emotions?.join(', ')}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="min-h-[300px]">
          {isDecrypting ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
            </div>
          ) : decryptError ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-red-500 text-sm">{decryptError}</p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
              {displayText}
            </p>
          )}
        </div>
      </div>

      {/* Page Actions - Fixed at bottom */}
      <div className="absolute bottom-3 right-3 flex gap-2 z-10">
        <button 
          onClick={onEdit} 
          className="px-3 py-1.5 text-sm bg-blue-500 text-white border-none rounded hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md"
          disabled={isDecrypting}
        >
          Edit
        </button>
        <button 
          onClick={onDelete} 
          className="px-3 py-1.5 text-sm bg-red-500 text-white border-none rounded hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
          disabled={isDecrypting}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default JournalPage;
