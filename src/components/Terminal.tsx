import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Play, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useWebContainer } from '../hooks/useWebContainer'
import 'xterm/css/xterm.css'

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const { isReady, output, runCommand } = useWebContainer()
  const [command, setCommand] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>(['npm install', 'npm start', 'npm run dev', 'node --version'])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialize xterm
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    const term = new XTerm({
      theme: {
        background: '#0c0c0c',
        foreground: '#cccccc',
        cursor: '#cccccc',
        selectionBackground: '#264f78',
        black: '#0c0c0c',
        red: '#f14c4c',
        green: '#23d18b',
        yellow: '#e5e510',
        blue: '#3b8eea',
        magenta: '#d670d6',
        cyan: '#29b8db',
        white: '#e5e5e5',
      },
      fontSize: 14,
      fontFamily: "Consolas, 'Courier New', monospace",
      cursorBlink: true,
      cursorStyle: 'line',
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    
    term.open(terminalRef.current)
    fitAddon.fit()
    
    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Welcome message
    term.writeln('\x1b[1;32mWelcome to vibecode.dev terminal!\x1b[0m')
    term.writeln('\x1b[90mWebContainer is initializing...\x1b[0m')
    term.writeln('')

    // Handle input
    term.onData((data) => {
      // This is a simple implementation
      // In production, you'd want proper shell integration
    })

    return () => {
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [])

  // Update terminal with output
  useEffect(() => {
    if (!xtermRef.current || output.length === 0) return
    
    const lastOutput = output[output.length - 1]
    if (lastOutput) {
      xtermRef.current.writeln(lastOutput)
    }
  }, [output])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      fitAddonRef.current?.fit()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || !isReady) return

    const cmd = command.trim()
    setCommand('')
    setHistoryIndex(-1)
    
    if (!commandHistory.includes(cmd)) {
      setCommandHistory(prev => [...prev, cmd])
    }

    try {
      await runCommand(cmd)
    } catch (err) {
      console.error('Command failed:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = historyIndex + 1
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = historyIndex - 1
      if (newIndex >= 0) {
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
  }

  const clearTerminal = () => {
    xtermRef.current?.clear()
    xtermRef.current?.writeln('\x1b[1;32mTerminal cleared\x1b[0m')
  }

  if (isMinimized) {
    return (
      <div className="h-8 bg-terminal-bg border-t border-editor-border flex items-center px-4">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 text-editor-muted hover:text-editor-text"
        >
          <ChevronUp size={16} />
          <span className="text-sm">Terminal</span>
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-terminal-bg">
      {/* Terminal Header */}
      <div className="h-8 flex items-center justify-between px-4 bg-editor-sidebar border-b border-editor-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMinimized(true)}
            className="flex items-center gap-2 text-editor-muted hover:text-editor-text"
          >
            <ChevronDown size={16} />
            <span className="text-sm">Terminal</span>
          </button>
          <span className="text-xs text-editor-muted">
            {isReady ? '● Ready' : '○ Initializing...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-editor-hover rounded text-editor-muted hover:text-editor-text"
            title="Clear terminal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-hidden p-2">
        <div ref={terminalRef} className="h-full" />
      </div>

      {/* Command Input */}
      <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 px-4 py-2 border-t border-editor-border">
        <span className="text-terminal-green font-mono text-sm">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isReady ? 'Type a command...' : 'WebContainer initializing...'}
          disabled={!isReady}
          className="flex-1 bg-transparent text-terminal-text font-mono text-sm outline-none placeholder:text-editor-muted"
        />
        <button
          type="submit"
          disabled={!isReady || !command.trim()}
          className="p-1 hover:bg-editor-hover rounded text-editor-muted hover:text-terminal-green disabled:opacity-50"
        >
          <Play size={14} />
        </button>
      </form>
    </div>
  )
}