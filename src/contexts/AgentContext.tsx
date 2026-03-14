import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AgentType, AgentMessage, AIContext, FileNode } from '../types';
import { AgentRequest, AgentResponse, CodeSuggestion, StreamingUpdate } from '../types/agents';
import { AGENT_CONFIGS } from '../types/agents';
import { v4 as uuidv4 } from 'uuid';

interface AgentContextType {
  messages: AgentMessage[];
  activeAgents: AgentType[];
  isProcessing: boolean;
  currentStreamingMessage: string | null;
  suggestions: CodeSuggestion[];
  sendMessage: (type: AgentType, prompt: string, context: AIContext) => Promise<void>;
  clearMessages: () => void;
  toggleAgent: (type: AgentType) => void;
  applySuggestion: (suggestion: CodeSuggestion) => void;
  dismissSuggestion: (suggestionId: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [activeAgents, setActiveAgents] = useState<AgentType[]>(['completion']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateMockResponse = (type: AgentType, prompt: string, context: AIContext): string => {
    const code = context.currentFile?.content || '';
    const language = context.currentFile?.language || 'javascript';
    
    switch (type) {
      case 'completion':
        return generateCompletion(code, context.cursorPosition, language);
      case 'bug':
        return analyzeBugs(code, language);
      case 'refactor':
        return suggestRefactoring(code, context.selectedCode, language);
      case 'docs':
        return generateDocs(code, context.selectedCode, language);
      case 'test':
        return generateTests(code, context.selectedCode, language);
      default:
        return 'Unknown agent type';
    }
  };

  const generateCompletion = (code: string, cursor: any, language: string): string => {
    const completions: Record<string, string[]> = {
      javascript: ['const result = await fetch(url);', 'console.log("Debug:", value);', 'return data.map(item => item.id);'],
      typescript: ['const result: Promise<Response> = await fetch(url);', 'interface Props { children: React.ReactNode }', 'const [state, setState] = useState<T>(initialValue);'],
      python: ['def function_name(self, param: str) -> None:', 'result = [item for item in items if item.active]', 'try:\
    pass\
except Exception as e:']
    };
    const langCompletions = completions[language] || completions.javascript;
    return langCompletions[Math.floor(Math.random() * langCompletions.length)];
  };

  const analyzeBugs = (code: string, language: string): string => {
    const issues = [];
    if (code.includes('var ')) issues.push('⚠️ Use "const" or "let" instead of "var"');
    if (code.includes('==') && !code.includes('===')) issues.push('⚠️ Use strict equality "===" instead of "=="');
    if (code.includes('console.log')) issues.push('ℹ️ Remove console.log statements before production');
    if (code.includes('any')) issues.push('⚠️ Avoid using "any" type in TypeScript');
    return issues.length > 0 ? issues.join('\
') : '✅ No obvious bugs detected!';
  };

  const suggestRefactoring = (code: string, selected: string | undefined, language: string): string => {
    if (!selected) return 'Select code to refactor';
    return `Suggested refactoring for selected code:\
\
1. Extract into a separate function\
2. Use destructuring for cleaner syntax\
3. Add type annotations for better safety\
\
Refactored version would improve readability and maintainability.`;
  };

  const generateDocs = (code: string, selected: string | undefined, language: string): string => {
    if (language === 'javascript' || language === 'typescript') {
      return `/**\
 * Description of the function\
 * @param {string} paramName - Parameter description\
 * @returns {void} Return description\
 * @example\
 * functionName('value');\
 */`;
    }
    return '"""\
Function documentation\
"""';
  };

  const generateTests = (code: string, selected: string | undefined, language: string): string => {
    const funcName = selected?.match(/function\\s+(\\w+)/)?.[1] || 'functionName';
    return `describe('${funcName}', () => {\
  it('should work correctly', () => {\
    const result = ${funcName}();\
    expect(result).toBeDefined();\
  });\
\
  it('should handle edge cases', () => {\
    // Add edge case tests\
  });\
});`;
  };

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

    // Simulate streaming response
    const response = generateMockResponse(type, prompt, context);
    const chunks = response.split(' ');
    let accumulated = '';
    
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      accumulated += chunks[i] + ' ';
      setCurrentStreamingMessage(accumulated);
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, content: accumulated } : m
      ));
    }
    
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, content: accumulated.trim(), status: 'complete' } : m
    ));
    setCurrentStreamingMessage(null);
    setIsProcessing(false);
    
    // Generate suggestions based on agent type
    if (type === 'completion' && context.cursorPosition) {
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
        description: 'AI completion'
      };
      setSuggestions(prev => [...prev, newSuggestion]);
    }
  }, []);

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