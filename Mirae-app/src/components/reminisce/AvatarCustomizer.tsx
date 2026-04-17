import React, { useState } from "react";
import AvatarDisplay, { AvatarConfig } from "./AvatarDisplay";

interface Props {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  onClose: () => void;
}

// All available options for each category
const OPTIONS = {
  skinColor: ["Light", "Pale", "Brown", "DarkBrown", "Black"],
  hairStyle: [
    "ShortHairShortFlat", "ShortHairShortRound", "ShortHairShaggy", 
    "ShortHairShaggyMullet", "ShortHairSides", "ShortHairTheCaesar", 
    "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", 
    "LongHairCurvy", "LongHairDreads", "LongHairFrida", "LongHairFro", 
    "LongHairFroBand", "LongHairMiaWallace", "LongHairNotTooLong", 
    "LongHairShavedSides", "LongHairStraight", "LongHairStraight2", 
    "LongHairStraightStrand"
  ],
  hairColor: ["BrownDark", "Brown", "Blonde", "BlondeGolden", "Red", "Black", "Platinum", "SilverGray", "PastelPink"],
  eyes: ["Default", "Happy", "Sad", "Worried", "Angry", "Cry", "Close", "EyeRoll", "Surprised", "Squint", "Hearts"],
  eyebrows: ["Default", "Raised", "Sad", "Angry", "Worried", "Up", "Down"],
  mouth: ["Default", "Smile", "Sad", "Frown", "Serious", "Twinkle", "Disbelief", "Tongue", "Grimace", "ScreamOpen"],
  clothes: ["Hoodie", "BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "ShirtCrewNeck", "ShirtVNeck", "Overall"],
  facialHair: ["Blank", "BeardMedium", "BeardLight", "BeardMajestic", "MoustacheFancy", "MoustacheMagnum"],
  accessories: ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"],
};

const CATEGORY_LABELS: Record<string, string> = {
  skinColor: "🎨 Skin",
  hairStyle: "💇 Hairstyle",
  hairColor: "🎨 Hair Color",
  eyes: "👁️ Eyes",
  eyebrows: "📏 Eyebrows",
  mouth: "😊 Mouth",
  clothes: "👕 Outfit",
  facialHair: "🧔 Facial Hair",
  accessories: "🕶️ Accessories",
};

const CATEGORY_ICONS: Record<string, string> = {
  skinColor: "🎨",
  hairStyle: "💇",
  hairColor: "🖌️",
  eyes: "👁️",
  eyebrows: "📐",
  mouth: "😊",
  clothes: "👕",
  facialHair: "🧔",
  accessories: "🕶️",
};

const AvatarCustomizer: React.FC<Props> = ({ config, onChange, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const updateConfig = (category: keyof AvatarConfig, value: string) => {
    onChange({ ...config, [category]: value });
    setSelectedCategory(null);
  };

  // Quick options bubbles (like in your screenshot)
  const quickOptions = [
    { icon: "👁️", label: "Eyes", category: "eyes" },
    { icon: "💇", label: "Hair", category: "hairStyle" },
    { icon: "👕", label: "Clothes", category: "clothes" },
    { icon: "🎨", label: "Skin", category: "skinColor" },
    { icon: "😊", label: "Mouth", category: "mouth" },
    { icon: "📏", label: "Eyebrows", category: "eyebrows" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Customization Window */}
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Customize Avatar</h2>
              <p className="text-white/80 text-sm">Make it uniquely yours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Preview Section */}
        <div className="flex justify-center py-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-50" />
            <AvatarDisplay config={config} size={150} />
          </div>
        </div>

        {/* Quick Options Bubbles (like your screenshot) */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3 text-center">Quick customize</p>
          <div className="flex justify-center gap-3">
            {quickOptions.map((option) => (
              <button
                key={option.category}
                onClick={() => setSelectedCategory(option.category)}
                className="group relative flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center text-2xl transition-all group-hover:scale-110">
                  {option.icon}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-purple-600">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection Panel (like screenshot with face, eyes, hair, clothes, backs) */}
        {!selectedCategory && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">All Features</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-purple-50 transition group"
                >
                  <span className="text-xl">{CATEGORY_ICONS[key]}</span>
                  <span className="text-sm text-gray-700 group-hover:text-purple-600">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Option Selection Panel */}
        {selectedCategory && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-purple-600 text-sm flex items-center gap-1"
              >
                ← Back to all
              </button>
              <p className="text-sm font-medium text-gray-700">
                {CATEGORY_LABELS[selectedCategory]}
              </p>
              <div className="w-16" />
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {OPTIONS[selectedCategory as keyof typeof OPTIONS]?.map((option) => (
                  <button
                    key={option}
                    onClick={() => updateConfig(selectedCategory as keyof AvatarConfig, option)}
                    onMouseEnter={() => setHoveredOption(option)}
                    onMouseLeave={() => setHoveredOption(null)}
                    className={`
                      relative px-3 py-2 rounded-lg text-sm transition-all
                      ${config[selectedCategory as keyof AvatarConfig] === option
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-purple-50"
                      }
                    `}
                  >
                    {option.replace(/([A-Z])/g, ' $1').trim()}
                    
                    {/* Preview tooltip */}
                    {hoveredOption === option && (
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-white rounded-lg shadow-xl p-2">
                          <AvatarDisplay 
                            config={{ ...config, [selectedCategory]: option }}
                            size={60}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
