import React, { useState, useEffect } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { Canvas } from "@react-three/fiber";
import JournalBook from "./journal/JournalBook";
import ReminiscePage from "./ReminiscePage"; 
import ProfilePage from './ProfilePage';
import BackgroundMusic from './BackgroundMusic';
import { useAvatarEmotion, EMOTION_COLORS } from './journal/useAvatarEmotion';

interface MainPageProps {
  avatarData: any;
  onCustomize: () => void;
  onLogout: () => void;
}

function AvatarModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}

export default function MainPage({
  avatarData,
  onCustomize,
  onLogout,
}: MainPageProps) {

  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "avatar" | "journal" | "reminisce" | "chat"
  >("avatar");

  // Avatar animation state from journal
  const [avatarAnimation, setAvatarAnimation] = useState<string>("neutral");
  
  // Get user ID from token
  const [userId, setUserId] = useState<string | null>(null);

  const [currentSceneUrl, setCurrentSceneUrl] = useState<string>("/scenes/neutral_scene.glb");
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");

  const { 
    currentAnimation, 
    currentScene, 
    currentEmotion: hookEmotion,
    updateFromBackend 
  } = useAvatarEmotion({
    onAnimationChange: (anim) => setAvatarAnimation(anim),
    onSceneChange: (scene) => setCurrentSceneUrl(scene)
  });

  // Updates currentEmotion
  useEffect(() => {
    setCurrentEmotion(hookEmotion);
  }, [hookEmotion]);

  // Decode user ID from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to get user_id
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUserId(payload.user_id || payload.sub);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  const tabStyles = {
    avatar: {
      ring: "ring-orange-400",
      bg: "bg-orange-100",
    },
    journal: {
      ring: "ring-blue-400",
      bg: "bg-blue-100",
    },
    reminisce: {
      ring: "ring-orange-400",
      bg: "bg-orange-100",
    },
    chat: {
      ring: "ring-amber-700",
      bg: "bg-amber-100",
    },
  };

  const renderContent = () => {
    switch (activeTab) {
      case "avatar":
        return (
          <div className="flex flex-col items-center">
            <div className="w-full h-full relative" style={{ minHeight: '400px', height: '70vh', maxHeight: '800px' }}>
              <Canvas camera={{ position: [0, 0.5, 4], fov: 40 }}
                      style={{ width: '100%', height: '100%' }}
                      resize={{ scroll: true, debounce: { scroll: 50, resize: 0 } }}>
                {currentSceneUrl && (
                  <Environment files={currentSceneUrl} background />
                )}
                <OrbitControls 
                  enableZoom={true}
                  enablePan={false}
                  maxPolarAngle={Math.PI / 2}
                  minDistance={2}
                  maxDistance={6}
                />
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} />
                <directionalLight position={[-2, 2, 2]} intensity={0.5} />
                <pointLight position={[0, 3, 0]} intensity={0.3} />

                {avatarData?.avatarUrl && (
                  <Avatar 
                    modelUrl={avatarData.avatarUrl}
                    animation={avatarAnimation} // Use the dynamic animation
                    scale={1.5} 
                    showBackground={true}
                    backgroundColor={EMOTION_COLORS[currentEmotion] || '#FFC494'}
                  />
                )}
              </Canvas>
            </div>

            <button
              onClick={onCustomize}
              className="bg-purple-600 text-white px-6 py-2 rounded-full mt-4"
            >
              Customize Avatar
            </button>
          </div>
        );

      case "journal":
        return (
          <JournalBook 
            userId={userId || ''} 
          />
        );

      case "reminisce":
        return <ReminiscePage userId={userId} />;

      case "chat":
        return <h2 className="text-xl">Chat Time Page (Coming Next)</h2>;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="font-bold text-lg">Mirae Daw</h1>

        <div className="flex gap-3 items-center">
          <img
            src="/main_icons/profile.png"
            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
            alt="profile"
            onClick={() => setShowProfile(true)}
          />
          <img
            src="/main_icons/Settings.png"
            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
            alt="settings"
            onClick={() => setShowProfile(true)}
          />
          <button
            onClick={onLogout}
            className="text-sm bg-gray-200 px-3 py-1 rounded-full"
          >
            Logout
          </button>
        </div>
        {showProfile && (
          <ProfilePage 
             userId={userId || ''}
             onClose={() => setShowProfile(false)}
          />
        )}

      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-start justify-start p-4 overflow-auto transition-colors duration-500 ${tabStyles[activeTab].bg}`}>
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white shadow-inner p-4 flex justify-around">
        <button onClick={() => setActiveTab("avatar")}>
          <img
            src="/main_icons/avatar.png"
            className={`w-8 h-8 ${
              activeTab === "avatar" ? `ring-4 ${tabStyles.avatar.ring} p-1` : "opacity-50"
            }`}
            alt="avatar"
          />
        </button>

        <button onClick={() => setActiveTab("journal")}>
          <img
            src="/main_icons/journal.png"
            className={`w-8 h-8 ${
              activeTab === "journal" ? `ring-4 ${tabStyles.journal.ring} p-1` : "opacity-50"
            }`}
            alt="journal"
          />
        </button>

        <button onClick={() => setActiveTab("reminisce")}>
          <img
            src="/main_icons/reminisce.png"
            className={`w-8 h-8 ${
              activeTab === "reminisce" ? `ring-4 ${tabStyles.reminisce.ring} p-1` : "opacity-50"
            }`}
            alt="reminisce"
          />
        </button>

        <button onClick={() => setActiveTab("chat")}>
          <img
            src="/main_icons/chattime.png"
            className={`w-8 h-8 ${
              activeTab === "chat" ? `ring-4 ${tabStyles.chat.ring} p-1` : "opacity-50"
            }`}
            alt="chat"
          />
        </button>
        <BackgroundMusic />
      </div>
    </div>
  );
}
