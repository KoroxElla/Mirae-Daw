import React, { useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import JournalCover from './JournalCover';
import JournalPage from './JournalPage';
import JournalEditor from './JournalEditor';
import type { JournalEntry, JournalSettings } from './types';
import { useAvatarEmotion } from './useAvatarEmotion';

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
  const flipBook = React.useRef<any>(null);
  
  const { updateFromBackend } = useAvatarEmotion();

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

  // Journal actions
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
      
      const updatedEntries = await fetchAllEntries();
      setEntries(updatedEntries);
      
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

  const onFlip = (e: any) => {
    // Optional: Handle flip events
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
    <div className="max-w-6xl mx-auto p-5">
      {/* Journal Header */}
      <div className="flex justify-between items-center mb-8">
        <input
          type="text"
          value={settings.title}
          onChange={(e) => handleUpdateJournalName(e.target.value)}
          className="text-2xl p-2 border-2 border-gray-300 rounded-lg font-comic"
          placeholder="Journal Name"
        />
        <button 
          onClick={startNewEntry} 
          className="bg-green-500 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base hover:bg-green-600 transition-colors"
        >
          Start New Entry
        </button>
      </div>

      {/* Book Pages - Using react-pageflip */}
      <div className="flex justify-center">
        <HTMLFlipBook 
          width={400} 
          height={550}
          maxShadowOpacity={0.5}
          drawShadow={true}
          showCover={true}
          size="fixed"
          minWidth={300}
          maxWidth={500}
          minHeight={400}
          maxHeight={600}
          flippingTime={800}
          usePortrait={true}
          startPage={0}
          onFlip={onFlip}
          ref={flipBook}
          className="shadow-2xl"
          style={{}}
          startZIndex={0}
          autoSize={true}
          clickEventForward={false}
          useMouseEvents={true}
          swipeDistance={30}
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
              <div className="page-content p-5 bg-amber-50 bg-[url('/journal/openjournal.png')] bg-cover bg-center">
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

      {/* Navigation Buttons */}
      <div className="flex justify-center items-center gap-5 mt-5">
        <button 
          onClick={prevPage}
          className="px-5 py-2.5 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 px-4">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
        <button 
          onClick={nextPage}
          className="px-5 py-2.5 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all"
        >
          Next
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
    </div>
  );
};

export default JournalBook;
