import React, { useState, useEffect } from 'react';
import GameTimeline, { TimelineNode } from './reminisce/GameTimeline';
import ScrapbookView from './reminisce/ScrapbookView';
import EmotionGraphs from './reminisce/EmotionGraphs';
import AvatarCustomizer from './reminisce/AvatarCustomizer';
import AvatarDisplay, { AvatarConfig } from './reminisce/AvatarDisplay';

interface JournalEntry {
  id: string;
  text: string;
  primaryEmotion: string;
  createdAt: string;
  weights?: Record<string, number>;
}

interface ReminiscePageProps {
  userId: string | null;
}

const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinColor: "Light",
  hairStyle: "LongHairBigHair",
  hairColor: "BrownDark",
  eyes: "Default",
  eyebrows: "Default",
  mouth: "Default",
  clothes: "Hoodie",
  facialHair: "Blank",
  accessories: "Blank",
};

export default function ReminiscePage({ userId }: ReminiscePageProps) {
  const [viewMode, setViewMode] = useState<'game' | 'scrapbook'>('game');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Fetch journal entries from backend
  const fetchEntries = async () => {
    if (!userId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        console.error('Failed to fetch entries');
        // Demo data for testing
        setEntries([
          { id: '1', text: 'Had a wonderful day at the beach! The sun was shining and I felt so alive.', primaryEmotion: 'joy', createdAt: '2024-01-15' },
          { id: '2', text: 'Feeling a bit overwhelmed with work deadlines. Need to take a break.', primaryEmotion: 'anxious', createdAt: '2024-01-20' },
          { id: '3', text: 'Meditated this morning and felt much calmer throughout the day.', primaryEmotion: 'calm', createdAt: '2024-01-25' },
          { id: '4', text: 'Got into an argument with a friend. Feeling frustrated.', primaryEmotion: 'anger', createdAt: '2024-01-28' },
          { id: '5', text: 'Just an ordinary day. Nothing special happened.', primaryEmotion: 'neutral', createdAt: '2024-02-01' },
          { id: '6', text: 'Received wonderful news about my project!', primaryEmotion: 'joy', createdAt: '2024-02-05' },
          { id: '7', text: 'Feeling lonely and missing old friends.', primaryEmotion: 'sadness', createdAt: '2024-02-10' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  // Load saved avatar config
  useEffect(() => {
    const saved = localStorage.getItem('reminisce_avatar_config');
    if (saved) {
      try {
        setAvatarConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load avatar config');
      }
    }
  }, []);

  const handleAvatarSave = (newConfig: AvatarConfig) => {
    setAvatarConfig(newConfig);
    localStorage.setItem('reminisce_avatar_config', JSON.stringify(newConfig));
    setShowCustomizer(false);
  };

  // Generate timeline nodes from entries
  const timelineNodes: TimelineNode[] = entries.map((entry, index) => ({
    id: index,
    date: entry.createdAt,
    emotion: entry.primaryEmotion,
    preview: entry.text.slice(0, 50),
    x: Math.sin(index * 0.8) * 150 + 100,
    y: index * 120 + 100,
    isUnlocked: true,
    isCurrent: index === entries.length - 1,
  }));

  const handleNodeClick = (node: TimelineNode) => {
    const entry = entries.find(e => e.createdAt === node.date);
    if (entry) {
      setSelectedEntry(entry);
      setTimeout(() => setSelectedEntry(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header with Avatar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ Your Memory Journey ✨
            </h1>
            <p className="text-gray-500 mt-1">Look back at your emotional growth and memories</p>
          </div>
          
          {/* Avatar Display with Customize Button */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setShowCustomizer(true)}
              className="cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition" />
                <AvatarDisplay config={avatarConfig} size={80} />
              </div>
            </div>
            <button
              onClick={() => setShowCustomizer(true)}
              className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Customize Avatar ✨
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setViewMode('game')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'game'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          🎮 Game Mode
        </button>
        <button
          onClick={() => setViewMode('scrapbook')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'scrapbook'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          📖 Scrapbook Mode
        </button>
      </div>

      {/* Timeline/Scrapbook View */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading your memories...</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📔</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Journal Entries Yet</h3>
              <p className="text-gray-500">Start writing in your journal to see your memories here!</p>
            </div>
          </div>
        ) : viewMode === 'game' ? (
          <GameTimeline
            nodes={timelineNodes}
            avatarConfig={avatarConfig}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <ScrapbookView
            entries={entries}
            avatarConfig={avatarConfig}
          />
        )}
      </div>

      {/* Graphs Section */}
      <EmotionGraphs entries={entries} />

      {/* Entry Preview Popup */}
      {selectedEntry && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm animate-bounce-in z-50">
          <div className="flex gap-3">
            <AvatarDisplay
              config={avatarConfig}
              size={50}
              emotion={selectedEntry.primaryEmotion}
            />
            <div>
              <p className="font-semibold text-gray-800 capitalize">
                {selectedEntry.primaryEmotion}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {selectedEntry.text}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(selectedEntry.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Customizer Modal */}
      {showCustomizer && (
        <AvatarCustomizer
          config={avatarConfig}
          onChange={handleAvatarSave}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  );
}
