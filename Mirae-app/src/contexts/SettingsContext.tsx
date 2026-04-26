import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserSettings {
  notifications: boolean;
  textToSpeech: boolean;
  highContrast: boolean;
  largeText: boolean;
  privacyLevel: 'private' | 'public' | 'friends';
}

const SettingsContext = createContext<any>(null);

export const SettingsProvider = ({ children }: any) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings(parsed);

      // ✅ Apply instantly on load
      document.body.classList.toggle('high-contrast', parsed.highContrast);
      document.body.classList.toggle('large-text', parsed.largeText);
    }
  }, []);

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('user_settings', JSON.stringify(newSettings));

    // ✅ Apply globally
    document.body.classList.toggle('high-contrast', newSettings.highContrast);
    document.body.classList.toggle('large-text', newSettings.largeText);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);