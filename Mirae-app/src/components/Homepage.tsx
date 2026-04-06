import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAuth
} from "firebase/auth";

interface HomepageProps {
  onAuthSuccess: () => void;
}

export default function Homepage({ onAuthSuccess }: HomepageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "agent" | "admin">("user");
  
  const auth = getAuth();
  const user = auth.currentUser;

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
  };

  const sendTokenToBackend = async (token: string) => {
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
        }),
      });

      return res.ok;

    } catch (err) {
      console.error("Backend error:", err);
      return false;
    }
  };


  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCred.user.getIdToken();
      const success = await sendTokenToBackend(token);

      if (!success) {
        alert("Backend verification failed");
        return;
      }
      


      onAuthSuccess();
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  const handleSignup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCred.user.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: displayName || "",
          role: selectedRole, // Add this
        }),
      });
    
      if (!res.ok) throw new Error('Registration failed');

      onAuthSuccess();
    } catch (error) {
      alert("Signup failed");
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);

      onAuthSuccess();
    } catch (error) {
      alert("Google login failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="w-1/4 bg-orange-200 flex flex-col items-center justify-center p-8">

        <img
          src="/Mirae-Daw-Logo.png"
          alt="Logo"
          className="w-40 mb-6"
        />

        <h1 className="text-2xl font-bold mb-6 text-center">
          Welcome to Mirae Daw
        </h1>

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
        <img
          src={images[currentIndex]}
          alt="card"
          className="w-3/4 rounded-xl shadow-lg transition-opacity duration-700"
        />
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />

          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 relative z-50 transform transition-all duration-300 scale-100">

            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg"
            >
              ✕ 
            </button>

            {mode === "login" ? (
              <>
                <h2 className="text-xl font-bold mb-4">Login</h2>

                <div className="flex gap-2 mb-4">
                {(['user', 'agent', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 py-2 rounded-lg capitalize ${
                      selectedRole === role
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 mb-3 rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full border p-2 rounded pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  className="bg-purple-600 text-white w-full py-2 rounded mb-3"
                >
                  Login
                </button>

                <button
                  onClick={handleGoogleLogin}
                  className="border w-full py-2 rounded mb-3"
                >
                  Continue with Google
                </button>

                <p className="text-sm text-center">
                  Don't have an account?{" "}
                  <span
                    className="text-purple-600 cursor-pointer"
                    onClick={() => setMode("signup")}
                  >
                    Sign up
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Sign Up</h2>

                <div className="flex gap-2 mb-4">
                  {(['user', 'agent', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 py-2 rounded-lg capitalize ${
                        selectedRole === role
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Display Name"
                  className="w-full border p-2 mb-3 rounded"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 mb-3 rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full border p-2 rounded pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>

                <button
                  onClick={handleSignup}
                  className="bg-purple-600 text-white w-full py-2 rounded mb-3"
                >
                  Sign Up
                </button>

                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <span
                    className="text-purple-600 cursor-pointer"
                    onClick={() => setMode("login")}
                  >
                    Login
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

