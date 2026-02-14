import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' // Note the .js extension

interface AnimationClips {
  [key: string]: THREE.AnimationClip
}

export function useAnimationsLoader() {
  const [animationClips, setAnimationClips] = useState<AnimationClips>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    setIsLoading(true)

    // Load samba animation
    loader.load(
      '/animations/actionClip@samba.glb',
      (gltf) => {
        setAnimationClips(prev => ({ ...prev, samba: gltf.animations[0] }))
        console.log('Loaded samba animation')

        // Load bellydance animation
        loader.load(
          '/animations/actionClip@bellydance.glb',
          (gltf) => {
            setAnimationClips(prev => ({ ...prev, bellyDance: gltf.animations[0] }))
            console.log('Loaded bellyDance animation')

            // Load goofyrunning animation
            loader.load(
              '/animations/actionClip@goofyrunning.glb',
              (gltf) => {
                // Delete the specific track that moves the object forward while running
                if (gltf.animations[0]?.tracks) {
                  gltf.animations[0].tracks.shift()
                }
                setAnimationClips(prev => ({ ...prev, goofyRunning: gltf.animations[0] }))
                
                // Create cloned right arm animation
                const clonedClip = gltf.animations[0].clone()
                let i = clonedClip.tracks.length
                while (i--) {
                  const trackName = clonedClip.tracks[i].name
                  if (!(
                    trackName.startsWith('mixamorigRightShoulder') ||
                    trackName.startsWith('mixamorigRightArm') ||
                    trackName.startsWith('mixamorigRightForeArm') ||
                    trackName.startsWith('mixamorigRightHand')
                  )) {
                    clonedClip.tracks.splice(i, 1)
                  }
                }
                setAnimationClips(prev => ({ ...prev, clonedRightArm: clonedClip }))
                
                setIsLoading(false)
                console.log('Loaded all animations')
              },
              (xhr) => {
                console.log(`goofyrunning: ${(xhr.loaded / xhr.total) * 100}% loaded`)
              },
              (error) => {
                setError('Failed to load goofyrunning animation')
                console.error(error)
              }
            )
          },
          (xhr) => {
            console.log(`bellydance: ${(xhr.loaded / xhr.total) * 100}% loaded`)
          },
          (error) => {
            setError('Failed to load bellydance animation')
            console.error(error)
          }
        )
      },
      (xhr) => {
        console.log(`samba: ${(xhr.loaded / xhr.total) * 100}% loaded`)
      },
      (error) => {
        setError('Failed to load samba animation')
        console.error(error)
      }
    )
  }, [])

  return { animationClips, isLoading, error }
}
