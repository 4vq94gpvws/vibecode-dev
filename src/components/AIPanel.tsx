import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Sparkles, AtSign, Paperclip, Cpu, Zap, Square, Loader2, Check, AlertCircle } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

// ─── Types ───
type Model = 'sonnet' | 'opus' | 'kimi'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: Model
}

interface ToolStatus {
  tool: string
  display: string
  context?: string
  done: boolean
}

// ─── Config ───
const API_URL = 'https://enricosynology.ddns.net/v1/code/stream'

const MODEL_CONFIG: Record<Model, { label: string; color: string; icon: typeof Cpu }> = {
  sonnet: { label: 'Claude Sonnet', color: '#d97706', icon: Cpu },
  opus:   { label: 'Claude Opus',   color: '#dc2626', icon: Cpu },
  kimi:   { label: 'Kimi K2.5',     color: '#7c3aed', icon: Zap },
}

// ─── Helpers ───
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

function buildFileTree(nodes: FileNode[], indent = ''): string {
  let tree = ''
  for (const n of nodes) {
    if (n.type === 'directory') {
      tree += `${indent}${n.name}/\n`
      if (n.children) tree += buildFileTree(n.children, indent + '  ')
    } else {
      tree += `${indent}${n.name}\n`
    }
  }
  return tree
}

interface Props {
  onClose: () => void
}

export function AIPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState<Model>('sonnet')
  const [tools, setTools] = useState<ToolStatus[]>([])
  const [showFilePicker, setShowFilePicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const activeFileId = useEditorStore(s => s.activeFileId)
  const files = useEditorStore(s => s.files)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tools])

  const buildHistory = useCallback(() => {
    return messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content,
    }))
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setError(null)

    // Build context: project tree + active file content
    let prompt = ''
    const fileTree = buildFileTree(files)
    if (fileTree) {
      prompt += `[Project files]\n${fileTree}\n`
    }
    const activeFile = activeFileId ? findFile(files, activeFileId) : null
    if (activeFile && activeFile.content) {
      prompt += `[Open file: ${activeFile.id}]\n\`\`\`${activeFile.language || ''}\n${activeFile.content.slice(0, 3000)}\n\`\`\`\n`
    }
    prompt += text

    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: text, model }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setTools([])
    if (textareaRef.current) textareaRef.current.style.height = '44px'

    // Abort controller for cancellation
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: buildHistory(),
          model,
          conversation_id: conversationId,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''
      let responseText = ''
      let sessionId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)

            switch (event.type) {
              case 'tool_start':
                setTools(prev => [...prev, {
                  tool: event.tool,
                  display: event.display || event.tool,
                  context: event.context,
                  done: false,
                }])
                break

              case 'tool_end':
                setTools(prev => prev.map(t =>
                  t.tool === event.tool && !t.done ? { ...t, done: true } : t
                ))
                break

              case 'response':
                responseText = event.content || event.text || responseText
                break

              case 'done':
                sessionId = event.session_id || sessionId
                break

              case 'error':
                setError(event.message || 'Unknown error')
                break
            }
          } catch { /* skip non-JSON lines */ }
        }
      }

      // Add assistant response
      if (responseText) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          model,
        }])
      }

      if (sessionId) setConversationId(sessionId)

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '*(cancelled)*',
          model,
        }])
      } else {
        setError(err.message || 'Connection failed')
        // Fallback to simulated response
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `*(Offline mode — agent niet bereikbaar)*\n\nIk zou helpen met: "${text}"\n\nControleer of de agent draait op het juiste adres.`,
          model,
        }])
      }
    } finally {
      setLoading(false)
      setTools([])
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
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

  const handleMention = () => setShowFilePicker(p => !p)

  const insertFileMention = (file: FileNode) => {
    setInput(prev => prev + `@${file.name} `)
    setShowFilePicker(false)
    textareaRef.current?.focus()
  }

  const handleAttach = () => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.accept = 'image/*'
    inp.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content: `[Attached: ${file.name}]`
        }])
      }
    }
    inp.click()
  }

  const allFiles = collectFiles(files)
  const cfg = MODEL_CONFIG[model]

  return (
    <div className="w-[380px] flex flex-col bg-[#1e1e1e] border-l border-[#3e3e42] shrink-0">
      {/* Header with model switcher */}
      <div className="h-[35px] flex items-center justify-between px-3 bg-[#252526] border-b border-[#3e3e42] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#007acc]" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#cccccc]">Chat</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Model selector */}
          {(Object.entries(MODEL_CONFIG) as [Model, typeof cfg][]).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setModel(key)}
              title={c.label}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors flex items-center gap-0.5 ${
                model === key
                  ? 'text-white'
                  : 'text-[#858585] hover:text-[#cccccc]'
              }`}
              style={model === key ? { backgroundColor: c.color + '33', color: c.color } : undefined}
            >
              <c.icon size={10} />
              {key === 'kimi' ? 'Kimi' : key === 'opus' ? 'Opus' : 'Sonnet'}
            </button>
          ))}
          <div className="w-px h-4 bg-[#3e3e42] mx-1" />
          <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-[#cccccc]">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-3 py-1.5 bg-[#5a1d1d] text-[#f48771] text-[11px] flex items-center gap-2 shrink-0">
          <AlertCircle size={12} />
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0"><X size={12} /></button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#007acc] to-[#0e639c] flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-white" />
            </div>
            <p className="text-[#cccccc] text-sm font-medium mb-1">Code Assistant</p>
            <p className="text-[#858585] text-xs leading-relaxed mb-1">
              Connected to your agent. Build, deploy, and debug with AI.
            </p>
            <p className="text-[10px] mb-3" style={{ color: cfg.color }}>
              <cfg.icon size={10} className="inline mr-1" />
              {cfg.label} active
            </p>
            <div className="space-y-1.5 w-full">
              {[
                'Build me a landing page',
                'Explain this code',
                'Fix the bug in this file',
                'Deploy to Vercel',
              ].map(q => (
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
          <div className="p-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%]">
                      <div className="bg-[#264f78] text-white text-[13px] leading-relaxed px-3 py-2 rounded-lg whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {msg.model && (
                        <div className="text-[9px] text-right mt-0.5" style={{ color: MODEL_CONFIG[msg.model]?.color || '#858585' }}>
                          {MODEL_CONFIG[msg.model]?.label}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[13px] leading-relaxed text-[#d4d4d4] whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.model && (
                      <div className="text-[9px] mt-0.5" style={{ color: MODEL_CONFIG[msg.model]?.color || '#858585' }}>
                        {MODEL_CONFIG[msg.model]?.label}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Tool progress */}
            {tools.length > 0 && (
              <div className="space-y-1">
                {tools.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-[#858585] bg-[#252526] rounded px-2 py-1">
                    {t.done ? (
                      <Check size={12} className="text-[#4ec9b0] shrink-0" />
                    ) : (
                      <Loader2 size={12} className="animate-spin text-[#007acc] shrink-0" />
                    )}
                    <span className="truncate">{t.display}</span>
                    {t.context && <span className="truncate text-[#5a5a5a]">{t.context}</span>}
                  </div>
                ))}
              </div>
            )}

            {loading && tools.length === 0 && (
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

      {/* File picker */}
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
            placeholder="Ask anything or describe what to build..."
            rows={1}
            disabled={loading}
            className="w-full bg-transparent text-[#cccccc] text-[13px] px-3 pt-2.5 pb-1 resize-none outline-none placeholder-[#5a5a5a] disabled:opacity-50"
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
            {loading ? (
              <button
                onClick={handleStop}
                className="p-1.5 bg-[#5a1d1d] hover:bg-[#7a2d2d] rounded text-[#f48771] transition-colors"
                title="Stop"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-1.5 bg-[#007acc] hover:bg-[#1a8ad4] disabled:opacity-30 disabled:hover:bg-[#007acc] rounded text-white transition-colors"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <cfg.icon size={9} style={{ color: cfg.color }} />
          <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</span>
          <span className="text-[10px] text-[#5a5a5a]">— Enter to send</span>
        </div>
      </div>
    </div>
  )
}
