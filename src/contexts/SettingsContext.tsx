import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS, AIProvider } from '../types';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  updateAISettings: (updates: Partial<Settings['ai']>) => void;
  updateEditorSettings: (updates: Partial<Settings['editor']>) => void;
  updateAgentSettings: (updates: Partial<Settings['agent']>) => void;
  resetSettings: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  activeSettingsTab: SettingsTab;
  setActiveSettingsTab: (tab: SettingsTab) => void;
  getCurrentProviderConfig: () => {
    provider: AIProvider;
    apiKey: string;
    baseUrl: string;
    model: string;
  };
}

export type SettingsTab = 'ai' | 'editor' | 'agent' | 'general';

const SETTINGS_KEY = 'vibecode-settings-v1';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('ai');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
          editor: { ...DEFAULT_SETTINGS.editor, ...parsed.editor },
          agent: { ...DEFAULT_SETTINGS.agent, ...parsed.agent },
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAISettings = useCallback((updates: Partial<Settings['ai']>) => {
    setSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, ...updates },
    }));
  }, []);

  const updateEditorSettings = useCallback((updates: Partial<Settings['editor']>) => {
    setSettings(prev => ({
      ...prev,
      editor: { ...prev.editor, ...updates },
    }));
  }, []);

  const updateAgentSettings = useCallback((updates: Partial<Settings['agent']>) => {
    setSettings(prev => ({
      ...prev,
      agent: { ...prev.agent, ...updates },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const getCurrentProviderConfig = useCallback(() => {
    return {
      provider: settings.ai.provider,
      apiKey: settings.ai.apiKey,
      baseUrl: settings.ai.baseUrl,
      model: settings.ai.model,
    };
  }, [settings.ai]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateAISettings,
        updateEditorSettings,
        updateAgentSettings,
        resetSettings,
        isSettingsOpen,
        openSettings,
        closeSettings,
        activeSettingsTab,
        setActiveSettingsTab,
        getCurrentProviderConfig,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
