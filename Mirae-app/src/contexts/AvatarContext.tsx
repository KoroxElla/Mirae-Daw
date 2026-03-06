import React, { createContext, useContext, useState, useEffect } from 'react';

interface AvatarState {
  mode: 'single' | 'loop';
  emotions: string[];
  currentAnimation: string;
}

interface AvatarContextType {
  avatarState: AvatarState;
  updateAvatarState: (state: { mode: string; emotions: string[] }) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

// Emotion to animation mapping (same as your backend)
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

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    mode: 'single',
    emotions: ['neutral'],
    currentAnimation: 'idle.fbx'
  });

  // Update current animation whenever emotions or mode change
  useEffect(() => {
    if (avatarState.mode === 'single') {
      const emotion = avatarState.emotions[0] || 'neutral';
      const animation = EMOTION_TO_ANIMATION[emotion] || 'idle.fbx';
      setAvatarState(prev => ({ ...prev, currentAnimation: animation }));
    } else {
      // For loop mode, use the first animation for now (will cycle in useAvatarEmotion)
      const emotion = avatarState.emotions[0] || 'neutral';
      const animation = EMOTION_TO_ANIMATION[emotion] || 'idle.fbx';
      setAvatarState(prev => ({ ...prev, currentAnimation: animation }));
    }
  }, [avatarState.emotions, avatarState.mode]);

  const updateAvatarState = (state: { mode: string; emotions: string[] }) => {
    setAvatarState(prev => ({
      ...prev,
      mode: state.mode as 'single' | 'loop',
      emotions: state.emotions
    }));
  };

  return (
    <AvatarContext.Provider value={{ avatarState, updateAvatarState }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
