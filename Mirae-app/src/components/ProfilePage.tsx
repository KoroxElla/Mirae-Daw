// components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  journalCount: number;
  chatCount: number;
}

interface ProfilePageProps {
  userId: string;
  onClose: () => void;
}

export default function ProfilePage({ userId, onClose }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("PROFILE STATUS:", response.status);
      console.log("TOKEN:", token);

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        // Cache profile data
        localStorage.setItem(`user_profile_${userId}`, JSON.stringify(data));
      } else {
        // Try to load from cache
        const cached = localStorage.getItem(`user_profile_${userId}`);
        if (cached) {
          setProfile(JSON.parse(cached));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Try cache as fallback
      const cached = localStorage.getItem(`user_profile_${userId}`);
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">My Profile</h2>
              <p className="opacity-90 text-sm">{profile?.email}</p>
            </div>
            <button onClick={onClose} className="text-white text-2xl">✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
              {profile?.displayName?.charAt(0)?.toUpperCase() || '👤'}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Display Name</label>
              <p className="text-lg font-semibold">{profile?.displayName || 'Not set'}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
              <p className="text-lg">{profile?.email}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Account Type</label>
              <p className="text-lg capitalize">
                {profile?.role === 'agent' ? '🔧 Agent / Admin' : '👤 Regular User'}
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Member Since</label>
              <p className="text-lg">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}</p>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{profile?.journalCount || 0}</p>
                  <p className="text-xs text-gray-500">Journal Entries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{profile?.chatCount || 0}</p>
                  <p className="text-xs text-gray-500">Chat Sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
