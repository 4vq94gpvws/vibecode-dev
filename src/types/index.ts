export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  isOpen?: boolean;
  parentId?: string;
  children?: FileNode[];
}

export interface Tab {
  id: string;
  fileId: string;
  name: string;
  isDirty: boolean;
  cursorPosition?: { lineNumber: number; column: number };
}

// AI Provider Types
export type AIProvider = 'claude' | 'kimi' | 'openai' | 'ollama';

export interface ProviderConfig {
  name: string;
  description: string;
  models: string[];
  requiresApiKey: boolean;
  baseUrl?: string;
}

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  claude: {
    name: 'Claude (Anthropic)',
    description: 'Anthropic\'s Claude AI models',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    requiresApiKey: true,
    baseUrl: 'https://api.anthropic.com',
  },
  kimi: {
    name: 'Kimi (Moonshot AI)',
    description: 'Moonshot AI\'s Kimi models',
    models: ['kimi-k1', 'kimi-k2', 'kimi-k1.5', 'kimi-moonshot-v1'],
    requiresApiKey: true,
    baseUrl: 'https://api.moonshot.cn',
  },
  openai: {
    name: 'OpenAI',
    description: 'OpenAI GPT models',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    baseUrl: 'https://api.openai.com',
  },
  ollama: {
    name: 'Ollama (Local)',
    description: 'Run models locally with Ollama',
    models: ['llama3.2', 'codellama', 'mistral', 'mixtral'],
    requiresApiKey: false,
    baseUrl: 'http://localhost:11434',
  },
};

// Agent Types
export type AgentType = 'completion' | 'bug-detection' | 'refactoring' | 'docs' | 'tests';

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  completion: {
    id: 'completion',
    name: 'Code Completion',
    description: 'AI-powered code completion and suggestions',
    icon: 'wand-2',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultTemperature: 0.3,
    defaultMaxTokens: 2048,
  },
  'bug-detection': {
    id: 'bug-detection',
    name: 'Bug Detection',
    description: 'Detect bugs and potential issues in code',
    icon: 'bug',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultTemperature: 0.2,
    defaultMaxTokens: 4096,
  },
  refactoring: {
    id: 'refactoring',
    name: 'Refactoring',
    description: 'Suggest code improvements and refactoring',
    icon: 'refresh-cw',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultTemperature: 0.4,
    defaultMaxTokens: 4096,
  },
  docs: {
    id: 'docs',
    name: 'Documentation',
    description: 'Generate documentation and comments',
    icon: 'file-text',
    defaultModel: 'claude-3-haiku-20240307',
    defaultTemperature: 0.5,
    defaultMaxTokens: 2048,
  },
  tests: {
    id: 'tests',
    name: 'Test Generation',
    description: 'Generate unit tests and test cases',
    icon: 'check-circle',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultTemperature: 0.3,
    defaultMaxTokens: 4096,
  },
};

// Settings Types
export interface AISettings {
  // Global settings
  defaultProvider: AIProvider;
  useCloudApi: boolean;
  
  // Provider API Keys (encrypted)
  apiKeys: Partial<Record<AIProvider, string>>;
  
  // Ollama settings
  ollamaUrl: string;
  
  // Per-agent settings
  agentSettings: Record<AgentType, {
    provider: AIProvider;
    model: string;
    temperature: number;
    maxTokens: number;
  }>;
}

export interface EditorSettings {
  theme: 'dark' | 'light' | 'high-contrast';
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  tabSize: number;
  insertSpaces: boolean;
}

export interface AppSettings {
  ai: AISettings;
  editor: EditorSettings;
  version: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  agentType?: AgentType;
}

export interface AIResponse {
  content: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  provider?: AIProvider;
}

export interface AgentTask {
  id: string;
  agentId: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  error?: string;
  provider?: AIProvider;
}