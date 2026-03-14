import { useState, useCallback } from 'react';
import { aiService, sendAIMessage } from '../services/aiService';
import { useSettings } from '../contexts/SettingsContext';
import type { AIProvider, AIMessage, AIResponse, AgentType } from '../types';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings, getApiKey } = useSettings();

  const sendMessage = useCallback(async (
    messages: AIMessage[],
    provider?: AIProvider,
    model?: string,
    streamCallback?: (chunk: string) => void
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine provider - use provided or default from settings
      const selectedProvider = provider || settings.ai.defaultProvider;
      
      // Get API key for the selected provider
      const apiKey = getApiKey(selectedProvider);
      
      // Build API keys object
      const apiKeys: Partial<Record<AIProvider, string>> = {};
      if (apiKey) {
        apiKeys[selectedProvider] = apiKey;
      }

      const response = await sendAIMessage(
        {
          messages,
          provider: selectedProvider,
          model,
          temperature: 0.7,
          max_tokens: 4096,
          stream: !!streamCallback,
        },
        apiKeys,
        streamCallback
      );

      if (response.error) {
        setError(response.error);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { content: '', error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [settings.ai.defaultProvider, getApiKey]);

  const sendAgentMessage = useCallback(async (
    agentType: AgentType,
    messages: AIMessage[],
    streamCallback?: (chunk: string) => void
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const agentSettings = settings.ai.agentSettings[agentType];
      const apiKey = getApiKey(agentSettings.provider);
      
      const apiKeys: Partial<Record<AIProvider, string>> = {};
      if (apiKey) {
        apiKeys[agentSettings.provider] = apiKey;
      }

      const response = await sendAIMessage(
        {
          messages,
          provider: agentSettings.provider,
          model: agentSettings.model,
          temperature: agentSettings.temperature,
          max_tokens: agentSettings.maxTokens,
          stream: !!streamCallback,
          agentType,
        },
        apiKeys,
        streamCallback
      );

      if (response.error) {
        setError(response.error);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { content: '', error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [settings.ai.agentSettings, getApiKey]);

  const testProvider = useCallback(async (provider: AIProvider): Promise<{ success: boolean; message: string }> => {
    const service = new AIService();
    const apiKey = getApiKey(provider);
    if (apiKey) {
      service.setApiKey(provider, apiKey);
    }
    return service.testProvider(provider);
  }, [getApiKey]);

  return {
    sendMessage,
    sendAgentMessage,
    testProvider,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

// Import AIService for testProvider
import { AIService } from '../services/aiService';