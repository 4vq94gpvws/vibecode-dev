import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AgentType, AgentMessage, AIContext } from '../types';
import { CodeSuggestion } from '../types/agents';
import { AGENT_CONFIGS } from '../types/agents';
import { v4 as uuidv4 } from 'uuid';

export type AIProvider = 'claude' | 'kimi';

interface AgentContextType {
  messages: AgentMessage[];
  activeAgents: AgentType[];
  isProcessing: boolean;
  currentStreamingMessage: string | null;
  suggestions: CodeSuggestion[];
  provider: AIProvider;
  setProvider: (p: AIProvider) => void;
  sendMessage: (type: AgentType, prompt: string, context: AIContext) => Promise<void>;
  clearMessages: () => void;
  toggleAgent: (type: AgentType) => void;
  applySuggestion: (suggestion: CodeSuggestion) => void;
  dismissSuggestion: (suggestionId: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

function nl() { return String.fromCharCode(10); }
function triple(lang: string) { return '```' + lang; }
function tripleClose() { return '```'; }

function buildUserPrompt(type: AgentType, prompt: string, context: AIContext): string {
  const code = context.currentFile?.content || '';
  const selectedCode = context.selectedCode || '';
  const language = context.currentFile?.language || 'javascript';
  const fileName = context.currentFile?.name || 'onbekend bestand';

  const header = 'Bestand: ' + fileName + nl() + 'Taal: ' + language + nl();

  switch (type) {
    case 'completion': {
      const cursor = context.cursorPosition;
      const lines = code.split(nl());
      const cursorLine = cursor ? cursor.lineNumber - 1 : lines.length - 1;
      const codeBeforeCursor = lines.slice(0, cursorLine + 1).join(nl());
      return header +
        'Code tot cursor positie:' + nl() +
        triple(language) + nl() +
        codeBeforeCursor + nl() +
        tripleClose() + nl() + nl() +
        'Geef een code completion voor na de cursor.';
    }
    case 'bug': {
      const targetCode = selectedCode || code;
      return header +
        'Analyseer deze code op bugs:' + nl() +
        triple(language) + nl() +
        targetCode + nl() +
        tripleClose();
    }
    case 'refactor': {
      const targetCode = selectedCode || code;
      const label = selectedCode ? 'Refactor deze geselecteerde code:' : 'Geef refactoring suggesties voor dit hele bestand:';
      return header + label + nl() +
        triple(language) + nl() +
        targetCode + nl() +
        tripleClose();
    }
    case 'docs': {
      const targetCode = selectedCode || code;
      return header +
        'Genereer documentatie comments voor:' + nl() +
        triple(language) + nl() +
        targetCode + nl() +
        tripleClose();
    }
    case 'test': {
      const targetCode = selectedCode || code;
      return header +
        'Genereer unit tests voor:' + nl() +
        triple(language) + nl() +
        targetCode + nl() +
        tripleClose();
    }
    default:
      return prompt || 'Analyseer de code en geef suggesties.';
  }
}

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [activeAgents, setActiveAgents] = useState<AgentType[]>(['completion']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [provider, setProvider] = useState<AIProvider>('claude');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (type: AgentType, prompt: string, context: AIContext) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    const messageId = uuidv4();

    const newMessage: AgentMessage = {
      id: messageId,
      agentType: type,
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
      fileId: context.currentFile?.id,
      lineNumber: context.cursorPosition?.lineNumber
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentStreamingMessage('');

    const userPrompt = buildUserPrompt(type, prompt, context);
    const code = context.currentFile?.content || '';
    const language = context.currentFile?.language || 'javascript';

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, agentType: type, code, language, provider }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let errorMsg = 'API fout: ' + response.status;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch { /* geen JSON */ }
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, content: errorMsg, status: 'error' } : m
        ));
        setCurrentStreamingMessage(null);
        setIsProcessing(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Geen response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      const DATA_PREFIX = 'data: ';
      const LF = nl();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(LF);
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith(DATA_PREFIX)) continue;
          const data = line.slice(DATA_PREFIX.length).trim();
          if (!data) continue;

          try {
            const event = JSON.parse(data);

            if (event.error) {
              setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, content: event.error, status: 'error' } : m
              ));
              setCurrentStreamingMessage(null);
              setIsProcessing(false);
              return;
            }

            if (event.text) {
              accumulated += event.text;
              setCurrentStreamingMessage(accumulated);
              setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, content: accumulated } : m
              ));
            }

            if (event.done) {
              setMessages(prev => prev.map(m =>
                m.id === messageId
                  ? { ...m, content: accumulated.trim(), status: 'complete' }
                  : m
              ));
              setCurrentStreamingMessage(null);
              setIsProcessing(false);

              if (type === 'completion' && context.cursorPosition && accumulated.trim()) {
                const newSuggestion: CodeSuggestion = {
                  id: uuidv4(),
                  type: 'insert',
                  range: {
                    startLineNumber: context.cursorPosition.lineNumber,
                    startColumn: context.cursorPosition.column,
                    endLineNumber: context.cursorPosition.lineNumber,
                    endColumn: context.cursorPosition.column
                  },
                  content: accumulated.trim(),
                  description: provider === 'kimi' ? 'Kimi AI completion' : 'Claude AI completion'
                };
                setSuggestions(prev => [...prev, newSuggestion]);
              }
              return;
            }
          } catch { /* skip ongeldige JSON */ }
        }
      }

      if (accumulated.trim()) {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, content: accumulated.trim(), status: 'complete' }
            : m
        ));
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, content: 'Gestopt door gebruiker.', status: 'complete' } : m
        ));
      } else {
        const msg = error instanceof Error ? error.message : 'Onbekende fout';
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, content: 'Fout: ' + msg, status: 'error' } : m
        ));
      }
    } finally {
      setCurrentStreamingMessage(null);
      setIsProcessing(false);
    }
  }, [provider]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  const toggleAgent = useCallback((type: AgentType) => {
    setActiveAgents(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const applySuggestion = useCallback((suggestion: CodeSuggestion) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  return (
    <AgentContext.Provider value={{
      messages,
      activeAgents,
      isProcessing,
      currentStreamingMessage,
      suggestions,
      provider,
      setProvider,
      sendMessage,
      clearMessages,
      toggleAgent,
      applySuggestion,
      dismissSuggestion
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgentContext must be used within AgentProvider');
  return context;
};
