import React, { useState } from "react";
import AvatarDisplay from "./AvatarDisplay";
import { AvatarConfig } from "./AvatarDisplay";
import { emotionColors } from "./emotionColors";

interface Entry {
  id: string;
  text: string;
  primaryEmotion: string;
  createdAt: string;
}

interface Props {
  entries: Entry[];
  avatarConfig: AvatarConfig;
}

const EMOTION_BACKGROUNDS: Record<string, string> = {
  happy: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
  calm: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
  neutral: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
  sad: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
  anxious: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  angry: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
};

const EMOTION_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  neutral: "😐",
  sad: "😢",
  anxious: "😰",
  angry: "😠",
};

export default function ScrapbookView({ entries, avatarConfig }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const entriesPerPage = 9;

  const paginatedEntries = entries.slice(
    currentPage * entriesPerPage,
    (currentPage + 1) * entriesPerPage
  );

  const totalPages = Math.ceil(entries.length / entriesPerPage);

  // Show empty state if no entries
  if (entries.length === 0) {
    return (
      <div className="relative w-full h-full bg-amber-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Empty Scrapbook</h3>
            <p className="text-gray-500">Your memories will appear here as you journal</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-amber-100 rounded-xl overflow-hidden">
      {/* Scrapbook Paper Texture */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%238B7355' d='M2 0L0 2h4zM2 5L0 3h4z'/%3E%3C/svg%3E")`,
        backgroundSize: '20px 20px',
      }} />

      {/* Content */}
      <div className="relative p-6">
        <div className="grid grid-cols-3 gap-6">
          {paginatedEntries.map((entry, index) => {
            const randomRotation = (index % 3 - 1) * 4 + (Math.random() * 4 - 2);
            
            return (
              <div
                key={entry.id}
                className="group cursor-pointer transition-all hover:scale-105"
                style={{
                  transform: `rotate(${randomRotation}deg)`,
                }}
                onClick={() => setSelectedEntry(entry)}
              >
                {/* Scrapbook Card */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  {/* Background Image with Emotion Theme */}
                  <div
                    className="h-32 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url(${EMOTION_BACKGROUNDS[entry.primaryEmotion] || EMOTION_BACKGROUNDS.neutral})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: emotionColors[entry.primaryEmotion] }}
                    >
                      {EMOTION_EMOJIS[entry.primaryEmotion]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AvatarDisplay
                        config={avatarConfig}
                        size={50}
                        emotion={entry.primaryEmotion}
                      />
                      <div>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: emotionColors[entry.primaryEmotion] + "40" }}
                        >
                          {entry.primaryEmotion}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {entry.text}
                    </p>
                  </div>

                  {/* Tape effect */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-amber-600 text-white rounded disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 bg-amber-600 text-white rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="h-40 bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${EMOTION_BACKGROUNDS[selectedEntry.primaryEmotion]})`,
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <AvatarDisplay
                  config={avatarConfig}
                  size={80}
                  emotion={selectedEntry.primaryEmotion}
                />
                <div>
                  <h3 className="text-xl font-semibold capitalize">
                    {selectedEntry.primaryEmotion}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(selectedEntry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {selectedEntry.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
