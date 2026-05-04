import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Homepage from "./components/Homepage";
import MainPage from "./components/MainPage";
import AgentDashboard from './pages/AgentDashboard';
import { AvatarProvider } from './contexts/AvatarContext';
import AvatarCustomizer from "./components/AvatarCustomizer";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Separate component for authenticated app content
function AuthenticatedApp({ 
  userRole, 
  userId, 
  avatarData, 
  onCustomize, 
  onLogout,
  showCustomizer,
  setShowCustomizer,
  setAvatarData
}: { 
  userRole: 'user' | 'agent' | null;
  userId: string | null;
  avatarData: any;
  onCustomize: () => void;
  onLogout: () => void;
  showCustomizer: boolean;
  setShowCustomizer: (show: boolean) => void;
  setAvatarData: (data: any) => void;
}) {
  // Agent logged in - redirect to Agent Dashboard
  if (userRole === 'agent') {
    return <AgentDashboard agentId={userId || ''} onLogout={onLogout} />;
  }

  // Regular user - show MainPage
  return (
    <>
      <AvatarProvider>
        <MainPage
          avatarData={avatarData}
          onCustomize={onCustomize}
          onLogout={onLogout}
        />
      </AvatarProvider>

      {showCustomizer && (
        <AvatarCustomizer
          onSave={(data) => {
            setAvatarData(data);
            setShowCustomizer(false);
          }}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </>
  );
}

// Main App component with Router at the top level
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'agent' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<any>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const navigate = useNavigate();

  const handleCustomize = () => {
    console.log("Opening customizer...");
    setShowCustomizer(true);
  };

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
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch role");
        }

        const data = await response.json();

        setUserRole(data.role);
        setUserId(data.uid);
        setIsAuthenticated(true);

        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userId", data.uid);

        // fetch avatar AFTER
        const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/user/avatar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (avatarRes.ok) {
          const avatar = await avatarRes.json();
          setAvatarData(avatar);
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
    navigate("/login")
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
      <Routes>
        {/* Public routes */}
        <Route 
          path="/forgot-password" 
          element={<ForgotPassword />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? 
              <Homepage onAuthSuccess={handleAuthSuccess} /> : 
              <Navigate to="/" replace />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <AuthenticatedApp
                userRole={userRole}
                userId={userId}
                avatarData={avatarData}
                onCustomize={handleCustomize}
                onLogout={handleLogout}
                showCustomizer={showCustomizer}
                setShowCustomizer={setShowCustomizer}
                setAvatarData={setAvatarData}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
  );
}