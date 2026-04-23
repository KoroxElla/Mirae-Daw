// journal/JournalBook.tsx - Update the flip book section
import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import JournalCover from './JournalCover';
import JournalPage from './JournalPage';
import JournalEditor from './JournalEditor';
import type { JournalEntry, JournalSettings } from './types';
import { useAvatarEmotion } from './useAvatarEmotion';
import ChatSuggestion from './ChatSuggestion';

interface JournalBookProps {
  userId: string;
}

const JournalBook: React.FC<JournalBookProps> = ({ userId }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<JournalSettings>({
    title: 'My Journal',
    cover: 'journalcover_1.jpeg'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatSuggestion, setShowChatSuggestion] = useState(false);
  const [lastNeutralEntryId, setLastNeutralEntryId] = useState<string | null>(null);
  const [bookDimensions, setBookDimensions] = useState({ width: 350, height: 450 });
  const flipBook = useRef<any>(null);
  
  const { updateFromBackend } = useAvatarEmotion();

  // Handle window resize for responsive book
  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = Math.min(400, window.innerWidth - 80);
      const maxHeight = Math.min(520, window.innerHeight - 200);
      setBookDimensions({
        width: maxWidth,
        height: maxHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load journal data on mount
  useEffect(() => {
    loadJournalData();
  }, [userId]);

  const loadJournalData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, entriesData] = await Promise.all([
        fetchJournalSettings(),
        fetchAllEntries()
      ]);
      
      setSettings(settingsData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error loading journal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // API Calls
  const fetchJournalSettings = async (): Promise<JournalSettings> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  };

  const fetchAllEntries = async (): Promise<JournalEntry[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  };

  const saveJournalEntry = async (text: string): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error('Failed to save entry');
    return response.json();
  };

  const deleteJournalEntry = async (entryId: string): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/delete/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete entry');
    return response.json();
  };

  const updateJournalSettings = async (title: string, cover: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, cover })
    });
    if (!response.ok) throw new Error('Failed to update settings');
  };

  const handleSwitchCover = async (newCover: string) => {
    const updatedSettings = { ...settings, cover: newCover };
    try {
      await updateJournalSettings(updatedSettings.title, updatedSettings.cover);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating cover:', error);
    }
  };

  const handleUpdateJournalName = async (newName: string) => {
    const updatedSettings = { ...settings, title: newName };
    try {
      await updateJournalSettings(updatedSettings.title, updatedSettings.cover);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating journal name:', error);
    }
  };

  const handleSaveEntry = async (content: string) => {
    try {
      const result = await saveJournalEntry(content);
      console.log('Emotions detected:', result.emotions, 'Mode:', result.mode);
      
      if (result.emotions && result.mode) {
        updateFromBackend({
          mode: result.mode,
          emotions: result.emotions
        });
        
      }

      const isNeutral =
        result.mode === 'single'
          ? result.emotions[0] === 'neutral'
          : result.emotions.includes('neutral');
      
      const updatedEntries = await fetchAllEntries();
      setEntries(updatedEntries);

      const newest = updatedEntries[0];

      if (isNeutral && newest) {
        setShowChatSuggestion(true);
        setLastNeutralEntryId(newest.id);

        setTimeout(() => {
          setShowChatSuggestion(false);
        }, 30000);
      }
      
      setIsEditing(false);
      setEditingEntry(null);
      
      // Flip to the new page
      setTimeout(() => {
        if (flipBook.current) {
          flipBook.current.pageFlip().flip(updatedEntries.length);
        }
      }, 100);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const result = await deleteJournalEntry(entryId);
      
      if (result.emotions && result.mode) {
        updateFromBackend({
          mode: result.mode,
          emotions: result.emotions
        });
      }
      
      const updatedEntries = await fetchAllEntries();
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEditing(true);
  };

  const startNewEntry = () => {
    setEditingEntry(null);
    setIsEditing(true);
  };

  const handleChatClick = (entryId: string) => {
    // Navigate to chat tab with this entry linked
    window.dispatchEvent(new CustomEvent('openChat', { detail: { entryId } }));
    setShowChatSuggestion(false);
  };

  const onFlip = (e: any) => {
    console.log('Current page: ' + e.data);
  };

  const nextPage = () => {
    if (flipBook.current) {
      flipBook.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (flipBook.current) {
      flipBook.current.pageFlip().flipPrev();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Journal Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          value={settings.title}
          onChange={(e) => handleUpdateJournalName(e.target.value)}
          className="text-xl sm:text-2xl p-2 border-2 border-gray-300 rounded-lg font-comic text-center sm:text-left"
          placeholder="Journal Name"
        />
        <button 
          onClick={startNewEntry} 
          className="bg-green-500 text-white border-none px-4 sm:px-6 py-2 rounded-lg cursor-pointer text-sm sm:text-base hover:bg-green-600 transition-colors"
        >
          ✨ Start New Entry
        </button>
      </div>

      {/* Book Container - Centered and Responsive */}
      <div className="flex justify-center items-center py-4">
        <div style={{ width: bookDimensions.width, height: bookDimensions.height }}>
          <HTMLFlipBook 
            width={bookDimensions.width}
            height={bookDimensions.height}
            maxShadowOpacity={0.5}
            drawShadow={true}
            showCover={true}
            size="fixed"
            minWidth={280}
            maxWidth={450}
            minHeight={380}
            maxHeight={550}
            flippingTime={600}
            usePortrait={true}
            startPage={0}
            onFlip={onFlip}
            ref={flipBook}
            className="shadow-2xl"
            autoSize={false}
            useMouseEvents={true}
            swipeDistance={20}
            mobileScrollSupport={true}
          >
            {/* Cover Page */}
            <div className="page" style={{ background: 'transparent' }}>
              <div className="page-content p-0">
                <JournalCover
                  cover={settings.cover}
                  onSwitchCover={() => handleSwitchCover(
                    settings.cover === 'journalcover_1.jpeg' 
                      ? 'journalcover_2.png' 
                      : 'journalcover_1.jpeg'
                  )}
                  journalName={settings.title}
                />
              </div>
            </div>

            {/* Journal Entry Pages */}
            {entries.map((entry, index) => (
              <div className="page" key={entry.id}>
                <div className="page-content p-0">
                  <JournalPage
                    entry={entry}
                    onEdit={() => handleEditEntry(entry)}
                    onDelete={() => handleDeleteEntry(entry.id)}
                  />
                </div>
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Navigation Buttons - Responsive */}
      <div className="flex justify-center items-center gap-3 sm:gap-5 mt-5 mb-8 pb-4">
        <button 
          onClick={prevPage}
          className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm sm:text-base shadow-md"
        >
          ← Previous
        </button>
        <span className="text-xs sm:text-sm text-gray-600 px-2 sm:px-4">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
        <button 
          onClick={nextPage}
          className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm sm:text-base shadow-md"
        >
          Next →
        </button>
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <JournalEditor
          initialContent={editingEntry?.text || ''}
          onSave={handleSaveEntry}
          onClose={() => {
            setIsEditing(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* Chat Suggestion Bubble for Neutral Entries */}
      {showChatSuggestion && lastNeutralEntryId && (
        <ChatSuggestion
          entryId={lastNeutralEntryId}
          onChatClick={handleChatClick}
        />
      )}
    </div>
  );
};

export default JournalBook;
