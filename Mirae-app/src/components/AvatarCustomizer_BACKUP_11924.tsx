import React, { useEffect, useRef } from "react";
import { AvaturnSDK } from "@avaturn/sdk";
import { storage, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


interface AvatarCustomizerProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function AvatarCustomizer({
  onSave,
  onClose,
}: AvatarCustomizerProps) {

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sdk = new AvaturnSDK();

    const subdomain = "miraedaw";
    const url = `https://${subdomain}.avaturn.dev`;

    sdk.init(containerRef.current, { url }).then(() => {

      sdk.on("export", async (data) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const user = auth.currentUser;
          if (!user) return;

          // Convert base64 to blob safely
          const fileResponse = await fetch(data.url);
          const blob = await fileResponse.blob();

          const storageRef = ref(storage, `avatars/${user.uid}.glb`);

          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

<<<<<<< HEAD
          const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/avatar/save`, {
=======
          const backendResponse = await fetch("http://localhost:5000/avatar/save", {
>>>>>>> 36a9f3824f595c788305ef6b99b71a1198038ec3
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatarUrl: downloadURL }),
          });
          if (!backendResponse.ok) {
            const text = await backendResponse.text();
            console.error("Backend error:", text);
          }
          console.log("✅ Avatar saved successfully");
          onSave({ avatarUrl: downloadURL });

        } catch (error) {
          console.error("Failed to save avatar:", error);
        }
      });

    });

  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white z-50">
      <div
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
}

