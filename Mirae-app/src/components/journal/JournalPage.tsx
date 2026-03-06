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
      
      // Check if the text is encrypted
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
        // If not encrypted (for testing/development), display as is
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
      <div className="w-full h-full bg-amber-50 bg-[url('/journal/openjournal.png')] bg-cover bg-center p-10 rounded-[10px] shadow-md flex items-center justify-center font-comic">
        <p className="text-gray-400 italic">This page is blank</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full bg-amber-50 bg-[url('/journal/openjournal.png')] bg-cover bg-center p-10 rounded-[10px] shadow-md relative font-comic"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex justify-between mb-5 text-gray-600">
        <span className="text-sm">
          {formatDate(entry.createdAt)}
        </span>
        {entry.arbitration && (
          <span className="text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded border-l-4 border-amber-500">
            Mood: {entry.arbitration.emotions?.join(', ')}
          </span>
        )}
      </div>
      
      <div className="page-content min-h-[400px]">
        {isDecrypting ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
          </div>
        ) : decryptError ? (
          <div className="flex justify-center items-center h-[400px]">
            <p className="text-red-500 text-sm">{decryptError}</p>
          </div>
        ) : (
          <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap break-words p-2.5">
            {displayText}
          </p>
        )}
      </div>


      {/* Page Actions */}
      <div className="absolute bottom-5 right-5 flex gap-2.5">
        <button 
          onClick={onEdit} 
          className="px-4 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={isDecrypting}
        >
          Edit
        </button>
        <button 
          onClick={onDelete} 
          className="px-4 py-2 bg-red-500 text-white border-none rounded hover:bg-red-600 transition-colors disabled:opacity-50"
          disabled={isDecrypting}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default JournalPage;
