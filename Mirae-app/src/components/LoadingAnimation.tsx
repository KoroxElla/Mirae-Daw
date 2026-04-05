import React, { useState, useEffect } from 'react';

interface LoadingAnimationProps {
  onComplete?: () => void;
  stages?: string[];
}

export default function LoadingAnimation({ 
  onComplete, 
  stages = ['Retrieving avatar...', 'Loading resources...', 'Animating avatar...', 'Preparing scene...'] 
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        // Update stage every 25%
        const newProgress = prev + 2;
        const newStageIndex = Math.min(Math.floor(newProgress / 25), stages.length - 1);
        if (newStageIndex !== stageIndex) {
          setStageIndex(newStageIndex);
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [stageIndex, stages.length, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
      {/* Animated avatar silhouette */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-purple-200 rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-purple-300 rounded-full animate-bounce" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>

      {/* Progress text */}
      <p className="text-lg font-medium text-gray-700 mb-2">{stages[stageIndex]}</p>
      
      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-purple-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Percentage */}
      <p className="text-sm text-gray-500 mt-2">{Math.floor(progress)}%</p>
    </div>
  );
}
