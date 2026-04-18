import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  image?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'avatar',
    title: '✨ Your Avatar',
    description: 'This is your 3D avatar! It reacts to your emotions. Click "Customize Avatar" to change its appearance.',
    targetId: 'avatar-canvas',
    position: 'bottom'
  },
  {
    id: 'customize',
    title: '🎨 Customization',
    description: 'Change your avatar\'s features, clothing, and accessories. Your avatar will reflect your mood!',
    targetId: 'customize-button',
    position: 'top'
  },
  {
    id: 'journal',
    title: '📔 Journal',
    description: 'Write your daily thoughts. Our AI analyzes your emotions and updates your avatar accordingly.',
    targetId: 'journal-tab',
    position: 'top'
  },
  {
    id: 'reminisce',
    title: '🌟 Reminisce',
    description: 'See your emotional journey through time! Play the game mode or browse your scrapbook.',
    targetId: 'reminisce-tab',
    position: 'top'
  },
  {
    id: 'chat',
    title: '💬 Chat Time',
    description: 'Talk with our AI companion. It\'s always here to listen and help.',
    targetId: 'chat-tab',
    position: 'top'
  },
  {
    id: 'profile',
    title: '👤 Profile',
    description: 'Manage your account settings, change password, and adjust preferences.',
    targetId: 'profile-button',
    position: 'bottom'
  }
];

export default function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('has_seen_tutorial', 'true');
    setShowTutorial(false);
    onComplete();
  };

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];
  const targetElement = document.getElementById(step.targetId);

  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        
        {/* Highlight cutout */}
        <div
          className="absolute bg-white/20 rounded-lg"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)'
          }}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bg-white rounded-xl shadow-2xl p-6 max-w-sm"
          style={{
            [step.position === 'bottom' ? 'top' : 'bottom']: rect.bottom + 16,
            [step.position === 'left' ? 'right' : 'left']: rect.left + rect.width / 2 - 150,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl">
              {step.id === 'avatar' && '✨'}
              {step.id === 'customize' && '🎨'}
              {step.id === 'journal' && '📔'}
              {step.id === 'reminisce' && '🌟'}
              {step.id === 'chat' && '💬'}
              {step.id === 'profile' && '👤'}
            </div>
            <div>
              <h3 className="font-bold text-lg">{step.title}</h3>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{step.description}</p>
          
          <div className="flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next →'}
            </button>
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {tutorialSteps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentStep ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
}
