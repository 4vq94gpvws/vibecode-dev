import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Cpu } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useAgentContext } from '../contexts/AgentContext';
import type { AIProvider, AIMessage } from '../types';

export const AIPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const { sendMessage, isLoading } = useAI();
  const { selectedProvider, setSelectedProvider } = useAgentContext();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const assistantMessage: AIMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    await sendMessage(
      [...messages, userMessage],
      selectedProvider,
      undefined,
      (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const providers: { id: AIProvider; name: string; icon: React.ReactNode }[] = [
    { id: 'claude', name: 'Claude', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'kimi', name: 'Kimi', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-editor-bg text-gray-300">
      {/* Header with Provider Selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="font-medium">AI Assistant</span>
        </div>
        
        {/* Provider Selector */}
        <div className="flex items-center gap-2 bg-editor-sidebar rounded-lg p-1">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedProvider === provider.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-editor-active text-gray-400'
              }`}
            >
              {provider.icon}
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with {selectedProvider === 'claude' ? 'Claude' : 'Kimi'}</p>
            <p className="text-sm mt-2">Select a provider above to switch between AI models</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-editor-sidebar text-gray-300'
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-editor-sidebar rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-editor-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedProvider === 'claude' ? 'Claude' : 'Kimi'}...`}
            className="flex-1 bg-editor-sidebar border border-editor-border rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Using {selectedProvider === 'claude' ? 'Claude (Anthropic)' : 'Kimi (Ollama Cloud)'}
        </div>
      </div>
    </div>
  );
};