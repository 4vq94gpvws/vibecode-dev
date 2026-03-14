import { useState, useCallback } from 'react';
import type { AIProvider, AIMessage, AIResponse } from '../types';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    messages: AIMessage[],
    provider: AIProvider = 'claude',
    model?: string,
    streamCallback?: (chunk: string) => void
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      if (streamCallback) {
        const response = await fetch('/api/ollama-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            provider,
            model,
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let fullContent = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split(String.fromCharCode(10));

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  streamCallback(parsed.content);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        return { content: fullContent };
      } else {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            provider,
            model,
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        const data = await response.json();
        return { content: data.content };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { content: '', error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
}