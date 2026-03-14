import { AgentType, AgentMessage, AIContext } from './index';

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  shortcut?: string;
}

export const AGENT_CONFIGS: AgentConfig[] = [
  {
    type: 'completion',
    name: 'Code Completion',
    description: 'Real-time code suggestions',
    icon: 'Sparkles',
    color: '#3b82f6',
    shortcut: 'Ctrl+Space'
  },
  {
    type: 'bug',
    name: 'Bug Detection',
    description: 'Find and fix code issues',
    icon: 'Bug',
    color: '#ef4444',
    shortcut: 'Ctrl+Shift+B'
  },
  {
    type: 'refactor',
    name: 'Refactoring',
    description: 'Improve code structure',
    icon: 'Wand2',
    color: '#8b5cf6',
    shortcut: 'Ctrl+Shift+R'
  },
  {
    type: 'docs',
    name: 'Documentation',
    description: 'Generate JSDoc comments',
    icon: 'FileText',
    color: '#10b981',
    shortcut: 'Ctrl+Shift+D'
  },
  {
    type: 'test',
    name: 'Test Generation',
    description: 'Create unit tests',
    icon: 'TestTube',
    color: '#f59e0b',
    shortcut: 'Ctrl+Shift+T'
  }
];

export interface AgentRequest {
  type: AgentType;
  context: AIContext;
  prompt: string;
}

export interface AgentResponse {
  message: AgentMessage;
  suggestions?: CodeSuggestion[];
}

export interface CodeSuggestion {
  id: string;
  type: 'insert' | 'replace' | 'delete';
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  content: string;
  description?: string;
}

export interface StreamingUpdate {
  messageId: string;
  chunk: string;
  isComplete: boolean;
}
