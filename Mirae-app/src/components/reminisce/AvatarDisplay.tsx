import React from "react";

export interface AvatarConfig {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  clothes: string;
  facialHair: string;
  accessories: string;
}

interface Props {
  config: AvatarConfig;
  size?: number;
}

const AvatarDisplay: React.FC<Props> = ({ config, size = 120 }) => {

  const url = `https://avataaars.io/?avatarStyle=Transparent
  &topType=${config.hairStyle}
  &accessoriesType=${config.accessories}
  &hairColor=${config.hairColor}
  &facialHairType=${config.facialHair}
  &clotheType=${config.clothes}
  &eyeType=${config.eyes}
  &skinColor=${config.skinColor}`;

  return (
    <img
      src={url}
      alt="Avatar"
      style={{ width: size, height: size }}
      className="rounded-full"
    />
  );
};

export default AvatarDisplay;
