import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
} from "firebase/auth";

interface HomepageProps {
  onAuthSuccess: () => void;
}

// Toast notification component
const ToastNotification = ({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsVisible(false);
          setTimeout(onClose, 300);
          return 0;
        }
        return prev - 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down w-[90%] max-w-md">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg text-center relative overflow-hidden`}>
        <p className="text-sm sm:text-base">{message}</p>
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const FieldError = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1 animate-fade-in">{message}</p>;
};

export default function Homepage({ onAuthSuccess }: HomepageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  const firebaseAuth = getAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters" };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    return { isValid: true, message: "" };
  };

  const validateDisplayName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50;
  };

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const images = [
    "/homepage/card1.png",
    "/homepage/card2.png",
    "/homepage/card3.png"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setEmailError(null);
    setPasswordError(null);
    setDisplayNameError(null);
  };

  const sendTokenToBackend = async (token: string, role?: string) => {
    try {
      localStorage.setItem("token", token);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: displayName || "",
          role: role || "user",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Backend registration failed");
      }

      const data = await res.json();
      
      if (data.role) {
        localStorage.setItem("userRole", data.role);
      }
      if (data.uid) {
        localStorage.setItem("userId", data.uid);
      }

      return true;
    } catch (err) {
      console.error("Backend error:", err);
      showToast(err instanceof Error ? err.message : "Backend connection failed", "error");
      return false;
    }
  };

  const handleLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setIsTransitioning(true);
    try {
      const userCred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await userCred.user.getIdToken();
      const success = await sendTokenToBackend(token);
      
      if (!success) {
        setIsTransitioning(false);
        return;
      }
      
      showToast("Login successful! Redirecting...", "success");
      setTimeout(() => {
        onAuthSuccess(); // This will trigger App.tsx to verify role and redirect
      }, 1000);
    } catch (error: any) {
      setIsTransitioning(false);
      if (error.code === 'auth/user-not-found') {
        setEmailError("No account found with this email");
      } else if (error.code === 'auth/wrong-password') {
        setPasswordError("Incorrect password");
      } else if (error.code === 'auth/invalid-email') {
        setEmailError("Invalid email format");
      } else {
        showToast(error.message || "Login failed", "error");
      }
      console.error(error);
    }
  };

  const handleSignup = async () => {
    setEmailError(null);
    setPasswordError(null);
    setDisplayNameError(null);
    
    if (!validateDisplayName(displayName)) {
      setDisplayNameError("Display name must be between 2 and 50 characters");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    setIsTransitioning(true);
    try {
      const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const token = await userCred.user.getIdToken();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: displayName || "",
          role: selectedRole,
        }),
      });
    
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      const data = await res.json();
      
      // Store role temporarily
      if (data.role) {
        localStorage.setItem("userRole", data.role);
      }
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }
      
      showToast("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        onAuthSuccess(); // This will trigger App.tsx to verify role and redirect
      }, 1000);
    } catch (error: any) {
      setIsTransitioning(false);
      if (error.code === 'auth/email-already-in-use') {
        showToast("This email is already registered. Please login instead.", "error");
      } else {
        showToast(error.message || "Signup failed", "error");
      }
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    setIsTransitioning(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const token = await result.user.getIdToken();
      const success = await sendTokenToBackend(token, "user");
      
      if (!success) {
        setIsTransitioning(false);
        return;
      }
      
      showToast("Google login successful! Redirecting...", "success");
      setTimeout(() => {
        onAuthSuccess(); // This will trigger App.tsx to verify role and redirect
      }, 1000);
    } catch (error: any) {
      setIsTransitioning(false);
      showToast(error.message || "Google login failed", "error");
      console.error(error);
    }
  };

  const instructions = mode === "login" ? {
    title: "Login Instructions",
    steps: [
      "Enter your registered email address",
      "Enter your password",
      "Passwords must be at least 6 characters with uppercase letters and numbers",
    ]
  } : {
    title: "Sign Up Instructions",
    steps: [
      "Select your account type: User or Admin",
      "Choose a display name (2-50 characters)",
      "Use a valid email address",
      "Create a strong password: at least 6 characters, 1 uppercase, 1 number"
    ]
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {toast && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* LEFT PANEL - Responsive */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-orange-200 flex flex-col items-center justify-center p-6 md:p-8 min-h-[40vh] md:min-h-screen">
        <img 
          src="/Mirae-Daw-Logo.png" 
          alt="Logo" 
          className="w-32 sm:w-40 md:w-32 lg:w-40 mb-4 md:mb-6" 
        />
        <h1 className="text-xl sm:text-2xl font-bold mb-4 md:mb-6 text-center px-4">
          Welcome to Mirae Daw
        </h1>

        <button
          onClick={() => {
            setMode("login");
            setIsModalOpen(true);
          }}
          className="bg-purple-600 text-white px-6 py-2 rounded-full mb-3 w-full max-w-[200px] md:max-w-full"
        >
          Login
        </button>

        <button
          onClick={() => {
            setMode("signup");
            setIsModalOpen(true);
          }}
          className="bg-white border border-purple-600 text-purple-600 px-6 py-2 rounded-full w-full max-w-[200px] md:max-w-full"
        >
          Sign Up
        </button>
      </div>

      {/* RIGHT PANEL - SLIDING CARDS - Responsive */}
      <div className="w-full md:w-2/3 lg:w-3/4 bg-white flex items-center justify-center p-4 md:p-8 min-h-[60vh] md:min-h-screen">
        <img 
          src={images[currentIndex]} 
          alt="card" 
          className="w-full max-w-md md:max-w-lg lg:max-w-xl rounded-xl shadow-lg transition-opacity duration-700"
        />
      </div>

      {/* MODAL - Fully Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />

          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-[95%] sm:max-w-md md:max-w-lg relative z-50 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeModal} 
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Instructions Box */}
            <div className="mb-4 md:mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">{instructions.title}</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                {instructions.steps.map((step, idx) => (
                  <li key={idx}>• {step}</li>
                ))}
              </ul>
            </div>

            {mode === "login" ? (
              <>
                <h2 className="text-lg sm:text-xl font-bold mb-4">Login</h2>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full border p-2 sm:p-3 rounded-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                  />
                  <FieldError message={emailError} />
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full border p-2 sm:p-3 rounded-lg pr-10 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <FieldError message={passwordError} />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isTransitioning}
                  className="bg-purple-600 text-white w-full py-2 sm:py-3 rounded-lg mb-3 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isTransitioning ? "Loading..." : "Login"}
                </button>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isTransitioning}
                  className="border w-full py-2 sm:py-3 rounded-lg mb-3 disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>

                <p className="text-xs sm:text-sm text-center">
                  Don't have an account?{" "}
                  <span className="text-purple-600 cursor-pointer" onClick={() => setMode("signup")}>
                    Sign up
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl font-bold mb-4">Sign Up</h2>

                <div className="flex gap-2 mb-4">
                  {(['user', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 py-2 rounded-lg capitalize text-sm sm:text-base ${
                        selectedRole === role
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {role === 'user' ? '👤 User' : '🔧 Admin'}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Display Name"
                    className={`w-full border p-2 sm:p-3 rounded-lg ${displayNameError ? 'border-red-500' : 'border-gray-300'}`}
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setDisplayNameError(null);
                    }}
                  />
                  <FieldError message={displayNameError} />
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full border p-2 sm:p-3 rounded-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                  />
                  <FieldError message={emailError} />
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full border p-2 sm:p-3 rounded-lg pr-10 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <FieldError message={passwordError} />
                </div>

                <button
                  onClick={handleSignup}
                  disabled={isTransitioning}
                  className="bg-purple-600 text-white w-full py-2 sm:py-3 rounded-lg mb-3 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isTransitioning ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="text-xs sm:text-sm text-center">
                  Already have an account?{" "}
                  <span className="text-purple-600 cursor-pointer" onClick={() => setMode("login")}>
                    Login
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
