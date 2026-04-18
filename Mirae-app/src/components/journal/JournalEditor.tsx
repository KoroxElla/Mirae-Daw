import React, { useState, useEffect, useRef } from 'react';
import AnimatedPen from './AnimatedPen';
import { motion } from 'framer-motion';
import { decryptText, isEncrypted } from '../../utils/decryption';

interface Props {
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

const JournalEditor: React.FC<Props> = ({ initialContent, onSave, onClose }) => {
  const [content, setContent] = useState(initialContent);
  const [isErasing, setIsErasing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Decrypt initial content if it's encrypted
  useEffect(() => {
    const loadInitialContent = async () => {
      if (!initialContent) return;
      
      if (isEncrypted(initialContent)) {
        setIsLoading(true);
        try {
          const decrypted = await decryptText(initialContent);
          setContent(decrypted);
        } catch (error) {
          console.error('Failed to decrypt content for editing:', error);
          setContent('[Could not load content for editing]');
        } finally {
          setIsLoading(false);
        }
      } else {
        setContent(initialContent);
      }
    };

    loadInitialContent();
  }, [initialContent]);

  useEffect(() => {
    if (textareaRef.current && textContainerRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const text = content.substring(0, cursorPos);
      
      const lines = text.split('\n');
      const lastLine = lines[lines.length - 1];
      
      // Get the actual position of the text container
      const containerRect = textContainerRef.current.getBoundingClientRect();
      const previewRect = previewRef.current?.getBoundingClientRect();
      
      if (previewRect) {
        // Calculate position relative to the preview container
        const charWidth = 8; // Approximate width per character
        const lineHeight = 28; // Match this to your CSS line-height
        
        // Start from the text container's actual position
        const x = containerRect.left - previewRect.left + (lastLine.length * charWidth);
        const y = containerRect.top - previewRect.top + ((lines.length - 1) * lineHeight);
        
        setCursorPosition({ x, y });
      }
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setIsErasing(true);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setIsErasing(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <div className="flex flex-col lg:flex-row w-full max-w-5xl h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Left side - Journal page preview */}
        <div className="hidden lg:block lg:flex-1 bg-stone-200 p-5" ref={previewRef}>
          <div 
            className="w-full h-full bg-amber-50 bg-[url('/journal/openjournal.png')] bg-cover bg-center shadow-inner relative font-comic"
            style={{ 
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            {/* Text container - absolutely positioned to control exactly where text appears */}
            <div 
              ref={textContainerRef}
              className="absolute whitespace-pre-wrap break-words text-shadow-sm text-lg"
              style={{
                top: '8px',     
                left: '71px',    
                right: '60px',  
                bottom: '60px',  
                fontFamily: 'Comic Sans MS, cursive',
                lineHeight: '28px', 
                color: '#2c3e50',
                overflowY: 'auto'
              }}
            >
              {content}
            </div>
            
            {/* Pen is positioned relative to the preview div */}
            <AnimatedPen 
              position={cursorPosition}
              isErasing={isErasing}
              pageWidth={previewRef.current?.clientWidth || 800}
              lineHeight={28}
            />
          </div>
        </div>

        {/* Right side - Text editor */}
        <div className="flex-1 bg-gray-100 p-4 flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            placeholder="Write your journal entry here..."
            className="flex-1 w-full p-4 border-2 border-gray-200 rounded-lg resize-none text-base leading-relaxed font-comic focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.1)]"
            autoFocus
          />
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => onSave(content)} 
              className="flex-1 py-2 bg-green-500 text-white border-none rounded cursor-pointer text-base hover:bg-green-600 transition-colors"
            >
              Save Entry
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 py-2 bg-red-500 text-white border-none rounded cursor-pointer text-base hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
          {/* Mobile preview toggle */}
          <button 
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="lg:hidden mt-2 py-1 text-sm text-purple-600"
          >
            {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default JournalEditor;
