import { useState, useEffect, useRef } from 'react';
import { useAvatar } from '../../contexts/AvatarContext';

// Animation mapping (FBX files from public/animations/)
const EMOTION_TO_ANIMATION: Record<string, string> = {
  "anger": "angry.fbx",
  "disgust": "disappointed.fbx",
  "fear": "scared.fbx",
  "joy": "happy.fbx",
  "neutral": "idle.fbx",
  "sadness": "sad.fbx",
  "surprise": "reacting.fbx"
};

// Scene mapping (GLB files from public/scenes/)
const EMOTION_TO_SCENE: Record<string, string> = {
  "anger": "/scenes/anger_scene.glb",
  "disgust": "/scenes/disgust_scene.glb",
  "fear": "/scenes/fear_scene.glb",
  "joy": "/scenes/joy_scene.glb",
  "neutral": "/scenes/neutral_scene.glb",
  "sadness": "/scenes/sadness_scene.glb",
  "surprise": "/scenes/surprise_scene.glb"
};

// Fallback colors if GLB scenes fail to load
export const EMOTION_COLORS: Record<string, string> = {
  "anger": "#FF4444",      // Red - anger
  "disgust": "#8B4513",    // Brown - disgust
  "fear": "#663399",       // Purple - fear
  "joy": "#FFD700",        // Gold - joy
  "neutral": "#FFC494",    // Peach - neutral
  "sadness": "#4A90D9",    // Blue - sadness
  "surprise": "#FF6B35"    // Orange - surprise
};

interface AnimationState {
  mode: 'single' | 'loop';
  emotions: string[];
}

interface UseAvatarEmotionProps {
  onAnimationChange?: (animation: string) => void;
  onSceneChange?: (scene: string) => void;
}

export function useAvatarEmotion({ onAnimationChange, onSceneChange }: UseAvatarEmotionProps = {}) {
  const [currentState, setCurrentState] = useState<AnimationState>({
    mode: 'single',
    emotions: ['neutral']
  });
  
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle.fbx');
  const [currentScene, setCurrentScene] = useState<string>('/scenes/neutral_scene.glb');
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  
  const loopIndexRef = useRef(0);
  const loopTimerRef = useRef<NodeJS.Timeout>();

  // Fetch initial avatar state from backend
  const fetchAvatarState = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const entries = await response.json();
        if (entries && entries.length > 0) {
          const latestEntry = entries[entries.length - 1];
          if (latestEntry.arbitration) {
            console.log('📥 Fetched latest avatar state:', latestEntry.arbitration);
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
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
    }

    loopIndexRef.current = 0;

    if (currentState.mode === 'single') {
      const emotion = currentState.emotions[0] || 'neutral';
      const animation = EMOTION_TO_ANIMATION[emotion] || 'idle.fbx';
      const scene = EMOTION_TO_SCENE[emotion] || '/scenes/neutral_scene.glb';
      
      setCurrentAnimation(animation);
      setCurrentScene(scene);
      setCurrentEmotion(emotion);
      onAnimationChange?.(animation);
      onSceneChange?.(scene);
      
      console.log('🎬 Single mode - Animation:', animation, 'Scene:', scene, 'Emotion:', emotion);
    } 
    else {
      // Loop mode: cycle through emotions every 5 seconds
      const validEmotions = currentState.emotions.filter(e => EMOTION_TO_ANIMATION[e]);
      
      if (validEmotions.length === 0) {
        setCurrentAnimation('idle.fbx');
        setCurrentScene('/scenes/neutral_scene.glb');
        setCurrentEmotion('neutral');
        onAnimationChange?.('idle.fbx');
        onSceneChange?.('/scenes/neutral_scene.glb');
        return;
      }

      const cycleAnimation = () => {
        const emotion = validEmotions[loopIndexRef.current % validEmotions.length];
        const animation = EMOTION_TO_ANIMATION[emotion];
        const scene = EMOTION_TO_SCENE[emotion];
        
        setCurrentAnimation(animation);
        setCurrentScene(scene);
        setCurrentEmotion(emotion);
        onAnimationChange?.(animation);
        onSceneChange?.(scene);
        
        console.log(`🔄 Loop mode [${loopIndexRef.current % validEmotions.length + 1}/${validEmotions.length}]:`, {
          emotion,
          animation,
          scene
        });

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
  }, [currentState, onAnimationChange, onSceneChange]);

  return {
    currentAnimation,
    currentScene,
    currentEmotion,
    currentState,
    updateFromBackend,
    fetchAvatarState
  };
}
