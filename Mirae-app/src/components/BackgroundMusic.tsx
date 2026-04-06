import React, { useEffect, useRef, useState } from 'react';


const MUSIC_URLS = {
  theme: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/music%2Ftheme.mp3?alt=media",
  joy: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/music%2Fhappy.mp3?alt=media",
  sadness: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/music%2Fsad.mp3?alt=media",
  tense: "https://firebasestorage.googleapis.com/v0/b/daw-db.firebasestorage.app/o/music%2Ftense.mp3?alt=media"
};

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(MUSIC_URLS.theme);
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
