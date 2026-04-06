import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  sendPasswordResetEmail
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg min-w-[300px] text-center relative overflow-hidden`}>
        <p>{message}</p>
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Field error component
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
  
  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  const auth = getAuth();

  // Validation functions
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

  // Sliding cards
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
          role: role || "user", // Default to "user" if no role specified
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Backend registration failed");
      }

      return true;
    } catch (err) {
      console.error("Backend error:", err);
      showToast(err instanceof Error ? err.message : "Backend connection failed", "error");
      return false;
    }
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError(null);
    setPasswordError(null);
    
    // Validate
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address (e.g., name@domain.com)");
      return;
    }
    
    setIsTransitioning(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      const success = await sendTokenToBackend(token);
      
      if (!success) {
        setIsTransitioning(false);
        return;
      }
      
      showToast("Login successful! Redirecting...", "success");
      setTimeout(() => {
        onAuthSuccess();
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
    // Reset errors
    setEmailError(null);
    setPasswordError(null);
    setDisplayNameError(null);
    
    // Validate
    if (!validateDisplayName(displayName)) {
      setDisplayNameError("Display name must be between 2 and 50 characters");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address (e.g., name@domain.com)");
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    setIsTransitioning(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
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
      
      showToast("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        onAuthSuccess();
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
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const success = await sendTokenToBackend(token, "user");
      
      if (!success) {
        setIsTransitioning(false);
        return;
      }
      
      showToast("Google login successful! Redirecting...", "success");
      setTimeout(() => {
        onAuthSuccess();
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
      "Use 'Forgot Password?' if you need to reset"
    ]
  } : {
    title: "Sign Up Instructions",
    steps: [
      "Select your account type: User (regular) or Admin (system management)",
      "Choose a display name (2-50 characters)",
      "Use a valid email address (e.g., name@domain.com)",
      "Create a strong password: at least 6 characters, 1 uppercase, 1 number"
    ]
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Toast Notifications */}
      {toast && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* LEFT PANEL */}
      <div className="w-1/4 bg-orange-200 flex flex-col items-center justify-center p-8">
        <img src="/Mirae-Daw-Logo.png" alt="Logo" className="w-40 mb-6" />
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Mirae Daw</h1>

        <button
          onClick={() => {
            setMode("login");
            setIsModalOpen(true);
          }}
          className="bg-purple-600 text-white px-6 py-2 rounded-full mb-4 w-full"
        >
          Login
        </button>

        <button
          onClick={() => {
            setMode("signup");
            setIsModalOpen(true);
          }}
          className="bg-white border border-purple-600 text-purple-600 px-6 py-2 rounded-full w-full"
        >
          Sign Up
        </button>
      </div>

      {/* RIGHT PANEL - SLIDING CARDS */}
      <div className="w-3/4 bg-white flex items-center justify-center relative overflow-hidden">
        <img src={images[currentIndex]} alt="card" className="w-3/4 rounded-xl shadow-lg transition-opacity duration-700" />
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />

          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 relative z-50 max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg">✕</button>

            {/* Instructions Box */}
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">{instructions.title}</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                {instructions.steps.map((step, idx) => (
                  <li key={idx}>• {step}</li>
                ))}
              </ul>
            </div>

            {mode === "login" ? (
              <>
                <h2 className="text-xl font-bold mb-4">Login</h2>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full border p-2 rounded ${emailError ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full border p-2 rounded pr-10 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <FieldError message={passwordError} />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isTransitioning}
                  className="bg-purple-600 text-white w-full py-2 rounded mb-3 disabled:opacity-50"
                >
                  {isTransitioning ? "Loading..." : "Login"}
                </button>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isTransitioning}
                  className="border w-full py-2 rounded mb-3 disabled:opacity-50"
                >
                  Continue with Google
                </button>

                <p className="text-sm text-center">
                  Don't have an account?{" "}
                  <span className="text-purple-600 cursor-pointer" onClick={() => setMode("signup")}>
                    Sign up
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Sign Up</h2>

                <div className="flex gap-2 mb-4">
                  {(['user', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 py-2 rounded-lg capitalize ${
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
                    className={`w-full border p-2 rounded ${displayNameError ? 'border-red-500' : 'border-gray-300'}`}
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
                    className={`w-full border p-2 rounded ${emailError ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full border p-2 rounded pr-10 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <FieldError message={passwordError} />
                </div>

                <button
                  onClick={handleSignup}
                  disabled={isTransitioning}
                  className="bg-purple-600 text-white w-full py-2 rounded mb-3 disabled:opacity-50"
                >
                  {isTransitioning ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="text-sm text-center">
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
