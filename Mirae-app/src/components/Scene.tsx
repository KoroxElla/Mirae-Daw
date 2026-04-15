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
  const [processedScene, setProcessedScene] = useState<THREE.Object3D | null>(null);


  useEffect(() => {
    if (!scene) return;
    setProcessedScene(null);

    console.log("Processing scene:", url);

    const cloned = scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    cloned.position.sub(center);
    cloned.position.y +=10;
    cloned.position.x +=10.5;
    cloned.position.z +=3.5
    cloned.rotation.y = Math.PI / 2;

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = (2 / maxDim) * 25;
    cloned.scale.setScalar(scale);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

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

    setProcessedScene(cloned);

    console.log("Scene processed and ready");

    if (!onLoadCalledRef.current && onLoad) {
      onLoadCalledRef.current = true;
      onLoad();
    }

  }, [scene, url]);

  if (!processedScene) return null;

  return <primitive object={processedScene} />;
}
