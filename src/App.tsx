import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { Sidebar } from './components/Sidebar';
import { ActivityBar } from './components/ActivityBar';
import { StatusBar } from './components/StatusBar';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { useSettings } from './contexts/SettingsContext';
import { getAIService } from './services/aiService';
import { Message, Conversation } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [activeView, setActiveView] = useState('chat');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { settings, isSettingsOpen, closeSettings, getCurrentProviderConfig } = useSettings();

  // Initialize AI service with current settings
  useEffect(() => {
    const config = getCurrentProviderConfig();
    getAIService({
      ...config,
      temperature: settings.ai.temperature,
      maxTokens: settings.ai.maxTokens,
    });
  }, [settings.ai, getCurrentProviderConfig]);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.ai.model,
      provider: settings.ai.provider,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setActiveView('chat');
  }, [settings.ai.model, settings.ai.provider]);

  // Load initial conversation
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, [conversations.length, createNewConversation]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Update conversation with user message
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              updatedAt: Date.now(),
              title: c.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : c.title,
            }
          : c
      )
    );

    setIsLoading(true);
    setError(null);

    try {
      const config = getCurrentProviderConfig();
      const aiService = getAIService({
        ...config,
        temperature: settings.ai.temperature,
        maxTokens: settings.ai.maxTokens,
      });

      const validation = aiService.validateConfig();
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid AI configuration');
      }

      const currentMessages = [...activeConversation.messages, userMessage];
      const response = await aiService.sendMessage(currentMessages);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        model: response.model,
        provider: response.provider,
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearConversations = () => {
    if (confirm('Are you sure you want to clear all conversations?')) {
      setConversations([]);
      setActiveConversationId(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <ActivityBar activeView={activeView} onViewChange={setActiveView} />
      
      <Sidebar
        activeView={activeView}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSelect={setActiveConversationId}
        onNewConversation={createNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearConversations={handleClearConversations}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col min-w-0">
            {activeView === 'chat' ? (
              <ChatPanel
                conversation={activeConversation}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <Editor file={activeFile} />
            )}
          </div>
        </div>
        <StatusBar />
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}

export default App;
