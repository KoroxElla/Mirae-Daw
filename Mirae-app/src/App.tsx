import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Avatar } from './components/Avatar'
import * as THREE from 'three'

export default function App() {
  const [anim, setAnim] = useState('idle')

  // Animation buttons configuration
  const animations = [
    { name: 'idle', label: 'Idle', color: '#ff6b6b' },
    { name: 'happy', label: 'Happy', color: '#4ecdc4' },
    { name: 'sad', label: 'Sad', color: '#6c5ce7' }
  ]

  const handleAnimationChange = (animationName: string) => {
    console.log('Button clicked:', animationName)
    setAnim(animationName)
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      background: '#1a1a1a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Canvas container */}
      <div style={{ 
        flex: 1,
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <Canvas
          shadows
          camera={{ 
            position: [0, 1.5, 3], 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true
            gl.shadowMap.type = THREE.PCFSoftShadowMap
          }}
          style={{ background: '#2a2a2a' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          
          {/* Main light */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          {/* Fill light */}
          <directionalLight
            position={[-5, 3, 5]}
            intensity={0.5}
          />
          
          {/* Back light */}
          <directionalLight
            position={[0, 3, -5]}
            intensity={0.3}
          />
          
          {/* Ground plane */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.5, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>

          {/* Avatar */}
          <Avatar position={[0, 0, 0]} animation={anim} />

          {/* Controls */}
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            target={[0, 1, 0]}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Button container - with higher z-index and proper pointer-events */}
      <div style={{ 
        position: 'relative',
        zIndex: 10,
        width: '100%',
        pointerEvents: 'none', // Allow clicks to pass through container
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ 
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          background: '#2a2a2a',
          borderTop: '1px solid #3a3a3a',
          width: '100%',
          pointerEvents: 'auto', // But buttons themselves are clickable
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
        }}>
          {animations.map(({ name, label, color }) => (
            <button
              key={name}
              onClick={() => handleAnimationChange(name)}
              style={{
                padding: '12px 32px',
                fontSize: '18px',
                borderRadius: '8px',
                border: 'none',
                background: anim === name ? color : '#ffffff',
                color: anim === name ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                minWidth: '100px',
                zIndex: 20,
                position: 'relative'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Debug info */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        right: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 30,
        pointerEvents: 'none'
      }}>
        Current Animation: {anim}
      </div>
    </div>
  )
}
