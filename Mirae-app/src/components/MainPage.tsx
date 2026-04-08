import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

// Optimized SceneBackground component with memoization
const SceneBackground = React.memo(({ url, emotion, onLoad, onError }: { url: string; emotion: string; onLoad?: () => void; onError?: () => void; }) => {
  const { scene, error } = useGLTF(url);
  const sceneRef = useRef<THREE.Group>();
  const { gl } = useThree();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (error) {
      console.error("Error loading scene:", error);
      onError?.();
      return;
    }

    if (scene && !loadedRef.current) {
      loadedRef.current = true;
      try {
        // Use the scene directly without cloning to save memory
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            
            // Fix material issues
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                  mat.side = THREE.DoubleSide;
                });
              } else {
                mesh.material.side = THREE.DoubleSide;
              }
            }
          }
        });
        
        sceneRef.current = scene;
        onLoad?.();
        
      } catch (err) {
        console.error("Error processing scene:", err);
        onError?.();
      }
    }
  }, [scene, error, onLoad, onError]);

  if (error || !scene) return null;
  return <primitive object={scene} />;
});

// Optimized CenteredAvatar component
const CenteredAvatar = React.memo(({ modelUrl, animation, emotionColor, onLoad }: { modelUrl: string; animation: string; emotionColor: string; onLoad?: () => void; }) => {
  const groupRef = useRef<THREE.Group>(null);
  const loadedRef = useRef(false);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, -1.2, 0);
    }
  });

  const handleLoad = useCallback(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      onLoad?.();
    }
  }, [onLoad]);

  return (
    <group ref={groupRef}>
      <Avatar 
        modelUrl={modelUrl}
        animation={animation}
        scale={1.5}
        showBackground={false}
        backgroundColor={emotionColor}
        onLoad={handleLoad}
      />
    </group>
  );
});

// Main Canvas component with proper cleanup
function AvatarScene({ 
  currentSceneUrl, 
  currentEmotion, 
  avatarData, 
  avatarAnimation, 
  onSceneLoaded, 
  onAvatarLoaded,
  isVisible
}: { 
  currentSceneUrl: string; 
  currentEmotion: string; 
  avatarData: any; 
  avatarAnimation: string; 
  onSceneLoaded: () => void;
  onAvatarLoaded: () => void;
  isVisible: boolean;
}) {
  const [sceneReady, setSceneReady] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const sceneLoadedRef = useRef(false);
  const avatarLoadedRef = useRef(false);
  const renderCountRef = useRef(0);

  // Prevent multiple load calls
  const handleSceneLoad = useCallback(() => {
    if (!sceneLoadedRef.current) {
      sceneLoadedRef.current = true;
      setSceneReady(true);
      onSceneLoaded();
    }
  }, [onSceneLoaded]);

  const handleSceneError = useCallback(() => {
    console.error("Scene failed to load");
    if (!sceneLoadedRef.current) {
      sceneLoadedRef.current = true;
      setSceneReady(true);
      onSceneLoaded();
    }
  }, [onSceneLoaded]);

  const handleAvatarLoad = useCallback(() => {
    if (!avatarLoadedRef.current) {
      avatarLoadedRef.current = true;
      setAvatarReady(true);
      onAvatarLoaded();
    }
  }, [onAvatarLoaded]);

  // Reset refs when URL changes
  useEffect(() => {
    sceneLoadedRef.current = false;
    avatarLoadedRef.current = false;
    setSceneReady(false);
    setAvatarReady(false);
    
    // Log only once per URL change
    renderCountRef.current++;
    if (renderCountRef.current <= 2) {
      console.log("Loading scene:", currentSceneUrl);
    }
  }, [currentSceneUrl]);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ 
        width: '100%', 
        height: '100%', 
        background: EMOTION_COLORS[currentEmotion] || '#FFC494',
        display: 'block'
      }}
      gl={{ 
        alpha: false,
        antialias: true,
        powerPreference: "high-performance"
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(EMOTION_COLORS[currentEmotion] || '#FFC494'));
        scene.background = new THREE.Color(EMOTION_COLORS[currentEmotion] || '#FFC494');
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />
      
      {/* Scene Background */}
      {currentSceneUrl && (
        <SceneBackground 
          key={currentSceneUrl}
          url={currentSceneUrl} 
          emotion={currentEmotion} 
          onLoad={handleSceneLoad}
          onError={handleSceneError}
        />
      )}
      
      {/* Avatar */}
      { avatarData?.avatarUrl && (
        <CenteredAvatar 
          modelUrl={avatarData.avatarUrl}
          animation={avatarAnimation}
          emotionColor={EMOTION_COLORS[currentEmotion] || '#FFC494'}
          onLoad={handleAvatarLoad}
        />
      )}
      
      {/* Controls */}
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
  );
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
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use ref to track if we've already set initial scene
  const initialSceneSetRef = useRef(false);
  const animationRef = useRef(avatarAnimation);

  const { 
    currentAnimation, 
    currentScene, 
    currentEmotion: hookEmotion,
  } = useAvatarEmotion({
    onAnimationChange: (anim) => {
      console.log("Animation changed to:", anim);
      setAvatarAnimation(anim);
    },
    onSceneChange: (scene) => {
      // Only update scene if it's different from current
      if (scene !== currentSceneUrl) {
        console.log("Scene changed to:", scene);
        setCurrentSceneUrl(scene);
        setSceneLoaded(false);
        setAvatarLoaded(false);
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

  // Reset loading states when tab changes
  useEffect(() => {
    if (activeTab !== "avatar") {
      // Clean up when leaving avatar tab
      setSceneLoaded(false);
      setAvatarLoaded(false);
    }
  }, [activeTab]);

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
              {(!sceneLoaded || !avatarLoaded) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">
                      {!sceneLoaded ? "Loading scene..." : "Loading avatar..."}
                    </p>
                  </div>
                </div>
              )}
              
              {isInitialized && (
                <AvatarScene
                  currentSceneUrl={currentSceneUrl}
                  currentEmotion={currentEmotion}
                  avatarData={avatarData}
                  avatarAnimation={avatarAnimation}
                  onSceneLoaded={() => setSceneLoaded(true)}
                  onAvatarLoaded={() => setAvatarLoaded(true)}
                  isVisible={activeTab === "avatar"}
                />
              )}
            </div>

            <button
              onClick={onCustomize}
              className="bg-purple-600 text-white px-6 py-2 rounded-full mt-4 z-10 hover:bg-purple-700 transition-colors"
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
          <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">
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
