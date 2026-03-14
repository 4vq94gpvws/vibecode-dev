import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Agent, AgentTask, AIProvider } from '../types';

interface AgentContextType {
  agents: Agent[];
  tasks: AgentTask[];
  selectedProvider: AIProvider;
  setSelectedProvider: (provider: AIProvider) => void;
  runAgent: (agentId: string, prompt: string, provider?: AIProvider) => Promise<void>;
  getAgentStatus: (agentId: string) => Agent['status'];
  getAgentTasks: (agentId: string) => AgentTask[];
}

const defaultAgents: Agent[] = [
  {
    id: 'code-writer',
    name: 'Code Writer',
    description: 'Writes code based on specifications',
    icon: 'FileCode',
    status: 'idle',
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Reviews code for quality and bugs',
    icon: 'Search',
    status: 'idle',
  },
  {
    id: 'test-generator',
    name: 'Test Generator',
    description: 'Generates unit tests for your code',
    icon: 'Beaker',
    status: 'idle',
  },
  {
    id: 'doc-writer',
    name: 'Doc Writer',
    description: 'Writes documentation for your code',
    icon: 'BookOpen',
    status: 'idle',
  },
  {
    id: 'refactor-agent',
    name: 'Refactor Agent',
    description: 'Refactors code for better structure',
    icon: 'RefreshCw',
    status: 'idle',
  },
];

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('claude');

  const runAgent = useCallback(async (agentId: string, prompt: string, provider?: AIProvider) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const taskId = `${agentId}-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      agentId,
      prompt,
      status: 'running',
      provider: provider || selectedProvider,
    };

    setTasks(prev => [...prev, task]);
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: 'running' } : a
    ));

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: getAgentSystemPrompt(agentId) },
            { role: 'user', content: prompt },
          ],
          provider: provider || selectedProvider,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run agent');
      }

      const data = await response.json();
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed', result: data.content } : t
      ));
      setAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, status: 'completed' } : a
      ));
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'error', error: String(error) } : t
      ));
      setAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, status: 'error' } : a
      ));
    }
  }, [agents, selectedProvider]);

  const getAgentStatus = useCallback((agentId: string) => {
    return agents.find(a => a.id === agentId)?.status || 'idle';
  }, [agents]);

  const getAgentTasks = useCallback((agentId: string) => {
    return tasks.filter(t => t.agentId === agentId);
  }, [tasks]);

  return (
    <AgentContext.Provider value={{
      agents,
      tasks,
      selectedProvider,
      setSelectedProvider,
      runAgent,
      getAgentStatus,
      getAgentTasks,
    }}>
      {children}
    </AgentContext.Provider>
  );
};

function getAgentSystemPrompt(agentId: string): string {
  const prompts: Record<string, string> = {
    'code-writer': 'You are an expert code writer. Write clean, well-documented code based on the user\'s requirements. Follow best practices and modern conventions.',
    'code-reviewer': 'You are a senior code reviewer. Analyze the code for bugs, security issues, performance problems, and style violations. Provide constructive feedback.',
    'test-generator': 'You are a test automation expert. Generate comprehensive unit tests that cover edge cases and follow testing best practices.',
    'doc-writer': 'You are a technical writer. Write clear, concise documentation that explains the code\'s purpose, usage, and implementation details.',
    'refactor-agent': 'You are a refactoring specialist. Improve code structure, readability, and maintainability while preserving functionality.',
  };
  return prompts[agentId] || 'You are a helpful AI assistant.';
}

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgentContext must be used within AgentProvider');
  return context;
};