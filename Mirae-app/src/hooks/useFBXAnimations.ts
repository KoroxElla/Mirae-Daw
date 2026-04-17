import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

interface AnimationClips {
  [key: string]: THREE.AnimationClip
}

const animationFileMap: { [key: string]: string } = {
  'neutral': 'idle.fbx',      
  'joy': 'happy.fbx',          
  'sadness': 'sad.fbx',        
  'anger': 'angry.fbx',
  'disgust': 'disappointed.fbx', 
  'fear': 'scared.fbx',
  'surprise': 'reacting.fbx',  
}

export function useFBXAnimations() {
  const [animationClips, setAnimationClips] = useState<AnimationClips>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loader = new FBXLoader()
    setIsLoading(true)


    const uniqueAnimations = ['idle.fbx', 'happy.fbx', 'sad.fbx', 'angry.fbx', 'reacting.fbx', 'disappointed.fbx', 'scared.fbx']

    const animations = [
      { name: 'idle.fbx', path: '/animations/idle.fbx' },
      { name: 'happy.fbx', path: '/animations/happy.fbx' },
      { name: 'sad.fbx', path: '/animations/sad.fbx' },
      { name: 'angry.fbx', path: '/animations/angry.fbx'},
      { name: 'reacting.fbx', path: '/animations/reacting.fbx'},
      { name: 'disappointed.fbx', path: '/animations/disappointed.fbx'},
      { name: 'scared.fbx', path: '/animations/scared.fbx'}
    ]

    const loadedClips: AnimationClips = {}
    let loadedCount = 0

    uniqueAnimations.forEach((fileName) => {
      const path = `/animations/${fileName}`

      loader.load(
        path,
        (fbx) => {
		  if (fbx.animations && fbx.animations.length > 0) {
		    const clip = fbx.animations[0]
		
		    // ✅ store by filename
		    clip.name = fileName
		    loadedClips[fileName] = clip
		
		    // ✅ map emotion → clip
		    for (const [emotion, mappedFile] of Object.entries(animationFileMap)) {
		      if (mappedFile === fileName) {
		        loadedClips[emotion] = clip
		      }
		    }
		
		    setAnimationClips({ ...loadedClips })
		
		    console.log(`✅ Loaded ${fileName}`)
		  }
		
		  loadedCount++
		  if (loadedCount === uniqueAnimations.length) {
		    setIsLoading(false)
		  }
		},
        (xhr) => {
          // Progress callback
          const percent = Math.round((xhr.loaded / xhr.total) * 100)
        
        },
        (error) => {
          loadedCount++
          if (loadedCount === animations.length) {
            setIsLoading(false)
          }
        }
      )
    })

    return () => {
      // Cleanup if needed
    }
  }, [])

  return { animationClips, isLoading, error }
}
