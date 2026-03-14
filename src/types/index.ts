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

export type AIProvider = 'claude' | 'kimi';

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
}

export interface AIResponse {
  content: string;
  error?: string;
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