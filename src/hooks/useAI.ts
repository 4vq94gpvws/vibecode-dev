import { useState, useCallback } from 'react'

interface AIState {
  isLoading: boolean
  error: string | null
}

interface CompletionRequest {
  code: string
  language: string
  cursorPosition: number
  context?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAI() {
  const [state, setState] = useState<AIState>({
    isLoading: false,
    error: null,
  })

  const complete = useCallback(async (request: CompletionRequest): Promise<string> => {
    setState({ isLoading: true, error: null })
    
    try {
      // For now, return a mock completion
      // In production, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const suggestions: Record<string, string[]> = {
        javascript: ['console.log(', 'function ', 'const ', 'let ', 'import '],
        typescript: ['interface ', 'type ', 'const ', 'let ', 'import '],
        python: ['def ', 'class ', 'import ', 'print(', 'return '],
        html: ['<div>', '<span>', '<p>', '<button>', '<input'],
        css: ['display: ', 'color: ', 'margin: ', 'padding: ', 'flex'],
      }
      
      const langSuggestions = suggestions[request.language] || suggestions.javascript
      const random = langSuggestions[Math.floor(Math.random() * langSuggestions.length)]
      
      setState({ isLoading: false, error: null })
      return random
    } catch (err) {
      setState({ isLoading: false, error: err instanceof Error ? err.message : 'Unknown error' })
      return ''
    }
  }, [])

  const chat = useCallback(async (messages: ChatMessage[]): Promise<string> => {
    setState({ isLoading: true, error: null })
    
    try {
      // Mock chat response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const responses = [
        'I can help you with that! Let me analyze your code.',
        'Here\'s a suggestion for improving your code structure.',
        'You might want to consider using a different approach here.',
        'This looks good! Here are some optimizations you could make.',
        'I notice a potential issue. Let me explain...',
      ]
      
      const response = responses[Math.floor(Math.random() * responses.length)]
      
      setState({ isLoading: false, error: null })
      return response
    } catch (err) {
      setState({ isLoading: false, error: err instanceof Error ? err.message : 'Unknown error' })
      return ''
    }
  }, [])

  return {
    ...state,
    complete,
    chat,
  }
}