import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";
import { Avatar } from "./Avatar";
import { EMOTION_COLORS } from "./journal/useAvatarEmotion";
import { useState, useEffect } from "react";

interface Props {
  currentSceneUrl: string;
  currentEmotion: string;
  avatarData: any;
  avatarAnimation: string;
  onSceneReady?: () => void;
  onAvatarReady?: () => void;
}

export default function AvatarScene({
  currentSceneUrl,
  currentEmotion,
  avatarData,
  avatarAnimation,
  onSceneReady,
  onAvatarReady,
}: Props) {
  const bgColor = EMOTION_COLORS[currentEmotion] || "#FFC494";
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  // Notify when both are ready
  useEffect(() => {
    if (sceneLoaded && avatarLoaded) {
      console.log("Both scene and avatar are ready!");
    }
  }, [sceneLoaded, avatarLoaded]);

  const handleSceneLoad = () => {
    console.log("Scene loaded callback");
    setSceneLoaded(true);
    onSceneReady?.();
  };

  const handleAvatarLoad = () => {
    console.log("Avatar loaded callback");
    setAvatarLoaded(true);
    onAvatarReady?.();
  };
 

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        const color = new THREE.Color(bgColor);
        gl.setClearColor(color);
        scene.background = color;
      }}
    >
      {/* ✅ ALWAYS HAVE BACKGROUND */}
      <color attach="background" args={[bgColor]} />

      {/* 💡 LIGHTING */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />

      {/* 🌍 SCENE (optional, non-blocking) */}
      {currentSceneUrl && <Scene url={currentSceneUrl} />}

      {/* 🧍 AVATAR (always renders) */}
      {avatarData?.avatarUrl && (
        <group position={[0, -1.2, 0]}>
          <Avatar
            modelUrl={avatarData.avatarUrl}
            animation={avatarAnimation}
            scale={1.5}
            onLoad={handleAvatarLoad}
          />
        </group>
      )}

      {/* 🎮 CONTROLS */}
      <OrbitControls
        enableZoom
        enablePan={false}
        enableRotate
        maxPolarAngle={Math.PI / 2.2}
        minDistance={2}
        maxDistance={8}
        target={[0, -0.5, 0]}
      />
    </Canvas>
  );
}
