import React, { useState, useEffect, useRef } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { Canvas, useFrame } from "@react-three/fiber";
import JournalBook from "./journal/JournalBook";
import ReminiscePage from "./ReminiscePage"; 
import ProfilePage from './ProfilePage';
import BackgroundMusic from './BackgroundMusic';
import { useAvatarEmotion, EMOTION_COLORS } from './journal/useAvatarEmotion';
import * as THREE from 'three';

interface MainPageProps {
  avatarData: any;
  onCustomize: () => void;
  onLogout: () => void;
}

// Component to load and display GLB scene background
function SceneBackground({ url, emotion }: { url: string; emotion: string }) {
  const { scene } = useGLTF(url);
  const sceneRef = useRef<THREE.Group>();

  useEffect(() => {
    if (scene) {
      sceneRef.current = scene;
      
      // Configure the scene
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = false;
          // Ensure materials are visible
          if (mesh.material) {
            mesh.material.transparent = false;
          }
        }
      });
      
      // Scale and position the scene appropriately
      scene.scale.set(2, 2, 2);
      scene.position.set(0, -1, -3);
      scene.rotation.y = 0;
    }
  }, [scene]);

  if (!scene) return null;
  return <primitive object={scene} />;
}

// Component to center the avatar
function CenteredAvatar({ modelUrl, animation, emotionColor }: { modelUrl: string; animation: string; emotionColor: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Keep avatar centered and facing camera
      groupRef.current.position.set(0, -1.2, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <Avatar 
        modelUrl={modelUrl}
        animation={animation}
        scale={1.5}
        showBackground={false}
        backgroundColor={emotionColor}
      />
    </group>
  );
}

export default function MainPage({
  avatarData,
  onCustomize,
  onLogout,
}: MainPageProps) {

  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"avatar" | "journal" | "reminisce" | "chat">("avatar");
  const [avatarAnimation, setAvatarAnimation] = useState<string>("neutral");
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSceneUrl, setCurrentSceneUrl] = useState<string>("");
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [sceneLoaded, setSceneLoaded] = useState(false);

  const { 
    currentAnimation, 
    currentScene, 
    currentEmotion: hookEmotion,
  } = useAvatarEmotion({
    onAnimationChange: (anim) => setAvatarAnimation(anim),
    onSceneChange: (scene) => {
      setCurrentSceneUrl(scene);
      setSceneLoaded(false);
    }
  });

  useEffect(() => {
    setCurrentEmotion(hookEmotion);
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
            <div className="w-full h-full relative" style={{ minHeight: '500px', height: '70vh', maxHeight: '800px' }}>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={{ width: '100%', height: '100%', background: EMOTION_COLORS[currentEmotion] || '#FFC494' }}
                gl={{ alpha: false }}
                onCreated={({ gl }) => {
                  gl.setClearColor(new THREE.Color(EMOTION_COLORS[currentEmotion] || '#FFC494'));
                }}
              >
                {/* Scene Background - loads GLB */}
                {currentSceneUrl && (
                  <SceneBackground url={currentSceneUrl} emotion={currentEmotion} />
                )}
                
                {/* Lighting for the scene */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <directionalLight position={[-5, 5, 5]} intensity={0.5} />
                <pointLight position={[0, 3, 2]} intensity={0.5} />
                <hemisphereLight intensity={0.3} />
                
                {/* Avatar - centered */}
                {avatarData?.avatarUrl && (
                  <CenteredAvatar 
                    modelUrl={avatarData.avatarUrl}
                    animation={avatarAnimation}
                    emotionColor={EMOTION_COLORS[currentEmotion] || '#FFC494'}
                  />
                )}
                
                {/* Controls - allow zoom but keep centered */}
                <OrbitControls 
                  enableZoom={true}
                  enablePan={false}
                  enableRotate={true}
                  maxPolarAngle={Math.PI / 2.2}
                  minDistance={2}
                  maxDistance={8}
                  target={[0, -0.5, 0]}
                />
              </Canvas>
            </div>

            <button
              onClick={onCustomize}
              className="bg-purple-600 text-white px-6 py-2 rounded-full mt-4 z-10"
            >
              Customize Avatar
            </button>
          </div>
        );

      case "journal":
        return <JournalBook userId={userId || ''} />;
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
            onClick={() => setShowProfile(true)}
          />
          <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded-full">
            Logout
          </button>
        </div>
        {showProfile && (
          <ProfilePage userId={userId || ''} onClose={() => setShowProfile(false)} />
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 overflow-auto transition-colors duration-500 ${tabStyles[activeTab].bg}`}>
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

// Preload scenes for better performance
const sceneUrls = [
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fanger_scene.glb?alt=media",
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
