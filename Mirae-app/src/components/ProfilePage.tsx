import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface ProfilePageProps {
  userId: string;
  onClose: () => void;
}

export default function ProfilePage({ userId, onClose }: ProfilePageProps) {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [accessibilityMode, setAccessibilityMode] = useState<'default' | 'high-contrast' | 'large-text'>('default');

  // Load saved settings
  useEffect(() => {
    const savedUsername = localStorage.getItem(`username_${userId}`);
    const savedVolume = localStorage.getItem(`musicVolume_${userId}`);
    const savedMusicEnabled = localStorage.getItem(`musicEnabled_${userId}`);
    const savedAccessibility = localStorage.getItem(`accessibility_${userId}`);
    
    if (savedUsername) setUsername(savedUsername);
    if (savedVolume) setMusicVolume(parseFloat(savedVolume));
    if (savedMusicEnabled) setIsMusicEnabled(savedMusicEnabled === 'true');
    if (savedAccessibility) setAccessibilityMode(savedAccessibility as any);
  }, [userId]);

  const handleUpdateUsername = async () => {
    try {
      // Update in backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: username }),
      });
      
      if (response.ok) {
        localStorage.setItem(`username_${userId}`, username);
        alert('Username updated successfully!');
      }
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  const handleUpdatePassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert('Password updated successfully!');
      setNewPassword('');
      setCurrentPassword('');
    } catch (error) {
      alert('Failed to update password. Check your current password.');
    }
  };

  const handleIssueTokens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/issue-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      setTokenAmount(data.tokens || 0);
      alert(`Issued ${data.issued || 10} tokens! Total: ${data.tokens}`);
    } catch (error) {
      console.error('Error issuing tokens:', error);
    }
  };

  const handleMusicChange = (volume: number) => {
    setMusicVolume(volume);
    localStorage.setItem(`musicVolume_${userId}`, volume.toString());
    // Dispatch event for music player
    window.dispatchEvent(new CustomEvent('musicVolumeChange', { detail: { volume, enabled: isMusicEnabled } }));
  };

  const handleAccessibilityChange = (mode: typeof accessibilityMode) => {
    setAccessibilityMode(mode);
    localStorage.setItem(`accessibility_${userId}`, mode);
    document.body.className = mode === 'high-contrast' ? 'high-contrast' : mode === 'large-text' ? 'large-text' : '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Username Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Account Details</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="flex-1 border rounded-lg p-2"
              />
              <button
                onClick={handleUpdateUsername}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                Update
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Change Password</h3>
            <div className="space-y-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full border rounded-lg p-2"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) =>setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full border rounded-lg p-2"
              />
              <button
                onClick={handleUpdatePassword}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Theme Music */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Theme Music</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isMusicEnabled}
                  onChange={(e) => {
                    setIsMusicEnabled(e.target.checked);
                    localStorage.setItem(`musicEnabled_${userId}`, e.target.checked.toString());
                    window.dispatchEvent(new CustomEvent('musicVolumeChange', { 
                      detail: { volume: musicVolume, enabled: e.target.checked } 
                    }));
                  }}
                />
                Enable Background Music
              </label>
              <div>
                <label className="block text-sm mb-1">Volume: {Math.round(musicVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Accessibility</h3>
            <div className="flex gap-2">
              {(['default', 'high-contrast', 'large-text'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleAccessibilityChange(mode)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    accessibilityMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Tokens */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Agent Tokens</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Available Tokens</p>
                <p className="text-2xl font-bold text-purple-600">{tokenAmount}</p>
              </div>
              <button
                onClick={handleIssueTokens}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Issue New Tokens
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
