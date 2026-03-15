export type AIProviderType = 'claude' | 'kimi' | 'openai' | 'custom'

export interface AIProvider {
  provider: AIProviderType
  apiKey: string
  baseUrl: string
  model: string
}

export interface EditorSettings {
  theme: 'dark' | 'light' | 'system'
  fontSize: number
  tabSize: number
  wordWrap: boolean
}

export interface Settings {
  aiProvider: AIProvider
  editor: EditorSettings
}

const DEFAULT_SETTINGS: Settings = {
  aiProvider: {
    provider: 'claude',
    apiKey: '',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-3-sonnet-20240229',
  },
  editor: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
  },
}

const SETTINGS_KEY = 'vibecode-settings'

export function getSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return DEFAULT_SETTINGS
    }
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export function resetSettings(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch (error) {
    console.error('Failed to reset settings:', error)
  }
}

export function getAIProvider(): AIProvider {
  return getSettings().aiProvider
}

export function getAPIKey(): string {
  return getSettings().aiProvider.apiKey
}

export function hasAPIKey(): boolean {
  return !!getSettings().aiProvider.apiKey
}
