export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
  parentId?: string | null;
}

export interface Tab {
  id: string;
  fileId: string;
  name: string;
  isDirty: boolean;
  cursorPosition?: { lineNumber: number; column: number };
}

export interface TerminalMessage {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp: number;
}

export type AgentType = 'completion' | 'bug' | 'refactor' | 'docs' | 'test';

export interface AgentMessage {
  id: string;
  agentType: AgentType;
  content: string;
  timestamp: number;
  status: 'pending' | 'streaming' | 'complete' | 'error';
  fileId?: string;
  lineNumber?: number;
}

export interface AIContext {
  currentFile?: FileNode;
  cursorPosition?: { lineNumber: number; column: number };
  projectFiles: FileNode[];
  selectedCode?: string;
}
