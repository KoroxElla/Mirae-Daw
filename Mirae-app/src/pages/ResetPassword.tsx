import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const oobCode = searchParams.get("oobCode");

  // ✅ Verify token
  useEffect(() => {
    if (!oobCode) {
      setError("Invalid reset link");
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => setValid(true))
      .catch(() => setError("Expired or invalid link"));
  }, [oobCode]);

  // ✅ Submit new password
  const handleReset = async () => {
    if (!oobCode) return;

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to reset password");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Set New Password</h2>

        {!valid ? (
          <p>Validating link...</p>
        ) : success ? (
          <p className="text-green-400">Password updated! Redirecting...</p>
        ) : (
          <>
            <input
              type="password"
              placeholder="New password"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleReset}
              className="w-full bg-purple-600 py-2 rounded-lg"
            >
              Update Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}