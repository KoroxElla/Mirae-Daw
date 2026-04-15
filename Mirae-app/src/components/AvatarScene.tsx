import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";
import { Avatar } from "./Avatar";
import { EMOTION_COLORS } from "./journal/useAvatarEmotion";
import { useState, useEffect, useRef } from "react";

interface Props {
  currentSceneUrl: string;
  currentEmotion: string;
  avatarData: any;
  onSceneReady?: () => void;
  onAvatarReady?: () => void;
}

export default function AvatarScene({
  currentSceneUrl,
  currentEmotion,
  avatarData,
  onSceneReady,
  onAvatarReady,
}: Props) {
  const bgColor = EMOTION_COLORS[currentEmotion] || "#FFC494";
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const sceneReadyCalledRef = useRef(false);
  const avatarReadyCalledRef = useRef(false);
  const hour = new Date().getHours()

  let sunPosition: [number, number, number] = [5, 10, 5]
  let intensity = 1.2
  
  if (hour < 6) {
    sunPosition = [0, -5, 0]
    intensity = 0.3
  } else if (hour < 12) {
    sunPosition = [5, 5, 5]
  } else if (hour < 18) {
    sunPosition = [0, 10, 0]
  } else {
    sunPosition = [-5, 5, 5]
    intensity = 0.6
  }

  // Notify when both are ready
  useEffect(() => {
    if (sceneLoaded && avatarLoaded) {
      console.log("Both scene and avatar are ready!");
    }
  }, [sceneLoaded, avatarLoaded]);

  const handleSceneLoad = () => {
    console.log("Scene loaded callback");
    setSceneLoaded(true);
    if (!sceneReadyCalledRef.current && onSceneReady) {
      sceneReadyCalledRef.current = true;
      onSceneReady();
    }
  };

  const handleAvatarLoad = () => {
    console.log("Avatar loaded callback");
    setAvatarLoaded(true);
    if (!avatarReadyCalledRef.current && onAvatarReady) {
      avatarReadyCalledRef.current = true;
      onAvatarReady();
    }
  };

  useEffect(() => {
    console.log("AvatarScene received scene URL:", currentSceneUrl);
    setSceneLoaded(false);
    sceneReadyCalledRef.current = false;
  }, [currentSceneUrl]);
 

  return (
    <Canvas
      camera={{ position: [0, 1.6, 2.5], fov: 35 }}
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
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={sunPosition}
        intensity={intensity}
        castShadow
      />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />
      <Sky sunPosition={[5, 10, 5]} />

      {/* 🌍 SCENE (optional, non-blocking) */}
      {currentSceneUrl && (<Scene key={currentSceneUrl} url={currentSceneUrl} onLoad={handleSceneLoad}/>)}

      {/* 🧍 AVATAR (always renders) */}
      {avatarData?.avatarUrl && (
        <group position={[0, -0.8, 0]}>
          <Avatar
            modelUrl={avatarData.avatarUrl}
            emotion={currentEmotion}
            scale={2}
            onLoad={handleAvatarLoad}
          />
        </group>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* 🎮 CONTROLS */}
      <OrbitControls
        enableZoom
        enablePan={false}
        enableRotate
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
