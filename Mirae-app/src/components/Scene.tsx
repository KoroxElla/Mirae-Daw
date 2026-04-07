import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  sceneUrl: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  position?: [number, number, number];
  scale?: number;
}

export function Scene({ 
  sceneUrl, 
  onLoad, 
  onError, 
  position = [0, 0, 0],
  scale = 1 
}: SceneProps) {
  const { scene, error } = useGLTF(sceneUrl);
  const sceneRef = useRef<THREE.Group>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Error loading scene:', error);
      onError?.(error);
      return;
    }

    if (scene && !isLoaded) {
      try {
        console.log('Scene loaded successfully:', sceneUrl);
        
        // Clone the scene to avoid mutations
        const clonedScene = scene.clone();
        sceneRef.current = clonedScene;
        
        // Configure all meshes in the scene
        clonedScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Ensure materials are visible
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
        
        // Apply position and scale
        clonedScene.position.set(position[0], position[1], position[2]);
        clonedScene.scale.set(scale, scale, scale);
        
        setIsLoaded(true);
        onLoad?.();
      } catch (err) {
        console.error('Error processing scene:', err);
        onError?.(err as Error);
      }
    }
  }, [scene, sceneUrl, position, scale, onLoad, onError, isLoaded]);

  if (error || !sceneRef.current) {
    return null;
  }

  return <primitive object={sceneRef.current} />;
}

// Preload function for scenes
export function preloadScene(url: string) {
  useGLTF.preload(url);
}
