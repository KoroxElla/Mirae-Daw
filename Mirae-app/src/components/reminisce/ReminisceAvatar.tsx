import React, { useState, useEffect } from "react";
import AvatarDisplay, { AvatarConfig } from "./AvatarDisplay";
import AvatarCustomizer from "./AvatarCustomizer";

const DEFAULT_CONFIG: AvatarConfig = {
  skinColor: "Light",
  hairStyle: "LongHairBigHair",
  hairColor: "BrownDark",
  eyes: "Default",
  eyebrows: "Default",
  mouth: "Default",
  clothes: "Hoodie",
  facialHair: "Blank",
  accessories: "Blank",
};

interface Props {
  onConfigChange?: (config: AvatarConfig) => void;
  initialConfig?: AvatarConfig;
}

const ReminisceAvatar: React.FC<Props> = ({ onConfigChange, initialConfig }) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_CONFIG);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load saved config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reminisce_avatar_config");
    if (saved && !initialConfig) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved config");
      }
    }
  }, [initialConfig]);

  const handleConfigChange = (newConfig: AvatarConfig) => {
    setConfig(newConfig);
    localStorage.setItem("reminisce_avatar_config", JSON.stringify(newConfig));
    onConfigChange?.(newConfig);
  };

  return (
    <>
      {/* Floating Avatar Button */}
      <div className="fixed bottom-6 left-6 z-30">
        <div
          onClick={() => setIsCustomizing(true)}
          className="cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition" />
            <AvatarDisplay config={config} size={70} />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
            Customize ✨
          </div>
        </div>
      </div>

      {/* Customizer Modal */}
      {isCustomizing && (
        <AvatarCustomizer
          config={config}
          onChange={handleConfigChange}
          onClose={() => setIsCustomizing(false)}
        />
      )}
    </>
  );
};

export default ReminisceAvatar;
