import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
  avatar?: string;
  email?: string;
  name?: string;
  username?: string;
}

export interface UserSettingsContextType {
  settings: UserSettings;
  updateAvatar: (avatarUrl: string) => void;
  updateEmail: (email: string) => void;
  updateName: (name: string) => void;
  resetSettings: () => void;
}

const STORAGE_KEY = 'ai_assistant_user_settings';

export const useUserSettings = (): UserSettingsContextType => {
  const [settings, setSettings] = useState<UserSettings>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }, []);

  const updateAvatar = useCallback((avatarUrl: string) => {
    saveSettings({ ...settings, avatar: avatarUrl });
  }, [settings, saveSettings]);

  const updateEmail = useCallback((email: string) => {
    saveSettings({ ...settings, email });
  }, [settings, saveSettings]);

  const updateName = useCallback((name: string) => {
    saveSettings({ ...settings, name });
  }, [settings, saveSettings]);

  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings({});
    } catch (error) {
      console.error('Error resetting user settings:', error);
    }
  }, []);

  return {
    settings,
    updateAvatar,
    updateEmail,
    updateName,
    resetSettings,
  };
};