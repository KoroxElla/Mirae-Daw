import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";

interface SceneProps {
  url: string;
  onLoad?: () => void;
}

export default function Scene({ url, onLoad }: SceneProps) {
  const { scene } = useGLTF(url);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!scene || loaded) return;

    console.log("Processing scene:", url);

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
    setLoaded(true);
    console.log("Scene processed and ready");
    onLoad?.();
  }, [scene,  url, loaded, onLoad]);

  if (!scene) return null;

  return <primitive object={scene} />;
}
