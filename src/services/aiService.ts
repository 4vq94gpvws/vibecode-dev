import { getSettings, type AIProvider } from './settingsService'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionOptions {
  messages: ChatMessage[]
  onStream?: (chunk: string) => void
  temperature?: number
  maxTokens?: number
}

export interface ChatCompletionResult {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AIService {
  private provider: AIProvider

  constructor() {
    this.provider = getSettings().aiProvider
  }

  refreshProvider() {
    this.provider = getSettings().aiProvider
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    this.refreshProvider()

    if (!this.provider.apiKey && this.provider.provider !== 'kimi') {
      // Return mock response if no API key
      return this.mockResponse(options.messages)
    }

    switch (this.provider.provider) {
      case 'claude':
        return this.callClaude(options)
      case 'openai':
        return this.callOpenAI(options)
      case 'kimi':
        return this.callKimi(options)
      case 'custom':
        return this.callCustom(options)
      default:
        return this.mockResponse(options.messages)
    }
  }

  private async callClaude(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const response = await fetch(`${this.provider.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.provider.model,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        messages: options.messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
        stream: !!options.onStream,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }

    if (options.onStream && response.body) {
      return this.handleStream(response.body, options.onStream)
    }

    const data = await response.json()
    return {
      content: data.content?.[0]?.text || '',
      usage: data.usage,
    }
  }

  private async callOpenAI(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const response = await fetch(`${this.provider.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages: options.messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        stream: !!options.onStream,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
    }

    if (options.onStream && response.body) {
      return this.handleOpenAIStream(response.body, options.onStream)
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
    }
  }

  private async callKimi(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    // Ollama API format
    const response = await fetch(`${this.provider.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages: options.messages,
        stream: !!options.onStream,
        options: {
          temperature: options.temperature ?? 0.7,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    if (options.onStream && response.body) {
      return this.handleOllamaStream(response.body, options.onStream)
    }

    const data = await response.json()
    return {
      content: data.message?.content || '',
    }
  }

  private async callCustom(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    // Generic OpenAI-compatible API
    const response = await fetch(`${this.provider.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.provider.apiKey && { 'Authorization': `Bearer ${this.provider.apiKey}` }),
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages: options.messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        stream: !!options.onStream,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `API error: ${response.status}`)
    }

    if (options.onStream && response.body) {
      return this.handleOpenAIStream(response.body, options.onStream)
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
    }
  }

  private async handleStream(
    body: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResult> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\
')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.delta?.text || parsed.content?.[0]?.text || ''
              if (content) {
                fullContent += content
                onChunk(content)
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return { content: fullContent }
  }

  private async handleOpenAIStream(
    body: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResult> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\
')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                onChunk(content)
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return { content: fullContent }
  }

  private async handleOllamaStream(
    body: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResult> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\
').filter(Boolean)

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            const content = parsed.message?.content || ''
            if (content) {
              fullContent += content
              onChunk(content)
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return { content: fullContent }
  }

  private mockResponse(messages: ChatMessage[]): ChatCompletionResult {
    const lastMessage = messages[messages.length - 1]
    const content = lastMessage?.content || ''
    
    // Simple mock responses based on keywords
    let response = 'This is a mock response. Please configure your API key in settings to use real AI providers.'
    
    if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
      response = 'Hello! I am a mock AI assistant. Configure your API key in the settings to use a real AI provider like Claude, OpenAI, or Ollama.'
    } else if (content.toLowerCase().includes('code') || content.toLowerCase().includes('function')) {
      response = 'I would love to help you with code! Please configure your API key in settings to get real AI-powered code assistance.'
    }

    return { content: response }
  }
}

export const aiService = new AIService()
