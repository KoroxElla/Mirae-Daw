import { useGLTF } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";

interface SceneProps {
  url: string;
  onLoad?: () => void;
}

export default function Scene({ url, onLoad }: SceneProps) {
  const { scene } = useGLTF(url);
  const [loaded, setLoaded] = useState(false);
  const onLoadCalledRef = useRef(false);

  
  console.log(scene);
  useEffect(() => {
    if (!scene) return;

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    // Center the scene
    scene.position.sub(center);

    // Scale it down
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    scene.scale.setScalar(scale);

  }, [scene]);

  useEffect(() => {
    if (!scene || loaded) return;

    console.log("Processing scene:", url);

    const clonedScene = scene.clone();

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        mesh.castShadow = false;
        mesh.receiveShadow = false;

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
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

    clonedScene.position.set(0, -1, 0);
    clonedScene.scale.set(0.5, 0.5, 0.5);
    setLoaded(true);
    console.log("Scene processed and ready");
    
    if (!onLoadCalledRef.current && onLoad) {
      onLoadCalledRef.current = true;
      onLoad();
    }
 
    return () => {
      if (clonedScene) {
        clonedScene.clear();
      }
    };
  }, [scene,  url, loaded, onLoad]);

  if (!scene || !loaded) return null;

  return <primitive object={scene} />;
}
