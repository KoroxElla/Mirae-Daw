export interface AvatarConfig {
  // Skin
  skinColor: string;
  
  // Hair
  hairStyle: string;
  hairColor: string;
  
  // Facial Features
  eyes: string;
  eyebrows: string;
  mouth: string;
  
  // Accessories
  accessories: string;
  facialHair: string;
  clothes: string;
  
  // Emotion override (for game mode)
  emotionOverride?: string;
}

export const EMOTION_TO_FACIAL = {
  happy: { eyebrows: "Raised", eyes: "Happy", mouth: "Smile" },
  calm: { eyebrows: "Default", eyes: "Default", mouth: "Smile" },
  neutral: { eyebrows: "Default", eyes: "Default", mouth: "Default" },
  sad: { eyebrows: "Sad", eyes: "Sad", mouth: "Sad" },
  anxious: { eyebrows: "Worried", eyes: "Worried", mouth: "Frown" },
  angry: { eyebrows: "Angry", eyes: "Angry", mouth: "Frown" },
} as const;
