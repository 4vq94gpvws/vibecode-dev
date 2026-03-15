import { useState, useRef, useEffect } from 'react'
import { Send, X, Sparkles, AtSign, Image, Paperclip } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onClose: () => void
}

export function AIPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const activeFileId = useEditorStore(s => s.activeFileId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setInput('')
    setLoading(true)

    // Auto-resize textarea back
    if (textareaRef.current) textareaRef.current.style.height = '44px'

    // Simulated AI response
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800))
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I can help you with that! Here's what I'd suggest:\n\n\`\`\`typescript\n// Your code here\nconsole.log("Hello from AI");\n\`\`\`\n\nLet me know if you need anything else.`
    }])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = '44px'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  return (
    <div className="w-[380px] flex flex-col bg-[#1e1e1e] border-l border-[#3e3e42] shrink-0">
      {/* Header */}
      <div className="h-[35px] flex items-center justify-between px-3 bg-[#252526] border-b border-[#3e3e42] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#007acc]" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#cccccc]">Chat</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-[#cccccc]">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#007acc] to-[#0e639c] flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-white" />
            </div>
            <p className="text-[#cccccc] text-sm font-medium mb-1">Ask anything</p>
            <p className="text-[#858585] text-xs leading-relaxed">
              Ask about your code, generate new code, or get help with debugging.
            </p>
            <div className="mt-4 space-y-1.5 w-full">
              {['Explain this code', 'Fix the bug', 'Write tests', 'Refactor'].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="w-full text-left text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] px-3 py-2 rounded transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-[#264f78] text-white text-[13px] leading-relaxed px-3 py-2 rounded-lg whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] leading-relaxed text-[#d4d4d4] whitespace-pre-wrap">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#858585] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#858585] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#858585] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-[#3e3e42] shrink-0">
        <div className="bg-[#2d2d30] border border-[#3e3e42] rounded-lg focus-within:border-[#007acc] transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={activeFileId ? 'Ask about this file...' : 'Ask anything...'}
            rows={1}
            className="w-full bg-transparent text-[#cccccc] text-[13px] px-3 pt-2.5 pb-1 resize-none outline-none placeholder-[#5a5a5a]"
            style={{ height: '44px', maxHeight: '120px' }}
          />
          <div className="flex items-center justify-between px-2 pb-1.5">
            <div className="flex items-center gap-0.5">
              <button className="p-1 text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] rounded" title="Mention file">
                <AtSign size={14} />
              </button>
              <button className="p-1 text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] rounded" title="Attach image">
                <Image size={14} />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-1.5 bg-[#007acc] hover:bg-[#1a8ad4] disabled:opacity-30 disabled:hover:bg-[#007acc] rounded text-white transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#5a5a5a] text-center mt-1.5">
          Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
