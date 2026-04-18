import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EncouragementCard {
  id: string;
  date: string;
  message: string;
  emotion: string;
  icon: string;
}

const encouragementMessages = {
  joy: "Your positivity is contagious! Keep spreading joy! 🌟",
  calm: "You're maintaining beautiful inner peace. Breathe and continue. 🧘",
  neutral: "Today is a blank canvas. What will you create? 🎨",
  sadness: "It's okay to not be okay. Brighter days are coming. 🌈",
  anxious: "You've overcome every challenge so far. You've got this! 💪",
  anger: "Take a deep breath. You have the power to choose your response. 🕊️"
};

export default function DailyEncouragement({ userId }: { userId: string }) {
  const [cards, setCards] = useState<EncouragementCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadCards();
  }, [userId]);

  const loadCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/journal/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const entries = await response.json();
        // Group entries by day
        const cardsByDay: EncouragementCard[] = [];
        const daysMap = new Map();
        
        entries.forEach((entry: any) => {
          const date = new Date(entry.createdAt).toDateString();
          if (!daysMap.has(date)) {
            daysMap.set(date, entry.primaryEmotion);
          }
        });
        
        daysMap.forEach((emotion, date) => {
          cardsByDay.push({
            id: date,
            date,
            message: encouragementMessages[emotion as keyof typeof encouragementMessages] || encouragementMessages.neutral,
            emotion,
            icon: getEmotionIcon(emotion)
          });
        });
        
        setCards(cardsByDay.reverse());
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: Record<string, string> = {
      joy: '😊',
      calm: '😌',
      neutral: '😐',
      sadness: '😢',
      anxious: '😰',
      anger: '😠'
    };
    return icons[emotion] || '📝';
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (cards.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={cards[currentIndex]?.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-md"
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">{cards[currentIndex]?.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {new Date(cards[currentIndex]?.date).toLocaleDateString()}
              </p>
              <p className="font-medium text-gray-800">
                {cards[currentIndex]?.message}
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-3 pt-2 border-t">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="text-gray-400 disabled:opacity-30 hover:text-purple-600"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              {currentIndex + 1} / {cards.length}
            </span>
            <button
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
              className="text-gray-400 disabled:opacity-30 hover:text-purple-600"
            >
              Next →
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
