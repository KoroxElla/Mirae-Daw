// MainPage-SceneOnly.tsx - Test version with only scene
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";
import * as THREE from 'three';

// Simple MainPage that only shows the scene (no avatar)
export default function MainPageSceneOnly() {
  const [currentSceneUrl, setCurrentSceneUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  // For testing different scenes
  const testScenes = {
    neutral: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fneutral_scene.glb?alt=media",
    joy: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fjoy_scene.glb?alt=media",
    sad: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/scenes%2Fsadness_scene.glb?alt=media",
  };

  useEffect(() => {
    // Start with neutral scene
    setCurrentSceneUrl(testScenes.neutral);
  }, []);

  const handleSceneLoad = () => {
    console.log("✅ Scene loaded and displayed");
    setSceneLoaded(true);
    setIsLoading(false);
  };

  const handleSceneError = (err: Error) => {
    console.error("❌ Scene error:", err);
    setError(err.message);
    setIsLoading(false);
  };

  const switchScene = (sceneKey: keyof typeof testScenes) => {
    setIsLoading(true);
    setSceneLoaded(false);
    setError(null);
    setCurrentSceneUrl(testScenes[sceneKey]);
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg z-10">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => switchScene('neutral')}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Neutral Scene
            </button>
            <button 
              onClick={() => switchScene('joy')}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Joy Scene
            </button>
            <button 
              onClick={() => switchScene('sad')}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Sad Scene
            </button>
          </div>
          
          <div className="text-sm">
            Status: {isLoading ? 'Loading...' : (error ? 'Error' : 'Loaded')}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Canvas with only the scene */}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: false, antialias: true }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color('#1a1a2e'));
          console.log("Canvas created");
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <pointLight position={[0, 3, 2]} intensity={0.5} />
        <hemisphereLight intensity={0.3} />
        
        {/* Helper grid to see ground plane */}
        <gridHelper args={[20, 20, '#888888', '#444444']} position={[0, -1, 0]} />
        
        {/* The Scene Component */}
        {currentSceneUrl && (
          <Scene 
            sceneUrl={currentSceneUrl}
            onLoad={handleSceneLoad}
            onError={handleSceneError}
            position={[0, -1, 0]}
            scale={1}
          />
        )}
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          makeDefault
        />
      </Canvas>
      
      {/* Loading Overlay */}
      {isLoading && !sceneLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading scene...</p>
          </div>
        </div>
      )}
    </div>
  );
}
