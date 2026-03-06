import React, { useState } from "react";
import AvatarDisplay, { AvatarConfig } from "./AvatarDisplay";
import AvatarCustomizer from "./AvatarCustomizer";

const ReminisceAvatar: React.FC = () => {

  const [config, setConfig] = useState<AvatarConfig>({
    skinColor: "Light",
    hairStyle: "ShortHairShortFlat",
    hairColor: "BrownDark",
    eyes: "Default",
    clothes: "Hoodie",
    facialHair: "Blank",
    accessories: "Blank"
  });

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 flex flex-col items-center">

      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:scale-105 transition"
      >
        <AvatarDisplay config={config} size={120} />
      </div>

      <p className="text-sm mt-2 text-white">Customize</p>

      {isEditing && (
        <AvatarCustomizer
          config={config}
          onChange={setConfig}
          onClose={() => setIsEditing(false)}
        />
      )}

    </div>
  );
};

export default ReminisceAvatar;
