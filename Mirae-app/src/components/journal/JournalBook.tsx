import React, { useState, useEffect, useRef } from 'react';
import JournalCover from './JournalCover';
import JournalPage from './JournalPage';
import JournalEditor from './JournalEditor';
import type { JournalEntry, JournalSettings } from './types';
import { useAvatarEmotion } from './useAvatarEmotion';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalBookProps {
  userId: string;
}

const JournalBook: React.FC<JournalBookProps> = ({ userId }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<JournalSettings>({
    title: 'My Journal',
    cover: 'journalcover_1.jpeg'
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the avatar updater from the hook
  const { updateFromBackend } = useAvatarEmotion();
  
  const bookRef = useRef<HTMLDivElement>(null);

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

  // API Calls (same as before)
  const fetchJournalSettings = async (): Promise<JournalSettings> => {
    const response = await fetch('http://localhost:5000/journal/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  };

  const fetchAllEntries = async (): Promise<JournalEntry[]> => {
    const response = await fetch('http://localhost:5000/journal/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  };

  const saveJournalEntry = async (text: string): Promise<any> => {
    const response = await fetch('http://localhost:5000/journal/save', {
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
    const response = await fetch(`http://localhost:5000/journal/delete/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete entry');
    return response.json();
  };

  const updateJournalSettings = async (title: string, cover: string): Promise<void> => {
    const response = await fetch('http://localhost:5000/journal/settings', {
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
      
      // Update avatar state in context
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
      setCurrentPage(updatedEntries.length);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const result = await deleteJournalEntry(entryId);
      
      // Update avatar state after deletion
      if (result.emotions && result.mode) {
        updateFromBackend({
          mode: result.mode,
          emotions: result.emotions
        });
      }
      
      const updatedEntries = await fetchAllEntries();
      setEntries(updatedEntries);
      
      if (currentPage > updatedEntries.length) {
        setCurrentPage(Math.max(0, updatedEntries.length));
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEditing(true);
    setCurrentPage(entry.id ? entries.findIndex(e => e.id === entry.id) + 1 : 0);
  };

  const startNewEntry = () => {
    setEditingEntry(null);
    setIsEditing(true);
    setCurrentPage(entries.length + 1);
  };

  const flipToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
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

      {/* Book Pages */}
      <div className="relative w-[800px] h-[600px] mx-auto perspective-[1500px]" ref={bookRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full h-full preserve-3d"
          >
            {currentPage === 0 ? (
              <JournalCover
                cover={settings.cover}
                onSwitchCover={() => handleSwitchCover(
                  settings.cover === 'journalcover_1.jpeg' 
                    ? 'journalcover_2.png' 
                    : 'journalcover_1.jpeg'
                )}
                journalName={settings.title}
              />
            ) : (
              <JournalPage
                entry={entries[currentPage - 1]}
                onEdit={() => handleEditEntry(entries[currentPage - 1])}
                onDelete={() => handleDeleteEntry(entries[currentPage - 1].id)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center items-center gap-5 mt-5">
        <button 
          onClick={() => flipToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-5 py-2.5 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 px-4">
          Page {currentPage + 1} of {entries.length + 1}
        </span>
        <button 
          onClick={() => flipToPage(currentPage + 1)}
          disabled={currentPage === entries.length}
          className="px-5 py-2.5 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
