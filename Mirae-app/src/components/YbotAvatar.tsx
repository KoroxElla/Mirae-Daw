import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useAnimationsLoader } from '../hooks/useAnimationsLoader'
import { useCharacterAnimations } from '../hooks/useCharacterAnimations'

interface YbotAvatarProps {
  position?: [number, number, number]
  animation: string // 'default', 'samba', 'bellyDance', 'goofyRunning', 'clonedRightArm'
}

export function YbotAvatar({ position = [1, 0, 0], animation }: YbotAvatarProps) {
  const group = useRef<THREE.Group>(null)
  
  // Load ybot model
  const { scene, animations } = useGLTF('/models/ybot.glb')
  
  // Setup animation mixer
  const { actions, mixer } = useAnimations(animations, group)
  
  // Load additional animations
  const { animationClips, isLoading } = useAnimationsLoader()
  
  // Setup animation controller
  const { playAnimation } = useCharacterAnimations({
    mixer,
    animationClips: {
      default: animations[0], // Default animation from ybot
      ...animationClips
    }
  })

  // Configure shadows and position
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
        console.log(child.name + ' ' + child.type)
      })
      scene.position.x = position[0]
      scene.position.y = position[1]
      scene.position.z = position[2]
    }
  }, [scene, position])

  // Handle animation changes
  useEffect(() => {
    if (!isLoading && animation) {
      playAnimation(animation)
    }
  }, [animation, isLoading, playAnimation])

  return (
    <group ref={group}>
      <primitive object={scene} />
      {process.env.NODE_ENV === 'development' && (
        <skeletonHelper object={scene} />
      )}
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/ybot.glb')
