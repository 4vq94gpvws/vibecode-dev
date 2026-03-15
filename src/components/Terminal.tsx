import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react'

interface Line {
  id: number
  type: 'command' | 'output' | 'error' | 'info'
  text: string
}

interface Props {
  onClose: () => void
}

export function Terminal({ onClose }: Props) {
  const [lines, setLines] = useState<Line[]>([
    { id: 0, type: 'info', text: 'Welcome to vibecode.dev terminal' },
    { id: 1, type: 'info', text: 'Type "help" for available commands.' },
  ])
  const [input, setInput] = useState('')
  const [nextId, setNextId] = useState(2)
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [cwd, setCwd] = useState('/project')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [lines])

  const addLine = useCallback((type: Line['type'], text: string) => {
    setNextId(prev => {
      setLines(l => [...l, { id: prev, type, text }])
      return prev + 1
    })
  }, [])

  const exec = useCallback((cmd: string) => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0]?.toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case 'help':
        return { lines: [
          'ls        List files',
          'cd        Change directory',
          'pwd       Working directory',
          'cat       Show file contents',
          'npm       Package manager',
          'git       Version control',
          'clear     Clear terminal',
          'echo      Print text',
        ], type: 'info' as const }
      case 'ls':
        return { lines: ['src/  package.json  README.md'], type: 'output' as const }
      case 'pwd':
        return { lines: [cwd], type: 'output' as const }
      case 'cd':
        if (args[0]) setCwd(args[0] === '..' ? '/project' : `/project/${args[0]}`)
        return { lines: [], type: 'output' as const }
      case 'clear':
        setLines([])
        return { lines: [], type: 'output' as const }
      case 'echo':
        return { lines: [args.join(' ')], type: 'output' as const }
      case 'npm':
        if (args[0] === 'install' || args[0] === 'i')
          return { lines: ['added 142 packages in 2.1s'], type: 'info' as const }
        if (args.join(' ') === 'run dev')
          return { lines: ['VITE v5.0.0 ready in 234ms', '', '  Local: http://localhost:5173/'], type: 'info' as const }
        if (args.join(' ') === 'run build')
          return { lines: ['vite v5.0.0 building...', 'dist/index.html  0.49 kB', 'Built in 1.2s'], type: 'info' as const }
        return { lines: [`npm ${args.join(' ')}: simulated`], type: 'info' as const }
      case 'git':
        if (args[0] === 'status')
          return { lines: ['On branch main', 'nothing to commit, working tree clean'], type: 'output' as const }
        if (args[0] === 'log')
          return { lines: ['commit abc1234 (HEAD -> main)', '  Initial commit'], type: 'output' as const }
        return { lines: [`git ${args[0]}: simulated`], type: 'info' as const }
      case '':
        return { lines: [], type: 'output' as const }
      default:
        return { lines: [`command not found: ${command}`], type: 'error' as const }
    }
  }, [cwd])

  const handleSubmit = () => {
    const cmd = input.trim()
    if (cmd) {
      setHistory(h => [...h, cmd])
      setHistIdx(-1)
    }
    addLine('command', `${cwd} $ ${cmd}`)
    const result = exec(cmd)
    result.lines.forEach(l => addLine(result.type, l))
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (histIdx < history.length - 1) {
        const i = histIdx + 1
        setHistIdx(i)
        setInput(history[history.length - 1 - i])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx > 0) {
        const i = histIdx - 1
        setHistIdx(i)
        setInput(history[history.length - 1 - i])
      } else { setHistIdx(-1); setInput('') }
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="h-[35px] flex items-center justify-between px-3 bg-[#252526] border-t border-[#3e3e42] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-[#cccccc] font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setLines([{ id: 0, type: 'info', text: 'New terminal session.' }]); setNextId(1); setCwd('/project'); setInput(''); setHistory([]); setHistIdx(-1) }}
            className="p-1 hover:bg-[#3c3c3c] rounded text-[#cccccc]"
            title="New Terminal"
          >
            <Plus size={14} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded text-[#cccccc]" title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-[13px] leading-5"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map(line => (
          <div key={line.id} className={
            line.type === 'error' ? 'text-[#f48771]' :
            line.type === 'info' ? 'text-[#569cd6]' :
            line.type === 'command' ? 'text-[#6a9955]' :
            'text-[#cccccc]'
          }>
            {line.text}
          </div>
        ))}

        <div className="flex items-center">
          <span className="text-[#6a9955] mr-2 shrink-0">{cwd} $</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[#cccccc] outline-none"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}
