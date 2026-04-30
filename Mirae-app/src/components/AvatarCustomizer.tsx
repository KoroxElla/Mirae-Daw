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
    window.onerror = (msg, url, line, col, error) => {
      console.error("GLOBAL ERROR:", error);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const sdk = new AvaturnSDK();

    const subdomain = "miraedaw";
    const url = `https://${subdomain}.avaturn.dev`;

    let isMounted = true;

    sdk.init(containerRef.current, { url }).then(() => {
      if (!isMounted) return;

      sdk.on("export", async (data) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const user = auth.currentUser;
          if (!user) return;

          const fileResponse = await fetch(data.url);
          console.log("Export data:", data);
          const blob = await fileResponse.blob();

          const storageRef = ref(storage, `avatars/${user.uid}.glb`);

          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          await fetch(`${import.meta.env.VITE_API_URL}/avatar/save`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatarUrl: downloadURL }),
          });

          onSave({ avatarUrl: downloadURL });

        } catch (error) {
          console.error("Failed to save avatar:", error);
        }
      });
    });

    return () => {
      isMounted = false;
      // 👇 Important: destroy SDK if possible
      if (sdk && typeof sdk.destroy === "function") {
        sdk.destroy();
      }
    };
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

