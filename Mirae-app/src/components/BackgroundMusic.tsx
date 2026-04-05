import React, { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio('/music/theme.mp3');
    audioRef.current.loop = true;
    
    const handleVolumeChange = (e: CustomEvent) => {
      if (audioRef.current) {
        audioRef.current.volume = e.detail.enabled ? e.detail.volume : 0;
        if (e.detail.enabled && !isPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
        } else if (!e.detail.enabled) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    
    window.addEventListener('musicVolumeChange' as any, handleVolumeChange);
    
    // Start playing
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch(console.log);
    
    return () => {
      window.removeEventListener('musicVolumeChange' as any, handleVolumeChange);
      audioRef.current?.pause();
    };
  }, []);
  
  return null;
}
