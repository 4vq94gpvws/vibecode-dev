import type { AIProvider } from '../services/settingsService'

interface VerifyResult {
  success: boolean
  error?: string
}

export async function verifyAPIKey(provider: AIProvider): Promise<VerifyResult> {
  if (!provider.apiKey) {
    return { success: false, error: 'API key is required' }
  }

  try {
    switch (provider.provider) {
      case 'claude':
        return await verifyClaude(provider)
      case 'openai':
        return await verifyOpenAI(provider)
      case 'kimi':
        return await verifyKimi(provider)
      case 'custom':
        return await verifyCustom(provider)
      default:
        return { success: false, error: 'Unknown provider' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

async function verifyClaude(provider: AIProvider): Promise<VerifyResult> {
  const response = await fetch(`${provider.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  })

  if (response.status === 401) {
    return { success: false, error: 'Invalid API key' }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { success: false, error: data.error?.message || `HTTP ${response.status}` }
  }

  return { success: true }
}

async function verifyOpenAI(provider: AIProvider): Promise<VerifyResult> {
  const response = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 1,
    }),
  })

  if (response.status === 401) {
    return { success: false, error: 'Invalid API key' }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { success: false, error: data.error?.message || `HTTP ${response.status}` }
  }

  return { success: true }
}

async function verifyKimi(provider: AIProvider): Promise<VerifyResult> {
  // Ollama doesn't require an API key, just check if the server is reachable
  const response = await fetch(`${provider.baseUrl}/api/tags`, {
    method: 'GET',
  }).catch(() => null)

  if (!response) {
    return { success: false, error: 'Cannot connect to Ollama server' }
  }

  if (!response.ok) {
    return { success: false, error: 'Ollama server returned an error' }
  }

  return { success: true }
}

async function verifyCustom(provider: AIProvider): Promise<VerifyResult> {
  // For custom providers, try a simple GET to the base URL
  const response = await fetch(provider.baseUrl, {
    method: 'GET',
    headers: provider.apiKey ? { 'Authorization': `Bearer ${provider.apiKey}` } : {},
  }).catch(() => null)

  if (!response) {
    return { success: false, error: 'Cannot connect to custom endpoint' }
  }

  return { success: true }
}
