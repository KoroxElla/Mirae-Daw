import React from "react";

export interface AvatarConfig {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  clothes: string;
  facialHair: string;
  accessories: string;
}

interface Props {
  config: AvatarConfig;
  size?: number;
  emotion?: string;
}

const AvatarDisplay: React.FC<Props> = ({ config, size = 120, emotion }) => {
  // Apply emotion-based facial features if emotion is provided
  const getEmotionFeatures = (emotion: string) => {
    const features = {
      happy: { eyes: "Happy", eyebrows: "Raised", mouth: "Smile" },
      calm: { eyes: "Default", eyebrows: "Default", mouth: "Smile" },
      sad: { eyes: "Sad", eyebrows: "Sad", mouth: "Sad" },
      anxious: { eyes: "Worried", eyebrows: "Worried", mouth: "Frown" },
      angry: { eyes: "Angry", eyebrows: "Angry", mouth: "Frown" },
    };
    return features[emotion as keyof typeof features] || features.calm;
  };

  const finalConfig = emotion 
    ? { ...config, ...getEmotionFeatures(emotion) }
    : config;

  const url = `https://avataaars.io/?avatarStyle=Transparent
    &topType=${finalConfig.hairStyle}
    &accessoriesType=${finalConfig.accessories}
    &hairColor=${finalConfig.hairColor}
    &facialHairType=${finalConfig.facialHair}
    &clotheType=${finalConfig.clothes}
    &eyeType=${finalConfig.eyes}
    &eyebrowType=${finalConfig.eyebrows}
    &mouthType=${finalConfig.mouth}
    &skinColor=${finalConfig.skinColor}`.replace(/\s/g, '');

  return (
    <img
      src={url}
      alt="Avatar"
      style={{ width: size, height: size }}
      className="rounded-full shadow-lg"
    />
  );
};

export default AvatarDisplay;
