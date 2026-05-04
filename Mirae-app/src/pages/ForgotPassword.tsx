import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);

      alert("Reset email sent ✅");
      navigate("/login"); // 🔥 important
    } catch (err) {
      console.error(err);
      alert("Failed to send reset email");
    }
  };

  return (
    <div className="p-6">
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleReset}>Send Reset Email</button>
    </div>
  );
}