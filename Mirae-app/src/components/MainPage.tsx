import React, { useState, useEffect, useRef } from "react";
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

// Component to load and display GLB scene background with better error handling
function SceneBackground({ url, emotion, onLoad, onError }: { url: string; emotion: string; onLoad?: () => void; onError?: () => void; }) {
  const { scene, error } = useGLTF(url);
  const sceneRef = useRef<THREE.Group>();
  const { gl } = useThree();

  useEffect(() => {
    if (error) {
      console.error("Error loading scene:", error);
      onError?.();
      return;
    }

    if (scene) {
      try {
        // Clone the scene to avoid conflicts
        const clonedScene = scene.clone();
        sceneRef.current = clonedScene;
        
        // Configure the scene
        clonedScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            
            // Fix material issues
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                  mat.side = THREE.DoubleSide;
                  mat.needsUpdate = true;
                });
              } else {
                mesh.material.side = THREE.DoubleSide;
                mesh.material.needsUpdate = true;
              }
            }
          }
        });
        
        // Scale and position the scene appropriately
        clonedScene.scale.set(1, 1, 1);
        clonedScene.position.set(0, 0, 0);
        clonedScene.rotation.y = 0;
        
        // Force a render update
        gl.renderLists.dispose();
        
        // Small delay to ensure everything is ready
        setTimeout(() => {
          onLoad?.();
        }, 100);
        
      } catch (err) {
        console.error("Error processing scene:", err);
        onError?.();
      }
    }
    
    return () => {
      // Cleanup
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [scene, error, gl, onLoad, onError]);

  if (error || !scene) return null;
  return <primitive object={sceneRef.current || scene} />;
}

// Component to center the avatar
function CenteredAvatar({ modelUrl, animation, emotionColor, onLoad }: { modelUrl: string; animation: string; emotionColor: string; onLoad?: () => void; }) {
  const groupRef = useRef<THREE.Group>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      // Keep avatar centered and facing camera
      groupRef.current.position.set(0, -1.2, 0);
    }
  });

  const handleAvatarLoad = () => {
    setAvatarLoaded(true);
    onLoad?.();
  };

  return (
    <group ref={groupRef}>
      <Avatar 
        modelUrl={modelUrl}
        animation={animation}
        scale={1.5}
        showBackground={false}
        backgroundColor={emotionColor}
        onLoad={handleAvatarLoad}
      />
    </group>
  );
}

// Separate Canvas wrapper component to handle re-renders better
function AvatarScene({ 
  currentSceneUrl, 
  currentEmotion, 
  avatarData, 
  avatarAnimation, 
  onSceneLoaded, 
  onAvatarLoaded 
}: { 
  currentSceneUrl: string; 
  currentEmotion: string; 
  avatarData: any; 
  avatarAnimation: string; 
  onSceneLoaded: () => void;
  onAvatarLoaded: () => void;
}) {
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const cameraRef = useRef();

  const handleSceneLoad = () => {
    setSceneReady(true);
    onSceneLoaded();
  };

  const handleSceneError = () => {
    console.error("Scene failed to load, using fallback");
    setSceneError(true);
    // Still mark as loaded to show avatar
    setSceneReady(true);
    onSceneLoaded();
  };

  // Reset scene ready state when URL changes
  useEffect(() => {
    setSceneReady(false);
    setSceneError(false);
  }, [currentSceneUrl]);

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
  
 
        const canvas = gl.domElement;
        canvas.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          console.error('WebGL context lost');
          setTimeout(() => {
            setRenderKey(prev => prev + 1); // Force remount
          }, 100);
        });
      }}
    >
      {/* Lighting for the scene */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />
      
      {/* Scene Background - only render if no error */}
      {currentSceneUrl && !sceneError && (
        <SceneBackground 
          key={currentSceneUrl} 
          url={currentSceneUrl} 
          emotion={currentEmotion} 
          onLoad={handleSceneLoad}
          onError={handleSceneError}
        />
      )}
      
      {/* Fallback background color if scene fails */}
      {sceneError && (
        <mesh position={[0, 0, -5]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color={EMOTION_COLORS[currentEmotion] || '#FFC494'} />
        </mesh>
      )}
      
      {/* Avatar - show when scene is ready OR immediately if we have fallback */}
      {(sceneReady || sceneError) && avatarData?.avatarUrl && (
        <CenteredAvatar 
          modelUrl={avatarData.avatarUrl}
          animation={avatarAnimation}
          emotionColor={EMOTION_COLORS[currentEmotion] || '#FFC494'}
          onLoad={onAvatarLoaded}
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
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const { 
    currentAnimation, 
    currentScene, 
    currentEmotion: hookEmotion,
  } = useAvatarEmotion({
    onAnimationChange: (anim) => setAvatarAnimation(anim),
    onSceneChange: (scene) => {
      setCurrentSceneUrl(scene);
      setSceneLoaded(false);
      setAvatarLoaded(false);
      // Force canvas remount on scene change
      setRenderKey(prev => prev + 1);
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

  // Reset loading states when tab changes
  useEffect(() => {
    if (activeTab === "avatar") {
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
              
              {/* Use key to force remount when scene changes */}
              <AvatarScene
                key={renderKey}
                currentSceneUrl={currentSceneUrl}
                currentEmotion={currentEmotion}
                avatarData={avatarData}
                avatarAnimation={avatarAnimation}
                onSceneLoaded={() => setSceneLoaded(true)}
                onAvatarLoaded={() => setAvatarLoaded(true)}
              />
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

// Preload scenes for better performance
const sceneUrls = [
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fangry_scene.glb?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fdisgust_scene.glb?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Ffear_scene.glb?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fjoy_scene.glb?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fneutral_scene.glb?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fsadness_scene.glb?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fsurprise_scene.glb?alt=media"
];

// Preload all scenes
sceneUrls.forEach(url => {
  useGLTF.preload(url);
});
