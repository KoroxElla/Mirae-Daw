// Scene.tsx
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

interface SceneProps {
  url: string;
}

export default function Scene({ url }: SceneProps) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        mesh.castShadow = false;
        mesh.receiveShadow = false;

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.side = THREE.DoubleSide;
            });
          } else {
            mesh.material.side = THREE.DoubleSide;
          }
        }
      }
    });

    // 🔥 CRITICAL: prevent invisible scenes
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

  }, [scene]);

  if (!scene) return null;

  return <primitive object={scene} />;
}
