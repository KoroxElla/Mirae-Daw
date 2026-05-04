import { useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get("oobCode");

  const handleReset = async () => {
    if (!oobCode) {
      alert("Invalid reset link");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);

      alert("Password reset successful ✅");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Reset failed");
    }
  };

  return (
    <div className="p-6">
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleReset}>Update Password</button>
    </div>
  );
}