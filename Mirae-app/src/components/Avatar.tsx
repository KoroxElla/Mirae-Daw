import React, { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF, Environment, Stage, Html } from '@react-three/drei'
import { useFBXAnimations } from '../hooks/useFBXAnimations'
import { useAvatarEmotion } from './journal/useAvatarEmotion';
import LoadingAnimation from './LoadingAnimation';

interface AvatarProps {
  position?: [number, number, number]
  modelUrl: string 
  scale?: number
  emotionColor?: string;
  animation?: string;
  onLoad?: () => void;

}

export function Avatar({ 
  position = [0,-1.3,0],
  modelUrl, 
  emotionColor = '#FFC494',
  scale = 3.5,
  animation = "idle",
  onLoad }: AvatarProps) {
  const group = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const currentAction = useRef<THREE.AnimationAction | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [showLoading, setShowLoading] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  

  const { currentAnimation } = useAvatarEmotion({
    onAnimationChange: (animation) => {
      console.log('Avatar animation changing to:', animation);
    }
  });
 
 
  // Load avatar model
  const { scene } = useGLTF(modelUrl)
  
  // Load FBX animations
  const { animationClips, isLoading } = useFBXAnimations()

  // Store the scene in a ref to prevent recreation
  const sceneRef = useRef<THREE.Group | null>(null)

  // Track both model and animations being ready
  const [modelReady, setModelReady] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  // When model is configured
  useEffect(() => {
    if (sceneRef.current && mixerRef.current && !modelReady) {
      console.log('Model ready');
      setModelReady(true);
    }
  }, [sceneRef.current, mixerRef.current]);

  // When animations are loaded
  useEffect(() => {
    if (!isLoading && Object.keys(animationClips).length > 0 && !animationsReady) {
      console.log('Animations ready');
      setAnimationsReady(true);
    }
  }, [isLoading, animationClips]);

  // When both are ready, hide loading
  useEffect(() => {
    if (modelReady && animationsReady) {
      console.log('Avatar fully ready');
      setTimeout(() => {
        setShowLoading(false);
        onLoad?.();
      }, 100);
    }
  }, [modelReady, animationsReady, onLoad]);

  // Show loading while not ready
  if (showLoading || !modelReady || !animationsReady) {
    return (
      <Html center>
        <LoadingAnimation 
          onComplete={() => {}}
          stages={['Loading 3D model...', 'Setting up animations...', 'Applying expressions...', 'Ready!']}
        />
      </Html>
    );
  }


  // Configure model once when it loads
  useEffect(() => {
    if (scene && !sceneRef.current) {
      console.log('Avatar model loaded, configuring...')
      sceneRef.current = scene
      
      // Configure shadows
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      
      // Set initial position
      scene.position.set(position[0], position[1], position[2])
      
      // Create animation mixer
      const mixer = new THREE.AnimationMixer(scene)
      mixerRef.current = mixer
      
      setIsReady(true)
      console.log('Avatar ready with mixer')
    }
  }, [scene, position])

  // Process animation to remove position tracks and keep only rotation tracks
  const processAnimation = useMemo(() => {
    return (clip: THREE.AnimationClip): THREE.AnimationClip => {
      if (!sceneRef.current) return clip

      // Get all bone names from the model
      const modelBones = new Set<string>()
      sceneRef.current.traverse((object) => {
        if (object.isBone) {
          modelBones.add(object.name)
        }
      })

      // Mapping from FBX/Mixamo bone names to model bone names
      const boneMapping: { [key: string]: string } = {
        'mixamorigHips': 'Hips',
        'mixamorigSpine': 'Spine',
        'mixamorigSpine1': 'Spine1',
        'mixamorigSpine2': 'Spine2',
        'mixamorigNeck': 'Neck',
        'mixamorigHead': 'Head',
        'mixamorigLeftShoulder': 'LeftShoulder',
        'mixamorigLeftArm': 'LeftArm',
        'mixamorigLeftForeArm': 'LeftForeArm',
        'mixamorigLeftHand': 'LeftHand',
        'mixamorigLeftHandThumb1': 'LeftHandThumb1',
        'mixamorigLeftHandThumb2': 'LeftHandThumb2',
        'mixamorigLeftHandThumb3': 'LeftHandThumb3',
        'mixamorigLeftHandIndex1': 'LeftHandIndex1',
        'mixamorigLeftHandIndex2': 'LeftHandIndex2',
        'mixamorigLeftHandIndex3': 'LeftHandIndex3',
        'mixamorigLeftHandMiddle1': 'LeftHandMiddle1',
        'mixamorigLeftHandMiddle2': 'LeftHandMiddle2',
        'mixamorigLeftHandMiddle3': 'LeftHandMiddle3',
        'mixamorigLeftHandRing1': 'LeftHandRing1',
        'mixamorigLeftHandRing2': 'LeftHandRing2',
        'mixamorigLeftHandRing3': 'LeftHandRing3',
        'mixamorigLeftHandPinky1': 'LeftHandPinky1',
        'mixamorigLeftHandPinky2': 'LeftHandPinky2',
        'mixamorigLeftHandPinky3': 'LeftHandPinky3',
        'mixamorigRightShoulder': 'RightShoulder',
        'mixamorigRightArm': 'RightArm',
        'mixamorigRightForeArm': 'RightForeArm',
        'mixamorigRightHand': 'RightHand',
        'mixamorigRightHandThumb1': 'RightHandThumb1',
        'mixamorigRightHandThumb2': 'RightHandThumb2',
        'mixamorigRightHandThumb3': 'RightHandThumb3',
        'mixamorigRightHandIndex1': 'RightHandIndex1',
        'mixamorigRightHandIndex2': 'RightHandIndex2',
        'mixamorigRightHandIndex3': 'RightHandIndex3',
        'mixamorigRightHandMiddle1': 'RightHandMiddle1',
        'mixamorigRightHandMiddle2': 'RightHandMiddle2',
        'mixamorigRightHandMiddle3': 'RightHandMiddle3',
        'mixamorigRightHandRing1': 'RightHandRing1',
        'mixamorigRightHandRing2': 'RightHandRing2',
        'mixamorigRightHandRing3': 'RightHandRing3',
        'mixamorigRightHandPinky1': 'RightHandPinky1',
        'mixamorigRightHandPinky2': 'RightHandPinky2',
        'mixamorigRightHandPinky3': 'RightHandPinky3',
        'mixamorigLeftUpLeg': 'LeftUpLeg',
        'mixamorigLeftLeg': 'LeftLeg',
        'mixamorigLeftFoot': 'LeftFoot',
        'mixamorigLeftToeBase': 'LeftToeBase',
        'mixamorigRightUpLeg': 'RightUpLeg',
        'mixamorigRightLeg': 'RightLeg',
        'mixamorigRightFoot': 'RightFoot',
        'mixamorigRightToeBase': 'RightToeBase',
      }

      const newTracks: THREE.KeyframeTrack[] = []

      clip.tracks.forEach((track) => {
        const trackName = track.name
        
        // SKIP position tracks - these are what make the avatar move/fly away
        if (trackName.includes('.position')) {
          console.log(`Skipping position track: ${trackName}`)
          return // Skip this track entirely
        }

        // Only keep rotation and scale tracks
        if (!trackName.includes('.quaternion') && !trackName.includes('.scale')) {
          // If it's not position, quaternion, or scale, check what it is
          console.log(`Keeping non-position track: ${trackName}`)
        }

        // Remap bone names if needed
        let remapped = false
        for (const [fbxName, modelName] of Object.entries(boneMapping)) {
          if (trackName.includes(fbxName) && modelBones.has(modelName)) {
            const newTrackName = trackName.replace(fbxName, modelName)
            try {
              const newTrack = track.clone()
              Object.defineProperty(newTrack, 'name', { value: newTrackName })
              newTracks.push(newTrack)
              remapped = true
              break
            } catch (e) {
              console.warn(`Failed to remap track: ${trackName}`)
            }
          }
        }

        // If no mapping found but it's a rotation track, try to keep it if the bone exists
        if (!remapped && trackName.includes('.quaternion')) {
          const boneName = trackName.split('.')[0]
          if (modelBones.has(boneName)) {
            newTracks.push(track)
          }
        }
      })

      // Create new clip with filtered tracks
      if (newTracks.length > 0) {
        const newClip = new THREE.AnimationClip(clip.name, clip.duration, newTracks)
        console.log(`Processed ${clip.name}: kept ${newTracks.length}/${clip.tracks.length} tracks (removed position tracks)`)
        return newClip
      }
      
      console.warn(`No valid tracks found for animation: ${clip.name}`)
      return clip
    }
  }, [])

  // Play animation function
  const playAnimation = (animationName: string) => {
    const mixer = mixerRef.current
    if (!mixer) {
      console.log('Mixer not ready')
      return
    }

    const clip = animationClips[animationName]
    if (!clip) {
      console.log(`Animation ${animationName} not found`)
      return
    }

    try {
      // Process the animation to remove position tracks
      const processedClip = processAnimation(clip)
      
      console.log(`Playing ${animationName}:`, {
        duration: processedClip.duration,
        originalTracks: clip.tracks.length,
        keptTracks: processedClip.tracks.length
      })

      // Stop current action with fade out
      if (currentAction.current) {
        currentAction.current.fadeOut(0.3)
      }

      // Create new action
      const newAction = mixer.clipAction(processedClip)
      newAction.reset()
      newAction.fadeIn(0.3)
      newAction.play()
      
      currentAction.current = newAction
      console.log(`✅ Now playing: ${animationName}`)
    } catch (error) {
      console.error('Error playing animation:', error)
    }
  }

  // Handle animation changes
  useEffect(() => {
    if (modelReady && animationsReady && animation) {
      playAnimation(animation)
    }
  }, [animation, modelReady, animationsReady, animationClips])

  // Animation loop
  useEffect(() => {
    if (!mixerRef.current) return

    const clock = new THREE.Clock()
    let animationFrame: number

    const animate = () => {
      if (mixerRef.current) {
        const delta = clock.getDelta()
        mixerRef.current.update(delta)
      }
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  // Ensure position stays fixed (in case any position tracks slip through)
  useEffect(() => {
    if (sceneRef.current) {
      // Reset position every frame to ensure it stays put
      const interval = setInterval(() => {
        if (sceneRef.current) {
          sceneRef.current.position.set(position[0], position[1], position[2])
        }
      }, 16) // ~60fps

      return () => clearInterval(interval)
    }
  }, [position])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [])



  return (
    <group ref={group}>
        <>
          
          {/* Border ring */}
          <mesh position={[0, -1.2, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.0, 0.03, 16, 100]} />
            <meshStandardMaterial color="#4a4a4a" emissive="#222222" />
          </mesh>
          <mesh 
            position={[0, -1.3, -0.2]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[2.2, 2.2]} />
            <meshStandardMaterial 
              color="#222222" 
              transparent 
              opacity={0.2}
              emissive="#000000"
            />
          </mesh>
        </>
     
      
      {/* Environment lighting for better appearance */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      
      <primitive object={sceneRef.current} scale= {scale} position={position} />
    </group>
  )
}

