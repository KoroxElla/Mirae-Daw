import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'

interface UseCharacterAnimationsProps {
  mixer: THREE.AnimationMixer | null
  animationClips: { [key: string]: THREE.AnimationClip }
}

export function useCharacterAnimations({
  mixer,
  animationClips
}: UseCharacterAnimationsProps) {
  const currentAction = useRef<THREE.AnimationAction | null>(null)

  const playAnimation = useCallback((animationName: string, fadeTime: number = 0.5) => {
    if (!mixer) {
      console.warn('Mixer not ready yet')
      return
    }

    const clip = animationClips[animationName]
    if (!clip) {
      console.warn(`Animation ${animationName} not found`)
      return
    }

    try {
      // Log clip info for debugging
      console.log(`Playing ${animationName}:`, {
        duration: clip.duration,
        tracks: clip.tracks.length,
        trackNames: clip.tracks.map(t => t.name)
      })

      // Create and play new action
      const newAction = mixer.clipAction(clip)
      
      if (newAction) {
        // Stop all current actions
        mixer.stopAllAction()
        
        newAction
          .reset()
          .setEffectiveTimeScale(1)
          .setEffectiveWeight(1)
          .fadeIn(fadeTime)
          .play()

        if (currentAction.current) {
          currentAction.current = newAction
        }

        currentAction.current = newAction
        console.log(`✅ Playing animation: ${animationName}`)
      }
    } catch (error) {
      console.error('Error playing animation:', error)
    }
  }, [mixer, animationClips])

  useEffect(() => {
    return () => {
      if (currentAction.current) {
        currentAction.current.stop()
      }
    }
  }, [])

  return { playAnimation }
}
