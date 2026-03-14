import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { useWebContainer } from '../contexts/WebContainerContext';
import { ChevronUp, ChevronDown, Trash2, Play } from 'lucide-react';
import 'xterm/css/xterm.css';

export const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { runCommand, isReady } = useWebContainer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#f48771',
        green: '#4ec9b0',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#9cdcfe',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f48771',
        brightGreen: '#4ec9b0',
        brightYellow: '#dcdcaa',
        brightBlue: '#569cd6',
        brightMagenta: '#c586c0',
        brightCyan: '#9cdcfe',
        brightWhite: '#ffffff'
      },
      convertEol: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[32mWelcome to vibecode.dev terminal!\x1b[0m');
    term.writeln('\x1b[36mType commands to interact with WebContainer\x1b[0m');
    term.writeln('');
    writePrompt(term);

    let input = '';
    term.onData((data) => {
      const code = data.charCodeAt(0);
      
      if (code === 13) {
        term.writeln('');
        if (input.trim()) {
          executeCommand(input.trim());
          setCommandHistory(prev => [...prev, input.trim()]);
          setHistoryIndex(-1);
        } else {
          writePrompt(term);
        }
        input = '';
        setCurrentCommand('');
      } else if (code === 127) {
        if (input.length > 0) {
          input = input.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === '\x1b[A') {
        setCommandHistory(prev => {
          const newIndex = Math.min(historyIndex + 1, prev.length - 1);
          if (newIndex >= 0 && newIndex < prev.length) {
            const cmd = prev[prev.length - 1 - newIndex];
            clearCurrentLine(term, input);
            input = cmd;
            term.write(cmd);
          }
          setHistoryIndex(newIndex);
          return prev;
        });
      } else if (data === '\x1b[B') {
        setHistoryIndex(prev => {
          const newIndex = Math.max(prev - 1, -1);
          clearCurrentLine(term, input);
          if (newIndex >= 0) {
            const cmd = commandHistory[commandHistory.length - 1 - newIndex];
            input = cmd;
            term.write(cmd);
          } else {
            input = '';
          }
          return newIndex;
        });
      } else if (code >= 32 && code <= 126) {
        input += data;
        term.write(data);
      }
      setCurrentCommand(input);
    });

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  const clearCurrentLine = (term: XTerm, currentInput: string) => {
    for (let i = 0; i < currentInput.length; i++) {
      term.write('\b \b');
    }
  };

  const writePrompt = (term: XTerm) => {
    term.write('\x1b[32mvibecode\x1b[0m\x1b[36m$\x1b[0m ');
  };

  const executeCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    if (!isReady) {
      term.writeln('\x1b[31mWebContainer not ready yet. Please wait...\x1b[0m');
      writePrompt(term);
      return;
    }

    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      term.writeln('\x1b[90m$ ' + command + '\x1b[0m');
      const { output, exitCode } = await runCommand(cmd, args);
      
      if (output) {
        const lines = output.split(String.fromCharCode(10));
        lines.forEach(line => {
          if (line.includes('error') || line.includes('Error')) {
            term.writeln('\x1b[31m' + line + '\x1b[0m');
          } else if (line.includes('success') || line.includes('Success') || exitCode === 0) {
            term.writeln('\x1b[32m' + line + '\x1b[0m');
          } else {
            term.writeln(line);
          }
        });
      }
      
      if (exitCode !== 0) {
        term.writeln('\x1b[31mProcess exited with code ' + exitCode + '\x1b[0m');
      }
    } catch (error) {
      term.writeln('\x1b[31mError: ' + (error instanceof Error ? error.message : 'Unknown error') + '\x1b[0m');
    }
    
    writePrompt(term);
  };

  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[32mTerminal cleared\x1b[0m');
      writePrompt(xtermRef.current);
    }
  };

  const runQuickCommand = (cmd: string) => {
    if (xtermRef.current) {
      xtermRef.current.writeln(cmd);
      executeCommand(cmd);
    }
  };

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
              <button
                onClick={() => runQuickCommand('npm install')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-editor-active hover:bg-editor-border rounded transition-colors"
                title="npm install"
              >
                <Play size={10} />
                install
              </button>
              <button
                onClick={() => runQuickCommand('npm run dev')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-editor-active hover:bg-editor-border rounded transition-colors"
                title="npm run dev"
              >
                <Play size={10} />
                dev
              </button>
              <button
                onClick={() => runQuickCommand('npm run build')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-editor-active hover:bg-editor-border rounded transition-colors"
                title="npm run build"
              >
                <Play size={10} />
                build
              </button>
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
        <div className="h-[calc(100%-40px)] p-2">
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
};