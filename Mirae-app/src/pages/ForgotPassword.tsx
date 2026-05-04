import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ToastNotification } from "../components/ToastNotification";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<any>(null);
  const navigate = useNavigate();

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const handleReset = async () => {
    // ✅ validation first
    if (!email.trim()) {
      showToast("Please enter your email", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      showToast(
        "Reset email sent! Check inbox or spam folder 📩",
        "success"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err: any) {
      let message = "Failed to send reset email";

      if (err.code === "auth/user-not-found") {
        message = "No account found with this email";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address";
      }

      showToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Reset your password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter your email and we'll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border rounded-lg p-3 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-purple-600 text-white py-3 rounded-lg"
        >
          Send Reset Link
        </button>

        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}