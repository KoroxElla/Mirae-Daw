import  { useState, useEffect, useRef } from "react";
import { useGLTF} from "@react-three/drei";
import JournalBook from "./journal/JournalBook";
import ReminiscePage from "./ReminiscePage"; 
import SettingsPage from './SettingsPage';
import ProfilePage from './ProfilePage';
import AvatarScene from "./AvatarScene";
import ChatPage from "./ChatPage";
import DailyEncouragement from "./DailyEncouragement";
import BackgroundMusic from './BackgroundMusic';
import { useAvatarEmotion } from './journal/useAvatarEmotion';
import GameSidebar from "./GameSidebar";

interface MainPageProps {
  avatarData: any;
  onCustomize: () => void;
  onLogout: () => void;
}
    

export default function MainPage({
  avatarData,
  onCustomize,
  onLogout,
}: MainPageProps) {

  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"avatar" | "journal" | "reminisce" | "chat">("avatar");
  const [avatarAnimation, setAvatarAnimation] = useState<string>("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSceneUrl, setCurrentSceneUrl] = useState<string>("");
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Use ref to track if we've already set initial scene
  const initialSceneSetRef = useRef(false);
  const animationRef = useRef(avatarAnimation);


  const { 
    currentAnimation, 
    currentScene, 
    currentEmotion: hookEmotion,
  } = useAvatarEmotion({
    onAnimationChange: (emotion) => {
      console.log("Emotion changed to:", emotion);
      setCurrentEmotion(emotion);
    },
    onSceneChange: (scene) => {
      // Only update scene if it's different from current
      if (scene !== currentSceneUrl) {
        console.log("Scene changed to:", scene);
        setCurrentSceneUrl(scene);
      }
    }
  });

  // Update animation ref
  useEffect(() => {
    animationRef.current = avatarAnimation;
  }, [avatarAnimation]);

  // Set initial scene only once
  useEffect(() => {
    if (currentScene && !initialSceneSetRef.current) {
      initialSceneSetRef.current = true;
      setCurrentSceneUrl(currentScene);
      setCurrentEmotion(hookEmotion);
      setIsInitialized(true);
    }
  }, [currentScene, hookEmotion]);

  // Update emotion when it changes
  useEffect(() => {
    if (hookEmotion) {
      setCurrentEmotion(hookEmotion);
    }
  }, [hookEmotion]);

  // Decode user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUserId(payload.user_id || payload.sub);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  // Listen for journal chat events
  useEffect(() => {
    const handler = () => {
      setActiveTab("chat");
    };

    window.addEventListener("startChatFromJournal", handler);
    return () => window.removeEventListener("startChatFromJournal", handler);
  }, []);


  const tabStyles = {
    avatar: { ring: "ring-orange-400", bg: "bg-orange-100" },
    journal: { ring: "ring-blue-400", bg: "bg-blue-100" },
    reminisce: { ring: "ring-orange-400", bg: "bg-orange-100" },
    chat: { ring: "ring-amber-700", bg: "bg-amber-100" },
  };

  const renderContent = () => {
    switch (activeTab) {
      case "avatar":
        return (
          <div className="flex flex-col items-center w-full h-full">
            <div
              className="w-full h-full relative"
              style={{ minHeight: "500px", height: "70vh", maxHeight: "800px" }}
            >
              {/* Optional lightweight loader (non-blocking) */}
              {!isInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                  <div className="text-white">Initializing...</div>
                </div>
              )}

              {isInitialized && (
                <>
                  <AvatarScene
                    currentSceneUrl={currentSceneUrl}
                    currentEmotion={currentEmotion}
                    avatarData={avatarData}
                  />

                  <GameSidebar />
                </>
                
              )}
            </div>

            <button
              onClick={onCustomize}
              className="bg-purple-600 text-white px-6 py-2 rounded-full mt-4 hover:bg-purple-700"
            >
              Customize Avatar
            </button>
            <DailyEncouragement userId={userId || ''} />
          </div>
        );

      case "journal":
        return <JournalBook userId={userId || ''} />;
      case "reminisce":
        return <ReminiscePage userId={userId} />;
      case "chat":
        return <ChatPage userId={userId || ''}/>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white shadow z-20">
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
            onClick={() => setShowSettings(true)}
          />
          <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">
            Logout
          </button>
        </div>
        {showProfile && (
          <ProfilePage userId={userId || ''} onClose={() => setShowProfile(false)} />
        )}
        {showSettings && (
          <SettingsPage userId={userId || ''} onClose={() => setShowSettings(false)} />
        )}
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto transition-colors duration-500"
        style={
          activeTab === "chat"
            ? {
                backgroundImage: "url('/Chattime.png')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }
            : {}
        }
      >
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white shadow-inner p-4 flex justify-around z-20">
        <button onClick={() => setActiveTab("avatar")}>
          <img src="/main_icons/avatar.png" className={`w-8 h-8 ${activeTab === "avatar" ? `ring-4 ${tabStyles.avatar.ring} p-1` : "opacity-50"}`} alt="avatar" />
        </button>
        <button onClick={() => setActiveTab("journal")}>
          <img src="/main_icons/journal.png" className={`w-8 h-8 ${activeTab === "journal" ? `ring-4 ${tabStyles.journal.ring} p-1` : "opacity-50"}`} alt="journal" />
        </button>
        <button onClick={() => setActiveTab("reminisce")}>
          <img src="/main_icons/reminisce.png" className={`w-8 h-8 ${activeTab === "reminisce" ? `ring-4 ${tabStyles.reminisce.ring} p-1` : "opacity-50"}`} alt="reminisce" />
        </button>
        <button onClick={() => setActiveTab("chat")}>
          <img src="/main_icons/chattime.png" className={`w-8 h-8 ${activeTab === "chat" ? `ring-4 ${tabStyles.chat.ring} p-1` : "opacity-50"}`} alt="chat" />
        </button>
        <BackgroundMusic />
      </div>
    </div>
  );
}

// Preload scenes with a delay to not block initial render
setTimeout(() => {
  const sceneUrls = [
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fangry_scene.glb?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fdisgust_scene.glb?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Ffear_scene.glb?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fjoy_scene.glb?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fneutral_scene.glb?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fsadness_scene.glb?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fsurprise_scene.glb?alt=media"
  ];
  sceneUrls.forEach(url => {
    useGLTF.preload(url);
  });
}, 1000);
