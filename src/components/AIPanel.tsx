import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function AIPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: 'Hi! I\'m your AI coding assistant. Ask me anything about your code or ask me to write something.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    await new Promise(r => setTimeout(r, 800))
    const reply: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `You asked: "${text}"\n\nThis is a demo response. Connect a real AI backend for full code assistance.`
    }
    setMessages(prev => [...prev, reply])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#252526] border-b border-[#3c3c3c] flex-shrink-0">
        <Sparkles size={14} className="text-[#007acc]" />
        <span className="text-[#cccccc] text-xs font-semibold uppercase tracking-wider">AI Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'assistant' ? 'bg-[#007acc]' : 'bg-[#505050]'
            }`}>
              {msg.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
            </div>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'assistant' ? 'bg-[#2d2d2d] text-[#d4d4d4]' : 'bg-[#264f78] text-white'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#007acc] flex items-center justify-center flex-shrink-0">
              <Bot size={12} />
            </div>
            <div className="bg-[#2d2d2d] rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#858585] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#858585] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#858585] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 p-2 border-t border-[#3c3c3c] bg-[#252526]">
        <div className="flex gap-1">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask a question..."
            rows={2}
            className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-xs px-2 py-1.5 rounded resize-none outline-none placeholder-[#555] focus:ring-1 focus:ring-[#007acc]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 bg-[#007acc] hover:bg-[#1a8cdb] disabled:opacity-40 rounded flex items-center justify-center transition-colors"
          >
            <Send size={12} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
