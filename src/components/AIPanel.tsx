import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useAI } from '../hooks/useAI'

export function AIPanel() {
  const [input, setInput] = useState('')
  const { aiMessages, addAIMessage, clearAIMessages } = useEditorStore()
  const { chat, isLoading } = useAI()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [aiMessages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    
    addAIMessage({ role: 'user', content: userMessage })
    
    const response = await chat([
      ...aiMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ])
    
    if (response) {
      addAIMessage({ role: 'assistant', content: response })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    'Explain this code',
    'Refactor this function',
    'Add error handling',
    'Write tests for this',
    'Optimize performance',
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-editor-accent" />
          <span className="text-sm font-medium text-editor-text">AI Assistant</span>
        </div>
        <button
          onClick={clearAIMessages}
          className="p-1 hover:bg-editor-hover rounded text-editor-muted hover:text-editor-text"
          title="Clear chat"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {aiMessages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles size={32} className="mx-auto mb-4 text-editor-accent opacity-50" />
            <p className="text-sm text-editor-muted mb-4">
              Ask me anything about your code!
            </p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm text-editor-text hover:bg-editor-hover rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          aiMessages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-editor-accent' 
                  : 'bg-purple-600'
              }`}>
                {message.role === 'user' ? (
                  <User size={14} className="text-white" />
                ) : (
                  <Bot size={14} className="text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-editor-accent text-white'
                    : 'bg-editor-active text-editor-text'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-3 py-2 rounded-lg bg-editor-active">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-editor-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-editor-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-editor-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-editor-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI..."
            className="flex-1 bg-editor-bg text-editor-text text-sm p-2 rounded border border-editor-border outline-none focus:border-editor-accent resize-none h-10 min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-editor-accent text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-xs text-editor-muted text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}