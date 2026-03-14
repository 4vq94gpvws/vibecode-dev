import { Message, AIProvider, AIConfig } from '../types';

interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface StreamChunk {
  content: string;
  done: boolean;
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  updateConfig(config: AIConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (this.config.provider) {
      case 'claude':
        headers['x-api-key'] = this.config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'openai':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      case 'kimi':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      case 'custom':
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        break;
      case 'ollama':
        // Ollama doesn't require auth by default
        break;
    }

    return headers;

  }

  private getEndpoint(): string {
    const baseUrl = this.config.baseUrl || this.getDefaultBaseUrl();
    
    switch (this.config.provider) {
      case 'claude':
        return `${baseUrl}/v1/messages`;
      case 'openai':
        return `${baseUrl}/v1/chat/completions`;
      case 'kimi':
        return `${baseUrl}/v1/chat/completions`;
      case 'ollama':
        return `${baseUrl}/api/chat`;
      case 'custom':
        return `${baseUrl}/v1/chat/completions`;
      default:
        return `${baseUrl}/v1/chat/completions`;
    }
  }

  private getDefaultBaseUrl(): string {
    switch (this.config.provider) {
      case 'claude':
        return 'https://api.anthropic.com';
      case 'openai':
        return 'https://api.openai.com';
      case 'kimi':
        return 'https://api.moonshot.cn';
      case 'ollama':
        return 'http://localhost:11434';
      case 'custom':
        return '';
      default:
        return '';
    }
  }

  private formatMessages(messages: Message[]): any[] {
    switch (this.config.provider) {
      case 'claude':
        return messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));
      case 'openai':
      case 'kimi':
      case 'custom':
      case 'ollama':
      default:
        return messages.map(m => ({
          role: m.role,
          content: m.content,
        }));
    }
  }

  private buildRequestBody(messages: Message[], stream: boolean = false): any {
    const formattedMessages = this.formatMessages(messages);
    
    switch (this.config.provider) {
      case 'claude':
        return {
          model: this.config.model,
          messages: formattedMessages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream,
        };
      case 'openai':
      case 'kimi':
      case 'custom':
        return {
          model: this.config.model,
          messages: formattedMessages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream,
        };
      case 'ollama':
        return {
          model: this.config.model,
          messages: formattedMessages,
          stream,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          },
        };
      default:
        return {
          model: this.config.model,
          messages: formattedMessages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream,
        };
    }
  }

  private parseResponse(response: any): AIResponse {
    switch (this.config.provider) {
      case 'claude':
        return {
          content: response.content?.[0]?.text || '',
          model: response.model || this.config.model,
          provider: this.config.provider,
          usage: response.usage,
        };
      case 'openai':
      case 'kimi':
      case 'custom':
        return {
          content: response.choices?.[0]?.message?.content || '',
          model: response.model || this.config.model,
          provider: this.config.provider,
          usage: response.usage,
        };
      case 'ollama':
        return {
          content: response.message?.content || '',
          model: response.model || this.config.model,
          provider: this.config.provider,
        };
      default:
        return {
          content: response.choices?.[0]?.message?.content || '',
          model: response.model || this.config.model,
          provider: this.config.provider,
        };
    }
  }

  async sendMessage(messages: Message[]): Promise<AIResponse> {
    // Validate config
    if (!this.config.model) {
      throw new Error('No model selected');
    }

    if (this.config.provider !== 'ollama' && !this.config.apiKey) {
      throw new Error(`API key required for ${this.config.provider}`);
    }

    const endpoint = this.getEndpoint();
    const headers = this.getHeaders();
    const body = this.buildRequestBody(messages, false);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async *streamMessage(messages: Message[]): AsyncGenerator<StreamChunk> {
    // Validate config
    if (!this.config.model) {
      throw new Error('No model selected');
    }

    if (this.config.provider !== 'ollama' && !this.config.apiKey) {
      throw new Error(`API key required for ${this.config.provider}`);
    }

    const endpoint = this.getEndpoint();
    const headers = this.getHeaders();
    const body = this.buildRequestBody(messages, true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('
');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = this.extractStreamContent(data);
              if (content) {
                yield { content, done: false };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          } else if (this.config.provider === 'ollama') {
            // Ollama doesn't use SSE format
            try {
              const data = JSON.parse(trimmed);
              const content = data.message?.content || '';
              if (content) {
                yield { content, done: data.done || false };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      yield { content: '', done: true };
    } catch (error) {
      console.error('AI Stream Error:', error);
      throw error;
    }
  }

  private extractStreamContent(data: any): string {
    switch (this.config.provider) {
      case 'claude':
        return data.delta?.text || '';
      case 'openai':
      case 'kimi':
      case 'custom':
        return data.choices?.[0]?.delta?.content || '';
      case 'ollama':
        return data.message?.content || '';
      default:
        return data.choices?.[0]?.delta?.content || '';
    }
  }

  validateConfig(): { valid: boolean; error?: string } {
    if (!this.config.model) {
      return { valid: false, error: 'No model selected' };
    }

    if (this.config.provider !== 'ollama' && !this.config.apiKey) {
      return { valid: false, error: `API key required for ${this.config.provider}` };
    }

    return { valid: true };
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(config?: AIConfig): AIService {
  if (!aiServiceInstance && config) {
    aiServiceInstance = new AIService(config);
  } else if (aiServiceInstance && config) {
    aiServiceInstance.updateConfig(config);
  }
  return aiServiceInstance!;
}

export function createAIService(config: AIConfig): AIService {
  aiServiceInstance = new AIService(config);
  return aiServiceInstance;
}
