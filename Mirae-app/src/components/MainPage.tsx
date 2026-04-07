import React, { useEffect, useRef, useState } from 'react';
import 'aframe';
import 'aframe-extras';
import JournalBook from "./journal/JournalBook";
import ReminiscePage from "./ReminiscePage"; 
import ProfilePage from './ProfilePage';
import BackgroundMusic from './BackgroundMusic';
import { useAvatarEmotion, EMOTION_COLORS } from './journal/useAvatarEmotion';

interface MainPageProps {
  avatarData: any;
  onCustomize: () => void;
  onLogout: () => void;
}

// Register A-Frame components
const registerAframeComponents = () => {
  // Scene change component based on emotion
  if (typeof AFRAME !== 'undefined' && !AFRAME.components['emotion-scene']) {
    AFRAME.registerComponent('emotion-scene', {
      schema: {
        emotion: { type: 'string', default: 'neutral' },
        sceneUrl: { type: 'string', default: '' }
      },
      
      init: function() {
        this.currentScene = null;
      },
      
      update: function() {
        const data = this.data;
        if (data.sceneUrl) {
          this.loadScene(data.sceneUrl, data.emotion);
        }
      },
      
      loadScene: function(url: string, emotion: string) {
        const el = this.el;
        
        // Remove existing scene
        if (this.currentScene) {
          el.removeChild(this.currentScene);
        }
        
        // Create new scene entity
        const sceneEntity = document.createElement('a-entity');
        sceneEntity.setAttribute('gltf-model', url);
        sceneEntity.setAttribute('scale', '1 1 1');
        sceneEntity.setAttribute('position', '0 -1 0');
        
        // Add emotion-based lighting
        const emotionColors: Record<string, string> = {
          joy: '#FFD700',
          sadness: '#4A90E2',
          anger: '#FF4444',
          fear: '#9370DB',
          disgust: '#7CFC00',
          surprise: '#FF69B4',
          neutral: '#C0C0C0'
        };
        
        const lightColor = emotionColors[emotion] || '#C0C0C0';
        
        // Add ambient light
        let ambientLight = el.querySelector('#ambient-light');
        if (!ambientLight) {
          ambientLight = document.createElement('a-light');
          ambientLight.setAttribute('id', 'ambient-light');
          ambientLight.setAttribute('type', 'ambient');
          ambientLight.setAttribute('intensity', '0.5');
          el.appendChild(ambientLight);
        }
        ambientLight.setAttribute('color', lightColor);
        
        // Add directional light
        let dirLight = el.querySelector('#dir-light');
        if (!dirLight) {
          dirLight = document.createElement('a-light');
          dirLight.setAttribute('id', 'dir-light');
          dirLight.setAttribute('type', 'directional');
          dirLight.setAttribute('intensity', '0.8');
          dirLight.setAttribute('position', '5 10 5');
          el.appendChild(dirLight);
        }
        
        el.appendChild(sceneEntity);
        this.currentScene = sceneEntity;
        
        console.log(`Loaded scene for emotion: ${emotion}`, url);
      }
    });
  }
  
  // Avatar component
  if (typeof AFRAME !== 'undefined' && !AFRAME.components['avatar-display']) {
    AFRAME.registerComponent('avatar-display', {
      schema: {
        modelUrl: { type: 'string', default: '' },
        animation: { type: 'string', default: 'idle' }
      },
      
      init: function() {
        this.model = null;
      },
      
      update: function() {
        const data = this.data;
        if (data.modelUrl && data.modelUrl !== this.lastUrl) {
          this.lastUrl = data.modelUrl;
          this.loadAvatar(data.modelUrl);
        }
      },
      
      loadAvatar: function(url: string) {
        const el = this.el;
        
        // Remove existing model
        if (this.model) {
          el.removeChild(this.model);
        }
        
        // Create avatar entity
        const avatarEntity = document.createElement('a-entity');
        avatarEntity.setAttribute('gltf-model', url);
        avatarEntity.setAttribute('scale', '1.5 1.5 1.5');
        avatarEntity.setAttribute('position', '0 -1.2 0');
        avatarEntity.setAttribute('animation-mixer', '');
        
        el.appendChild(avatarEntity);
        this.model = avatarEntity;
        
        console.log('Avatar loaded:', url);
      }
    });
  }
  
  // Emotion-based background color
  if (typeof AFRAME !== 'undefined' && !AFRAME.components['emotion-background']) {
    AFRAME.registerComponent('emotion-background', {
      schema: {
        emotion: { type: 'string', default: 'neutral' }
      },
      
      update: function() {
        const colors: Record<string, string> = {
          joy: '#FFD700',
          sadness: '#4A90E2',
          anger: '#FF4444',
          fear: '#9370DB',
          disgust: '#7CFC00',
          surprise: '#FF69B4',
          neutral: '#87CEEB'
        };
        
        const color = colors[this.data.emotion] || '#87CEEB';
        const scene = this.el.sceneEl;
        if (scene) {
          scene.setAttribute('background', `color: ${color}`);
        }
      }
    });
  }
};

export default function MainPage({ avatarData, onCustomize, onLogout }: MainPageProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"avatar" | "journal" | "reminisce" | "chat">("avatar");
  const [userId, setUserId] = useState<string | null>(null);
  const sceneRef = useRef<any>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [currentSceneUrl, setCurrentSceneUrl] = useState<string>("");
  
  const { currentScene, currentEmotion: hookEmotion } = useAvatarEmotion({
    onSceneChange: (scene) => {
      setCurrentSceneUrl(scene);
    }
  });
  
  useEffect(() => {
    if (hookEmotion) {
      setCurrentEmotion(hookEmotion);
    }
  }, [hookEmotion]);
  
  useEffect(() => {
    if (currentScene) {
      setCurrentSceneUrl(currentScene);
    }
  }, [currentScene]);
  
  // Register components on mount
  useEffect(() => {
    registerAframeComponents();
  }, []);
  
  // Decode user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUserId(payload.user_id || payload.sub);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);
  
  const tabStyles = {
    avatar: { ring: "ring-orange-400", bg: "bg-orange-100" },
    journal: { ring: "ring-blue-400", bg: "bg-blue-100" },
    reminisce: { ring: "ring-orange-400", bg: "bg-orange-100" },
    chat: { ring: "ring-amber-700", bg: "bg-amber-100" },
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case "avatar":
        return (
          <div className="flex flex-col items-center w-full h-full">
            <div className="w-full h-full relative" style={{ minHeight: '500px', height: '70vh', maxHeight: '800px' }}>
              {/* A-Frame Scene */}
              <a-scene
                ref={sceneRef}
                style={{ width: '100%', height: '100%' }}
                emotion-background={`emotion: ${currentEmotion}`}
                cursor="rayOrigin: mouse"
              >
                {/* Assets */}
                <a-assets>
                  {currentSceneUrl && (
                    <a-asset-item 
                      id="emotion-scene" 
                      src={currentSceneUrl}
                    ></a-asset-item>
                  )}
                  {avatarData?.avatarUrl && (
                    <a-asset-item 
                      id="avatar-model" 
                      src={avatarData.avatarUrl}
                    ></a-asset-item>
                  )}
                </a-assets>
                
                {/* Scene based on emotion */}
                {currentSceneUrl && (
                  <a-entity 
                    emotion-scene={`emotion: ${currentEmotion}; sceneUrl: ${currentSceneUrl}`}
                  ></a-entity>
                )}
                
                {/* Avatar */}
                {avatarData?.avatarUrl && (
                  <a-entity 
                    avatar-display={`modelUrl: ${avatarData.avatarUrl}; animation: idle`}
                  ></a-entity>
                )}
                
                {/* Camera with orbit controls */}
                <a-entity camera="fov: 45" look-controls wasd-controls position="0 1.6 3"></a-entity>
                
                {/* Basic lighting (fallback) */}
                <a-light type="ambient" intensity="0.5" color="#FFF"></a-light>
                <a-light type="directional" intensity="0.8" position="5 10 5"></a-light>
                
                {/* Grid helper for ground reference */}
                <a-grid helper="size: 20; divisions: 20" position="0 -1.5 0"></a-grid>
              </a-scene>
            </div>
            
            <button
              onClick={onCustomize}
              className="bg-purple-600 text-white px-6 py-2 rounded-full mt-4 z-10 hover:bg-purple-700 transition-colors"
            >
              Customize Avatar
            </button>
          </div>
        );
        
      case "journal":
        return <JournalBook userId={userId || ''} />;
      case "reminisce":
        return <ReminiscePage userId={userId} />;
      case "chat":
        return <h2 className="text-xl">Chat Time Page (Coming Next)</h2>;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white shadow z-20">
        <h1 className="font-bold text-lg">Mirae Daw</h1>
        <div className="flex gap-3 items-center">
          <img
            src="/main_icons/profile.png"
            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
            alt="profile"
            onClick={() => setShowProfile(true)}
          />
          <img
            src="/main_icons/Settings.png"
            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
            alt="settings"
            onClick={() => setShowProfile(true)}
          />
          <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">
            Logout
          </button>
        </div>
        {showProfile && (
          <ProfilePage userId={userId || ''} onClose={() => setShowProfile(false)} />
        )}
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 overflow-auto transition-colors duration-500 ${tabStyles[activeTab].bg}`}>
        {renderContent()}
      </div>
      
      {/* Bottom Navigation */}
      <div className="bg-white shadow-inner p-4 flex justify-around z-20">
        <button onClick={() => setActiveTab("avatar")}>
          <img src="/main_icons/avatar.png" className={`w-8 h-8 ${activeTab === "avatar" ? `ring-4 ${tabStyles.avatar.ring} p-1` : "opacity-50"}`} alt="avatar" />
        </button>
        <button onClick={() => setActiveTab("journal")}>
          <img src="/main_icons/journal.png" className={`w-8 h-8 ${activeTab === "journal" ? `ring-4 ${tabStyles.journal.ring} p-1` : "opacity-50"}`} alt="journal" />
        </button>
        <button onClick={() => setActiveTab("reminisce")}>
          <img src="/main_icons/reminisce.png" className={`w-8 h-8 ${activeTab === "reminisce" ? `ring-4 ${tabStyles.reminisce.ring} p-1` : "opacity-50"}`} alt="reminisce" />
        </button>
        <button onClick={() => setActiveTab("chat")}>
          <img src="/main_icons/chattime.png" className={`w-8 h-8 ${activeTab === "chat" ? `ring-4 ${tabStyles.chat.ring} p-1` : "opacity-50"}`} alt="chat" />
        </button>
        <BackgroundMusic />
      </div>
    </div>
  );
}
