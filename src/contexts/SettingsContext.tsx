import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppSettings, AISettings, EditorSettings, AIProvider, AgentType } from '../types';
import { AGENT_CONFIGS, PROVIDER_CONFIGS } from '../types';
import { encryptApiKey, decryptApiKey } from '../utils/encryption';

const SETTINGS_STORAGE_KEY = 'vibecode-settings';
const API_KEYS_STORAGE_KEY = 'vibecode-api-keys';

const defaultAISettings: AISettings = {
  defaultProvider: 'claude',
  useCloudApi: true,
  apiKeys: {},
  ollamaUrl: 'http://localhost:11434',
  agentSettings: {
    completion: {
      provider: 'claude',
      model: PROVIDER_CONFIGS.claude.models[0],
      temperature: 0.3,
      maxTokens: 2048,
    },
    'bug-detection': {
      provider: 'claude',
      model: PROVIDER_CONFIGS.claude.models[0],
      temperature: 0.2,
      maxTokens: 4096,
    },
    refactoring: {
      provider: 'claude',
      model: PROVIDER_CONFIGS.claude.models[0],
      temperature: 0.4,
      maxTokens: 4096,
    },
    docs: {
      provider: 'claude',
      model: PROVIDER_CONFIGS.claude.models[2],
      temperature: 0.5,
      maxTokens: 2048,
    },
    tests: {
      provider: 'claude',
      model: PROVIDER_CONFIGS.claude.models[0],
      temperature: 0.3,
      maxTokens: 4096,
    },
  },
};

const defaultEditorSettings: EditorSettings = {
  theme: 'dark',
  fontSize: 14,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  tabSize: 2,
  insertSpaces: true,
};

const defaultSettings: AppSettings = {
  ai: defaultAISettings,
  editor: defaultEditorSettings,
  version: '0.2.0',
};

interface SettingsContextType {
  settings: AppSettings;
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  updateAgentSettings: (agentType: AgentType, settings: Partial<AISettings['agentSettings'][AgentType]>) => void;
  setApiKey: (provider: AIProvider, apiKey: string) => void;
  getApiKey: (provider: AIProvider) => string | null;
  hasApiKey: (provider: AIProvider) => boolean;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure new fields are present
        setSettings({
          ...defaultSettings,
          ...parsed,
          ai: { ...defaultAISettings, ...parsed.ai },
          editor: { ...defaultEditorSettings, ...parsed.editor },
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
        const settingsWithoutApiKeys = {
          ...settings,
          ai: {
            ...settings.ai,
            apiKeys: {}, // Don't save API keys in settings
          },
        };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithoutApiKeys));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateAISettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prev) => ({
      ...prev,
      ai: { ...prev.ai, ...newSettings },
    }));
  }, []);

  const updateEditorSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      editor: { ...prev.editor, ...newSettings },
    }));
  }, []);

  const updateAgentSettings = useCallback((agentType: AgentType, newSettings: Partial<AISettings['agentSettings'][AgentType]>) => {
    setSettings((prev) => ({
      ...prev,
      ai: {
        ...prev.ai,
        agentSettings: {
          ...prev.ai.agentSettings,
          [agentType]: { ...prev.ai.agentSettings[agentType], ...newSettings },
        },
      },
    }));
  }, []);

  const setApiKey = useCallback((provider: AIProvider, apiKey: string) => {
    try {
      const encrypted = encryptApiKey(apiKey);
      const existingKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      const keys = existingKeys ? JSON.parse(existingKeys) : {};
      keys[provider] = encrypted;
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
      
      setSettings((prev) => ({
        ...prev,
        ai: {
          ...prev.ai,
          apiKeys: { ...prev.ai.apiKeys, [provider]: apiKey },
        },
      }));
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }, []);

  const getApiKey = useCallback((provider: AIProvider): string | null => {
    try {
      // First check in-memory settings
      if (settings.ai.apiKeys[provider]) {
        return settings.ai.apiKeys[provider];
      }
      
      // Then check localStorage
      const existingKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (existingKeys) {
        const keys = JSON.parse(existingKeys);
        if (keys[provider]) {
          return decryptApiKey(keys[provider]);
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }, [settings.ai.apiKeys]);

  const hasApiKey = useCallback((provider: AIProvider): boolean => {
    if (provider === 'ollama') return true; // Ollama doesn't need API key
    return getApiKey(provider) !== null;
  }, [getApiKey]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
  }, []);

  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      setSettings({
        ...defaultSettings,
        ...parsed,
        ai: { ...defaultAISettings, ...parsed.ai },
        editor: { ...defaultEditorSettings, ...parsed.editor },
      });
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateAISettings,
        updateEditorSettings,
        updateAgentSettings,
        setApiKey,
        getApiKey,
        hasApiKey,
        resetSettings,
        exportSettings,
        importSettings,
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