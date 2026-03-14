import React, { useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Trash2, Play } from 'lucide-react';

interface TerminalLine {
  id: number;
  type: 'prompt' | 'output' | 'error' | 'info';
  text: string;
}

export const Terminal: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: 'info', text: 'Welcome to vibecode.dev terminal!' },
    { id: 1, type: 'info', text: 'WebContainer integration available in local dev mode.' },
  ]);
  const [input, setInput] = useState('');
  const [idCounter, setIdCounter] = useState(2);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setIdCounter(prev => {
      const id = prev;
      setLines(ls => [...ls, { id, type, text }]);
      return prev + 1;
    });
  }, []);

  const handleCommand = useCallback((cmd: string) => {
    addLine('prompt', '$ ' + cmd);
    const trimmed = cmd.trim();
    if (!trimmed) return;
    if (trimmed === 'clear') {
      setLines([]);
      return;
    }
    if (trimmed === 'help') {
      addLine('info', 'Available: clear, help, echo <text>');
      return;
    }
    if (trimmed.startsWith('echo ')) {
      addLine('output', trimmed.slice(5));
      return;
    }
    addLine('info', 'Terminal runs in browser mode. Full shell available in local dev.');
  }, [addLine]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  const clearTerminal = () => setLines([]);

  const runQuickCommand = (cmd: string) => handleCommand(cmd);

  return (
    <div className={'border-t border-editor-border bg-editor-bg transition-all duration-300 ' + (isExpanded ? 'h-64' : 'h-10')}>
      <div className="flex items-center justify-between px-4 h-10 border-b border-editor-border bg-editor-sidebar">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-editor-fg transition-colors"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            <span>Terminal</span>
          </button>
          {isExpanded && (
            <div className="flex items-center gap-2">
              {['npm install', 'npm run dev', 'npm run build'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => runQuickCommand(cmd)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-editor-active hover:bg-editor-border rounded transition-colors"
                  title={cmd}
                >
                  <Play size={10} />
                  {cmd.replace('npm ', '').replace('run ', '')}
                </button>
              ))}
            </div>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={clearTerminal}
            className="p-1.5 hover:bg-editor-active rounded transition-colors"
            title="Clear terminal"
          >
            <Trash2 size={14} className="text-gray-400" />
          </button>
        )}
      </div>
      {isExpanded && (
        <div
          className="h-[calc(100%-40px)] flex flex-col p-2 font-mono text-xs overflow-y-auto"
          onClick={() => inputRef.current?.focus()}
          style={{ background: '#1e1e1e', color: '#d4d4d4' }}
        >
          <div className="flex-1 overflow-y-auto space-y-0.5 mb-1">
            {lines.map(line => (
              <div
                key={line.id}
                style={{
                  color: line.type === 'error' ? '#f48771'
                    : line.type === 'prompt' ? '#4ec9b0'
                    : line.type === 'info' ? '#569cd6'
                    : '#d4d4d4'
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: '#4ec9b0' }}>vibecode</span>
            <span style={{ color: '#9cdcfe' }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-xs"
              style={{ color: '#d4d4d4', caretColor: '#d4d4d4' }}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
};
