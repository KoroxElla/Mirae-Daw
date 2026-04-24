import React, { useState, useEffect } from "react";
import Homepage from "./components/Homepage";
import MainPage from "./components/MainPage";
import AgentDashboard from './pages/AgentDashboard';
import { AvatarProvider } from './contexts/AvatarContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'agent' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      

      try {
        // Verify token and get role from backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/role`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();

          setUserRole(data.role);
          setUserId(data.uid);
          setIsAuthenticated(true);

          
          const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/user/avatar`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (avatarRes.ok) {
            const avatar = await avatarRes.json();
            setAvatarData(avatar);
          }
        }

        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
          setUserId(data.uid);
          setIsAuthenticated(true);
          
          // Cache role and userId
          localStorage.setItem("userRole", data.role);
          localStorage.setItem("userId", data.uid);
        } else {
          // Token invalid - clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, []);

  const handleAuthSuccess = async () => {
    // After successful login, fetch user role
    const token = localStorage.getItem("token");
    const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/user/avatar`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (avatarRes.ok) {
      const avatar = await avatarRes.json();
      setAvatarData(avatar);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/role`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
        setUserId(data.uid);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userId", data.uid);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to fetch role');
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      // Fallback: try to get from localStorage
      const cachedRole = localStorage.getItem("userRole");
      const cachedUserId = localStorage.getItem("userId");
      if (cachedRole && cachedUserId) {
        setUserRole(cachedRole as 'user' | 'agent');
        setUserId(cachedUserId);
        setIsAuthenticated(true);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Homepage onAuthSuccess={handleAuthSuccess} />;
  }

  // Agent logged in - redirect to Agent Dashboard
  if (userRole === 'agent') {
    return <AgentDashboard agentId={userId || ''} />;
  }

  // Regular user - redirect to MainPage
  return (
    <AvatarProvider>
      <MainPage
        avatarData={avatarData}
        onCustomize={() => {}}
        onLogout={handleLogout}
      />
    </AvatarProvider>
  );
}
