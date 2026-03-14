export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  provider?: AIProvider;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  provider?: AIProvider;
}

export type AIProvider = 'claude' | 'kimi' | 'ollama' | 'custom' | 'openai';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface EditorSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
}

export interface AgentSettings {
  enabled: boolean;
  autoRun: boolean;
  confirmBeforeAction: boolean;
  maxIterations: number;
}

export interface Settings {
  ai: AIConfig;
  editor: EditorSettings;
  agent: AgentSettings;
  version: string;
}

export const DEFAULT_SETTINGS: Settings = {
  version: '1.0.0',
  ai: {
    provider: 'claude',
    apiKey: '',
    baseUrl: '',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 4096,
  },
  editor: {
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    lineHeight: 1.5,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    autoSave: true,
  },
  agent: {
    enabled: true,
    autoRun: false,
    confirmBeforeAction: true,
    maxIterations: 10,
  },
};

export const AI_PROVIDERS = {
  claude: {
    name: 'Claude (Anthropic)',
    models: [
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and cost-effective' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable' },
    ],
    defaultBaseUrl: 'https://api.anthropic.com',
    requiresApiKey: true,
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    models: [
      { id: 'moonshot-v1-8k', name: 'Kimi 8K', description: '8K context' },
      { id: 'moonshot-v1-32k', name: 'Kimi 32K', description: '32K context' },
      { id: 'moonshot-v1-128k', name: 'Kimi 128K', description: '128K context' },
    ],
    defaultBaseUrl: 'https://api.moonshot.cn',
    requiresApiKey: true,
  },
  ollama: {
    name: 'Ollama (Local)',
    models: [
      { id: 'llama2', name: 'Llama 2', description: 'Meta\'s Llama 2' },
      { id: 'codellama', name: 'Code Llama', description: 'Code-specialized' },
      { id: 'mistral', name: 'Mistral', description: 'Mistral AI' },
      { id: 'mixtral', name: 'Mixtral', description: 'Mixture of Experts' },
    ],
    defaultBaseUrl: 'http://localhost:11434',
    requiresApiKey: false,
  },
  custom: {
    name: 'Custom',
    models: [
      { id: 'custom', name: 'Custom Model', description: 'Your custom model' },
    ],
    defaultBaseUrl: '',
    requiresApiKey: true,
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Legacy GPT-4' },
    ],
    defaultBaseUrl: 'https://api.openai.com',
    requiresApiKey: true,
  },
} as const;

export const THEMES = [
  { id: 'dark', name: 'Dark', icon: 'Moon' },
  { id: 'light', name: 'Light', icon: 'Sun' },
  { id: 'system', name: 'System', icon: 'Monitor' },
] as const;

export const FONT_FAMILIES = [
  { id: 'JetBrains Mono, monospace', name: 'JetBrains Mono' },
  { id: 'Fira Code, monospace', name: 'Fira Code' },
  { id: 'Source Code Pro, monospace', name: 'Source Code Pro' },
  { id: 'Consolas, monospace', name: 'Consolas' },
  { id: 'monospace', name: 'System Monospace' },
] as const;
