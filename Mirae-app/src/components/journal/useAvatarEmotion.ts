import { useState, useEffect, useRef } from 'react';
import { useAvatar } from '../../contexts/AvatarContext';

const EMOTION_TO_ANIMATION: Record<string, string> = {
  "joy": "happy.fbx",
  "trust": "trust.fbx",
  "anticipation": "excited.fbx",
  "positive": "celebrating.fbx",
  "surprise": "reacting.fbx",
  "anger": "angry.fbx",
  "sadness": "sad.fbx",
  "fear": "scared.fbx",
  "disgust": "disappointed.fbx",
  "negative": "depressed.fbx",
  "neutral": "idle.fbx"
};

interface AnimationState {
  mode: 'single' | 'loop';
  emotions: string[];
}

interface UseAvatarEmotionProps {
  onAnimationChange?: (animation: string) => void;
}

export function useAvatarEmotion({ onAnimationChange }: UseAvatarEmotionProps = {}) {
  const [currentState, setCurrentState] = useState<AnimationState>({
    mode: 'single',
    emotions: ['neutral']
  });
  
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle.fbx');
  const loopIndexRef = useRef(0);
  const loopTimerRef = useRef<NodeJS.Timeout>();


  // Fetch initial avatar state from backend
  const fetchAvatarState = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/journal/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const entries = await response.json();
        // Get the most recent entry's emotion state
        if (entries && entries.length > 0) {
          const latestEntry = entries[entries.length - 1];
          if (latestEntry.arbitration) {
            console.log('📥 Fetched latest avatar state from backend:', latestEntry.arbitration);
            setCurrentState({
              mode: latestEntry.arbitration.mode as 'single' | 'loop',
              emotions: latestEntry.arbitration.emotions
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching avatar state:', error);
    }
  };

  useEffect(() => {
    fetchAvatarState();
  }, []);

  // Handle new emotion data from backend
  const updateFromBackend = (data: { 
    mode: string; 
    emotions: string[]; 
  }) => {
    console.log('🎭 Avatar emotion update:', data);
    setCurrentState({
      mode: data.mode as 'single' | 'loop',
      emotions: data.emotions
    });
  };

  // Handle loop mode animation cycling
  useEffect(() => {
    // Clear any existing timer
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
    }

    // Reset loop index
    loopIndexRef.current = 0;

    if (currentState.mode === 'single') {
      // Single mode: just play the first animation
      const emotion = currentState.emotions[0] || 'neutral';
      const animation = EMOTION_TO_ANIMATION[emotion] || 'idle.fbx';
      setCurrentAnimation(animation);
      onAnimationChange?.(animation);
      console.log('🎬 Playing single animation:', animation, 'from emotion:', emotion);
    } else {
      // Loop mode: cycle through animations every 5 seconds
      const animations = currentState.emotions
	.map(emotion => EMOTION_TO_ANIMATION[emotion] || 'idle.fbx')
        if (animations.length === 0){
          // Fallback to idle if no valid animations
          setCurrentAnimation('idle.fbx');
          onAnimationChange?.('idle.fbx');
          return;
        };

        const cycleAnimation = () => {
          const animation = animations[loopIndexRef.current % animations.length];
          setCurrentAnimation(animation);
          onAnimationChange?.(animation);
        
        console.log(`🔄 Loop mode: ${animation} (from emotions: ${currentState.emotions.join(', ')})`);

        loopIndexRef.current++;
        loopTimerRef.current = setTimeout(cycleAnimation, 5000);
    };

      cycleAnimation();
    }

    return () => {
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
      }
    };
  }, [currentState, onAnimationChange]);

  return {
    currentAnimation,
    currentState,
    updateFromBackend,
    fetchAvatarState

  };
}
