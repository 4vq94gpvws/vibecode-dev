import { useState, useRef, useEffect } from 'react'
import { Send, X, Sparkles, AtSign, Paperclip } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function findFile(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) { const f = findFile(n.children, id); if (f) return f }
  }
  return null
}

function collectFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const n of nodes) {
    if (n.type === 'file') result.push(n)
    if (n.children) result.push(...collectFiles(n.children))
  }
  return result
}

interface Props {
  onClose: () => void
}

export function AIPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const activeFileId = useEditorStore(s => s.activeFileId)
  const files = useEditorStore(s => s.files)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    // If an active file exists, include context
    let contextPrefix = ''
    if (activeFileId) {
      const file = findFile(files, activeFileId)
      if (file) {
        contextPrefix = `[Context: ${file.name}]\n`
      }
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = '44px'

    await new Promise(r => setTimeout(r, 600 + Math.random() * 800))

    // Generate contextual response
    const activeFile = activeFileId ? findFile(files, activeFileId) : null
    let response = ''
    const lowerText = text.toLowerCase()

    if (lowerText.includes('explain')) {
      response = activeFile
        ? `Looking at **${activeFile.name}**, here's what this code does:\n\nThis file contains ${activeFile.language || 'code'} that handles core functionality. The main logic processes data and returns formatted results.\n\nWant me to break down any specific part?`
        : `I'd be happy to explain! Could you open a file first so I can see the code you're referring to?`
    } else if (lowerText.includes('fix') || lowerText.includes('bug')) {
      response = activeFile
        ? `I've analyzed **${activeFile.name}** and found a few potential issues:\n\n1. Consider adding null checks for edge cases\n2. The error handling could be more specific\n\n\`\`\`${activeFile.language || 'typescript'}\ntry {\n  // Your improved code\n} catch (error) {\n  console.error('Specific error:', error);\n}\n\`\`\`\n\nShall I apply these fixes?`
        : `I can help fix bugs! Open the file with the issue and I'll take a look.`
    } else if (lowerText.includes('test')) {
      response = activeFile
        ? `Here are tests for **${activeFile.name}**:\n\n\`\`\`${activeFile.language || 'typescript'}\nimport { describe, it, expect } from 'vitest';\n\ndescribe('${activeFile.name.replace(/\.[^.]+$/, '')}', () => {\n  it('should handle basic case', () => {\n    expect(true).toBe(true);\n  });\n\n  it('should handle edge cases', () => {\n    expect(() => {}).not.toThrow();\n  });\n});\n\`\`\`\n\nWant me to add more test cases?`
        : `I can generate tests! Open the file you want to test first.`
    } else if (lowerText.includes('refactor')) {
      response = activeFile
        ? `Here's a refactored version of **${activeFile.name}**:\n\n- Extract repeated logic into helper functions\n- Use more descriptive variable names\n- Apply single responsibility principle\n\nWant me to show the specific changes?`
        : `I can help refactor! Open the file you'd like to improve.`
    } else {
      response = `I can help with that! ${activeFile ? `I'm looking at **${activeFile.name}**. ` : ''}Here's what I'd suggest:\n\n\`\`\`typescript\n// Generated code\nconsole.log("Hello from AI assistant");\n\`\`\`\n\nLet me know if you need anything else.`
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
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

  const handleMention = () => {
    setShowFilePicker(p => !p)
  }

  const insertFileMention = (file: FileNode) => {
    setInput(prev => prev + `@${file.name} `)
    setShowFilePicker(false)
    textareaRef.current?.focus()
  }

  const handleAttach = () => {
    // Create a temporary file input for image upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content: `[Attached image: ${file.name}]`
        }])
      }
    }
    input.click()
  }

  const allFiles = collectFiles(files)

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
              {['Explain this code', 'Fix the bug', 'Write tests', 'Refactor this file'].map(q => (
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

      {/* File picker dropdown */}
      {showFilePicker && allFiles.length > 0 && (
        <div className="mx-2 mb-1 bg-[#2d2d30] border border-[#3e3e42] rounded-lg max-h-[150px] overflow-y-auto">
          {allFiles.map(f => (
            <button
              key={f.id}
              onClick={() => insertFileMention(f)}
              className="w-full text-left px-3 py-1.5 text-[12px] text-[#cccccc] hover:bg-[#37373d] transition-colors"
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

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
              <button
                onClick={handleMention}
                className={`p-1 hover:bg-[#3c3c3c] rounded transition-colors ${showFilePicker ? 'text-[#007acc]' : 'text-[#858585] hover:text-[#cccccc]'}`}
                title="Mention file (@)"
              >
                <AtSign size={14} />
              </button>
              <button
                onClick={handleAttach}
                className="p-1 text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] rounded transition-colors"
                title="Attach image"
              >
                <Paperclip size={14} />
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
