import React, { useState } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { Canvas } from "@react-three/fiber";




interface MainPageProps {
  avatarData: any;
  onCustomize: () => void;
  onLogout: () => void;
}

function AvatarModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}


export default function MainPage({
  avatarData,
  onCustomize,
  onLogout,
}: MainPageProps) {

  const [activeTab, setActiveTab] = useState<
    "avatar" | "journal" | "reminisce" | "chat"
  >("avatar");

  const renderContent = () => {
    switch (activeTab) {
      case "avatar":
        return (
          <>
            <Canvas style={{ width: 800, height: 600 }} camera={{ position: [0, 0.5, 4], fov: 40 }}>
              <OrbitControls 
                enableZoom={true}
                enablePan={false}
                maxPolarAngle={Math.PI / 2} // Prevent going under the floor
                minDistance={2}
                maxDistance={6}
               />
              <ambientLight />
              <directionalLight position={[2, 2, 2]} />

              {avatarData?.avatarUrl && (
                <Avatar 
                  modelUrl={avatarData.avatarUrl}
                  animation="idle"
                  scale={1.5} 
                  showBackground={true}
                  backgroundColor="#FFC494"
                 />
              )}
            </Canvas>


            <button
              onClick={onCustomize}
              className="bg-purple-600 text-white px-6 py-2 rounded-full"
            >
              Customize Avatar
            </button>
          </>
        );

      case "journal":
        return <h2 className="text-xl">Journal Page (Coming Next)</h2>;

      case "reminisce":
        return <h2 className="text-xl">Reminisce Page (Coming Next)</h2>;

      case "chat":
        return <h2 className="text-xl">Chat Time Page (Coming Next)</h2>;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="font-bold text-lg">Mirae Daw</h1>

        <div className="flex gap-3 items-center">
          <img
            src="/main_icons/profile.png"
            className="w-6 h-6 cursor-pointer"
          />
          <img
            src="/main_icons/Settings.png"
            className="w-6 h-6 cursor-pointer"
          />
          <button
            onClick={onLogout}
            className="text-sm bg-gray-200 px-3 py-1 rounded-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-start justify-start bg-[#FFC494] p-4">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white shadow-inner p-4 flex justify-around">

        <button onClick={() => setActiveTab("avatar")}>
          <img
            src="/main_icons/avatar.png"
            className={`w-8 h-8 ${
              activeTab === "avatar" ? "opacity-100" : "opacity-50"
            }`}
          />
        </button>

        <button onClick={() => setActiveTab("journal")}>
          <img
            src="/main_icons/journal.png"
            className={`w-8 h-8 ${
              activeTab === "journal" ? "opacity-100" : "opacity-50"
            }`}
          />
        </button>

        <button onClick={() => setActiveTab("reminisce")}>
          <img
            src="/main_icons/reminisce.png"
            className={`w-8 h-8 ${
              activeTab === "reminisce" ? "opacity-100" : "opacity-50"
            }`}
          />
        </button>

        <button onClick={() => setActiveTab("chat")}>
          <img
            src="/main_icons/chattime.png"
            className={`w-8 h-8 ${
              activeTab === "chat" ? "opacity-100" : "opacity-50"
            }`}
          />
        </button>

      </div>

    </div>
  );
}
