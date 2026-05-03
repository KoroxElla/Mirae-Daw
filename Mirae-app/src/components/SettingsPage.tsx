import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from '../firebase';

interface UserSettings {
  notifications: boolean;
  textToSpeech: boolean;
  highContrast: boolean;
  largeText: boolean;
  privacyLevel: 'private' | 'public' | 'friends';
}

interface UserPreferences {
  journalRemindersEnabled: boolean;
  reminderTime: string;
  preferredPrompts: string[];
  comfortLevel: 'low' | 'medium' | 'high';
}

interface AgentToken {
  id: string;
  token: string;
  expiresAt: string;
  scopes: string[];
  createdAt: string;
  isActive: boolean;
}

interface UserDetails {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const availableScopes = [
  { id: 'emotions', name: '📊 Emotion Analytics', description: 'Access emotion graphs and trends' },
  { id: 'journal_entries', name: '📔 Journal Entries', description: 'Read journal entries' },
  { id: 'chat_history', name: '💬 Chat History', description: 'View chat conversations' },
  { id: 'user_profile', name: '👤 User Profile', description: 'View basic user information' },
];

interface SettingsPageProps {
  userId: string;
  onClose: () => void;
}

export default function SettingsPage({ userId, onClose }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<'account' | 'preferences' | 'tokens'>('account');
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    textToSpeech: false,
    highContrast: false,
    largeText: false,
    privacyLevel: 'private',
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    journalRemindersEnabled: false,
    reminderTime: '09:00',
    preferredPrompts: [],
    comfortLevel: 'medium',
  });
  const [userDetails, setUserDetails] = useState<UserDetails>({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [tokens, setTokens] = useState<AgentToken[]>([]);
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['emotions']);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateSettings: updateGlobalSettings } = useSettings();

  // Fetch user settings from backend
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch settings and preferences
      const [settingsRes, preferencesRes, tokensRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/agent/tokens`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
        // Save to localStorage for quick access
        localStorage.setItem(`user_settings_${userId}`, JSON.stringify(data));
      }

      if (preferencesRes.ok) {
        const data = await preferencesRes.json();
        setPreferences(data);
        localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(data));
      }

      if (tokensRes.ok) {
        const data = await tokensRes.json();
        setTokens(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Load from localStorage as fallback
      const savedSettings = localStorage.getItem(`user_settings_${userId}`);
      const savedPreferences = localStorage.getItem(`user_preferences_${userId}`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const token = localStorage.getItem('token');
    const updated = { ...settings, ...newSettings };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    });

    if (res.ok) {
      setSettings(updated);
      updateGlobalSettings(updated);
    }
    if (newSettings.notifications) {
      Notification.requestPermission();
    }
  };

  // Re-authentication helper function
  const reauthenticate = async (user: any, currentPassword: string) => {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
  };

  const updateUserDetails = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    // Validate passwords match if updating password
    if (userDetails.newPassword && userDetails.newPassword !== userDetails.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    // Validate password length if provided
    if (userDetails.newPassword && userDetails.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Check if anything is actually being updated
    const isEmailChanging = userDetails.email && userDetails.email !== user.email;
    const isPasswordChanging = !!userDetails.newPassword;
    const isUsernameChanging = !!userDetails.username;

    if (!isEmailChanging && !isPasswordChanging && !isUsernameChanging) {
      alert("No changes to update");
      return;
    }

    setIsUpdating(true);

    try {
      // 🔐 Re-authenticate before sensitive updates (email/password)
      // Only required if email or password is being changed
      if ((isEmailChanging || isPasswordChanging) && userDetails.currentPassword) {
        try {
          await reauthenticate(user, userDetails.currentPassword);
        } catch (reauthError: any) {
          console.error("Re-authentication failed:", reauthError);
          if (reauthError.code === "auth/wrong-password") {
            alert("Current password is incorrect. Please enter your current password to update email or password.");
          } else {
            alert("Please re-enter your current password to update email or password.");
          }
          setIsUpdating(false);
          return;
        }
      } else if ((isEmailChanging || isPasswordChanging) && !userDetails.currentPassword) {
        alert("Please enter your current password to update email or password.");
        setIsUpdating(false);
        return;
      }

      // 📧 Update email
      if (isEmailChanging) {
        await updateEmail(user, userDetails.email);
        console.log("Email updated successfully");
      }

      // 🔑 Update password
      if (isPasswordChanging) {
        await updatePassword(user, userDetails.newPassword);
        console.log("Password updated successfully");
        // Clear password fields after successful update
        setUserDetails(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
      }

      // 🧠 Update username in your backend
      if (isUsernameChanging) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            displayName: userDetails.username
          })
        });

        if (!response.ok) {
          throw new Error("Failed to update username");
        }
        console.log("Username updated successfully");
      }

      alert("✅ Account updated successfully!");
      
      // Clear sensitive fields
      setUserDetails(prev => ({ 
        ...prev, 
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

    } catch (err: any) {
      console.error("Update error:", err);
      
      // Handle specific Firebase errors
      if (err.code === "auth/requires-recent-login") {
        alert("⚠️ For security reasons, please log out and log back in before updating email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        alert("This email is already in use by another account.");
      } else if (err.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else {
        alert("❌ Failed to update account. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const token = localStorage.getItem('token');
      const updated = { ...preferences, ...newPreferences };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });

      if (response.ok) {
        setPreferences(updated);
        localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const createToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          expiryDays,
          scopes: selectedScopes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewToken(data.token);
        fetchUserData(); // Refresh tokens list
        setTimeout(() => setNewToken(null), 10000);
        setShowCreateToken(false);
        setSelectedScopes(['emotions']); // Reset scopes
        setExpiryDays(30); // Reset expiry
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert("Failed to create token");
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (confirm("Are you sure you want to revoke this token? It will stop working immediately.")) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_URL}/agent/tokens/${tokenId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchUserData();
      } catch (error) {
        console.error('Error revoking token:', error);
        alert("Failed to revoke token");
      }
    }
  };

  const renewToken = async (tokenId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/tokens/${tokenId}/renew`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUserData(); // refresh list
        alert("Token renewed successfully!");
      } else {
        throw new Error("Renewal failed");
      }
    } catch (error) {
      console.error('Error renewing token:', error);
      alert("Failed to renew token");
    }
  };

  if (isLoading) {
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
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">⚙️ Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4">
          {[
            { id: 'account', label: '👤 Account', icon: '👤' },
            { id: 'preferences', label: '🎨 Preferences', icon: '🎨' },
            { id: 'tokens', label: '🔑 API Tokens', icon: '🔑' },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-4 py-2 font-medium transition ${
                activeSection === section.id
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Account Details</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Update your account information. For security, you'll need to confirm your current password when changing email or password.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={userDetails.username}
                      onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">This will be visible to other users</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">You'll need to verify new email addresses</p>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Change Password</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input
                          type="password"
                          placeholder="Required for email/password changes"
                          value={userDetails.currentPassword}
                          onChange={(e) => setUserDetails({ ...userDetails, currentPassword: e.target.value })}
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                          type="password"
                          placeholder="Leave blank to keep current"
                          value={userDetails.newPassword}
                          onChange={(e) => setUserDetails({ ...userDetails, newPassword: e.target.value })}
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Confirm your new password"
                          value={userDetails.confirmPassword}
                          onChange={(e) => setUserDetails({ ...userDetails, confirmPassword: e.target.value })}
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={updateUserDetails}
                    disabled={isUpdating}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Notifications</h3>
                <label className="flex items-center justify-between py-2">
                  <span>Enable notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => updateSettings({ notifications: e.target.checked })}
                    className="toggle"
                  />
                </label>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Accessibility</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between py-2">
                    <span>High Contrast Mode</span>
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                      className="toggle"
                    />
                  </label>
                  <label className="flex items-center justify-between py-2">
                    <span>Large Text</span>
                    <input
                      type="checkbox"
                      checked={settings.largeText}
                      onChange={(e) => updateSettings({ largeText: e.target.checked })}
                      className="toggle"
                    />
                  </label>
                  <label className="flex items-center justify-between py-2">
                    <span>Text to Speech</span>
                    <input
                      type="checkbox"
                      checked={settings.textToSpeech}
                      onChange={(e) => updateSettings({ textToSpeech: e.target.checked })}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Journal Reminders</h3>
                <label className="flex items-center justify-between py-2">
                  <span>Enable daily reminders</span>
                  <input
                    type="checkbox"
                    checked={preferences.journalRemindersEnabled}
                    onChange={(e) => updatePreferences({ journalRemindersEnabled: e.target.checked })}
                    className="toggle"
                  />
                </label>
                {preferences.journalRemindersEnabled && (
                  <div className="mt-3">
                    <label className="block text-sm mb-1">Reminder Time</label>
                    <input
                      type="time"
                      value={preferences.reminderTime}
                      onChange={(e) => updatePreferences({ reminderTime: e.target.value })}
                      className="border rounded-lg p-2"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Comfort Level</h3>
                <select
                  value={preferences.comfortLevel}
                  onChange={(e) => updatePreferences({ comfortLevel: e.target.value as any })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="low">Low - Basic prompts only</option>
                  <option value="medium">Medium - Standard depth</option>
                  <option value="high">High - Deep reflective prompts</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Higher comfort levels ask more personal and reflective questions
                </p>
              </div>
            </div>
          )}

          {/* API Tokens */}
          {activeSection === 'tokens' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Agent Access Tokens</h3>
                <button
                  onClick={() => setShowCreateToken(true)}
                  className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition"
                >
                  + New Token
                </button>
              </div>

              {tokens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No API tokens created yet</p>
                  <p className="text-sm mt-1">Create a token to allow third-party agents to access your journal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map(token => (
                    <div key={token.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {token.token.slice(0, 8)}...{token.token.slice(-8)}
                          </code>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {token.scopes.map(scope => (
                              <span key={scope} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {scope}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(token.expiresAt).toLocaleDateString()}
                            {new Date(token.expiresAt) < new Date() && " (Expired)"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(token.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => renewToken(token.id)}
                            className="text-blue-500 text-sm hover:text-blue-700"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => revokeToken(token.id)}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Token Modal */}
      {showCreateToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Create API Token</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Valid for</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Access Scopes</label>
              <div className="space-y-2">
                {availableScopes.map(scope => (
                  <label key={scope.id} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScopes([...selectedScopes, scope.id]);
                        } else {
                          setSelectedScopes(selectedScopes.filter(s => s !== scope.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{scope.name}</div>
                      <div className="text-xs text-gray-400">{scope.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={createToken} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                Generate
              </button>
              <button onClick={() => setShowCreateToken(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Token Display */}
      {newToken && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 rounded-lg p-4 max-w-md z-50 shadow-lg">
          <p className="font-semibold text-green-800">🎉 Token Generated Successfully!</p>
          <code className="block bg-white p-2 rounded text-sm my-2 break-all font-mono">{newToken}</code>
          <p className="text-xs text-green-700 font-medium">⚠️ Save this token now. You won't be able to see it again!</p>
          <button onClick={() => setNewToken(null)} className="absolute top-2 right-2 text-green-800 hover:text-green-600">✕</button>
        </div>
      )}

      <style>{`
        .toggle {
          appearance: none;
          width: 44px;
          height: 24px;
          background: #ddd;
          border-radius: 24px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }
        .toggle:checked {
          background: #7c3aed;
        }
        .toggle::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
        .toggle:checked::before {
          left: 22px;
        }
      `}</style>
    </div>
  );
}