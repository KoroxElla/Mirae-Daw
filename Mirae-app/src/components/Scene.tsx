import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SCENE_ADJUSTMENTS } from "../types/sceneConfig";

interface SceneProps {
  url: string;
  emotion: string;
  onLoad?: () => void;
}

export default function Scene({ url, emotion, onLoad }: SceneProps) {
  const { scene } = useGLTF(url);
  const onLoadCalledRef = useRef(false);
  const [processedScene, setProcessedScene] = useState<THREE.Object3D | null>(null);

  const config =
    SCENE_ADJUSTMENTS[emotion] || SCENE_ADJUSTMENTS["neutral"];

  useEffect(() => {
    if (!scene) return;

    console.log("Loading scene:", url);

    const cloned = scene.clone(true);

    setProcessedScene(cloned);

    if (!onLoadCalledRef.current && onLoad) {
      onLoadCalledRef.current = true;
      onLoad();
    }
  }, [scene, url]);

  if (!processedScene) return null;

  return (
    <primitive
      object={processedScene}
      position={config.pos}
      scale={config.scale}
      rotation={[0, config.rotY, 0]}
    />
  );
}