import type { AIProvider, AIMessage, AIResponse, AIRequest, AgentType, AgentConfig } from '../types';
import { PROVIDER_CONFIGS, AGENT_CONFIGS } from '../types';

// Provider-specific API implementations
interface ProviderImplementation {
  sendMessage: (
    messages: AIMessage[],
    model: string,
    temperature: number,
    maxTokens: number,
    apiKey: string | null,
    stream?: boolean,
    streamCallback?: (chunk: string) => void
  ) => Promise<AIResponse>;
}

// Claude API implementation
const claudeProvider: ProviderImplementation = {
  async sendMessage(messages, model, temperature, maxTokens, apiKey, stream, streamCallback) {
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: maxTokens,
        temperature,
        stream: stream || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API request failed');
    }

    if (stream && streamCallback) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for stream');
      
      let fullContent = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\
');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta?.text) {
                fullContent += parsed.delta.text;
                streamCallback(parsed.delta.text);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      return { content: fullContent };
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    };
  },
};

// Kimi (Moonshot AI) API implementation
const kimiProvider: ProviderImplementation = {
  async sendMessage(messages, model, temperature, maxTokens, apiKey, stream, streamCallback) {
    if (!apiKey) {
      throw new Error('Kimi API key is required');
    }

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: maxTokens,
        temperature,
        stream: stream || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Kimi API request failed');
    }

    if (stream && streamCallback) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for stream');
      
      let fullContent = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\
');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                streamCallback(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      return { content: fullContent };
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  },
};

// OpenAI API implementation
const openaiProvider: ProviderImplementation = {
  async sendMessage(messages, model, temperature, maxTokens, apiKey, stream, streamCallback) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: maxTokens,
        temperature,
        stream: stream || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    if (stream && streamCallback) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for stream');
      
      let fullContent = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\
');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                streamCallback(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      return { content: fullContent };
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  },
};

// Ollama (Local) API implementation
const ollamaProvider: ProviderImplementation = {
  async sendMessage(messages, model, temperature, maxTokens, apiKey, stream, streamCallback, ollamaUrl = 'http://localhost:11434') {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        options: {
          temperature,
          num_predict: maxTokens,
        },
        stream: stream || false,
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama API request failed. Is Ollama running?');
    }

    if (stream && streamCallback) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for stream');
      
      let fullContent = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\
').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              fullContent += parsed.message.content;
              streamCallback(parsed.message.content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
      
      return { content: fullContent };
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
    };
  },
};

// Provider registry
const providers: Record<AIProvider, ProviderImplementation> = {
  claude: claudeProvider,
  kimi: kimiProvider,
  openai: openaiProvider,
  ollama: ollamaProvider,
};

// Main AI Service
export class AIService {
  private apiKeys: Partial<Record<AIProvider, string>> = {};
  private ollamaUrl: string = 'http://localhost:11434';

  setApiKey(provider: AIProvider, apiKey: string) {
    this.apiKeys[provider] = apiKey;
  }

  setOllamaUrl(url: string) {
    this.ollamaUrl = url;
  }

  async sendMessage(
    request: AIRequest,
    streamCallback?: (chunk: string) => void
  ): Promise<AIResponse> {
    const {
      messages,
      provider = 'claude',
      model,
      temperature = 0.7,
      max_tokens = 4096,
      stream = false,
    } = request;

    const providerImpl = providers[provider];
    if (!providerImpl) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Get default model if not specified
    const selectedModel = model || PROVIDER_CONFIGS[provider].models[0];
    
    // Get API key for provider
    const apiKey = this.apiKeys[provider] || null;

    try {
      const result = await providerImpl.sendMessage(
        messages,
        selectedModel,
        temperature,
        max_tokens,
        apiKey,
        stream,
        streamCallback
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: '', error: message };
    }
  }

  // Send message with agent-specific settings
  async sendAgentMessage(
    agentType: AgentType,
    messages: AIMessage[],
    agentSettings: { provider: AIProvider; model: string; temperature: number; maxTokens: number },
    streamCallback?: (chunk: string) => void
  ): Promise<AIResponse> {
    return this.sendMessage(
      {
        messages,
        provider: agentSettings.provider,
        model: agentSettings.model,
        temperature: agentSettings.temperature,
        max_tokens: agentSettings.maxTokens,
        stream: !!streamCallback,
      },
      streamCallback
    );
  }

  // Test if a provider is available
  async testProvider(provider: AIProvider): Promise<{ success: boolean; message: string }> {
    try {
      if (provider === 'ollama') {
        const response = await fetch(`${this.ollamaUrl}/api/tags`);
        if (response.ok) {
          return { success: true, message: 'Ollama is running' };
        }
        return { success: false, message: 'Ollama is not running' };
      }

      const apiKey = this.apiKeys[provider];
      if (!apiKey) {
        return { success: false, message: `No API key configured for ${provider}` };
      }

      // Try a simple request
      const result = await this.sendMessage({
        messages: [{ role: 'user', content: 'Hi' }],
        provider,
        max_tokens: 10,
      });

      if (result.error) {
        return { success: false, message: result.error };
      }

      return { success: true, message: `${PROVIDER_CONFIGS[provider].name} is working` };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message };
    }
  }
}

// Singleton instance
export const aiService = new AIService();

// Hook-compatible function for sending messages
export async function sendAIMessage(
  request: AIRequest,
  apiKeys: Partial<Record<AIProvider, string>>,
  streamCallback?: (chunk: string) => void
): Promise<AIResponse> {
  const service = new AIService();
  
  // Set all API keys
  Object.entries(apiKeys).forEach(([provider, key]) => {
    if (key) {
      service.setApiKey(provider as AIProvider, key);
    }
  });

  return service.sendMessage(request, streamCallback);
}