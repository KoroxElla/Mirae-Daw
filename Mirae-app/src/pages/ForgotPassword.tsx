import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // your config

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true
      });

      setSent(true);
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {sent ? (
          <p className="text-green-400">
            Check your email for a reset link 📩
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleReset}
              className="w-full bg-purple-600 py-2 rounded-lg mt-2"
            >
              Send Reset Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}