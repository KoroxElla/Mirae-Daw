import React, { useState, useEffect } from "react";
import Homepage from "./components/Homepage";
import MainPage from "./components/MainPage";
import AvatarCustomizer from "./components/AvatarCustomizer";
import { AvatarProvider } from './contexts/AvatarContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "main" | "customizer"
  >("main");

  const [avatarData, setAvatarData] = useState<any>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);


  useEffect(() => {
    const fetchAvatar = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/avatar/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.avatarUrl) {
        setAvatarData({ avatarUrl: data.avatarUrl });
      }
    };

    if (isAuthenticated) {
      fetchAvatar();
    }
  }, [isAuthenticated]);


  // 1️⃣ If NOT logged in → show Homepage (with modal login)
  if (!isAuthenticated) {
    return (
      <Homepage
        onAuthSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  // 2️⃣ If user clicks customize avatar
  if (currentPage === "customizer") {
    return (
      <AvatarCustomizer
        onSave={(data) => {
          setAvatarData(data);
          setCurrentPage("main");
        }}
        onClose={() => setCurrentPage("main")}
      />
    );
  }

  // 3️⃣ Default after login → MainPage
  return (
    <AvatarProvider>
    <MainPage
      avatarData={avatarData}
      onCustomize={() => setCurrentPage("customizer")}
      onLogout={() => {
        localStorage.removeItem("token");
        setAvatarData(null);
        setIsAuthenticated(false);
      }}

    />
   </AvatarProvider>
  );
}

