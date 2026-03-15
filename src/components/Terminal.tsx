import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, Trash2, Play, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalLine {
  id: number;
  type: 'prompt' | 'output' | 'error' | 'info' | 'success' | 'command';
  text: string;
}

interface FileSystem {
  [path: string]: string[];
}

const INITIAL_FS: FileSystem = {
  '/': ['vibecode-dev', 'projects', 'documents'],
  '/vibecode-dev': ['src', 'public', 'package.json', 'README.md', 'vite.config.ts', 'tsconfig.json'],
  '/vibecode-dev/src': ['components', 'hooks', 'utils', 'App.tsx', 'main.tsx', 'index.css'],
  '/vibecode-dev/src/components': ['Terminal.tsx', 'Editor.tsx', 'Sidebar.tsx'],
  '/vibecode-dev/src/hooks': ['useAI.ts', 'useEditor.ts'],
  '/vibecode-dev/src/utils': ['format.ts', 'helpers.ts'],
  '/vibecode-dev/public': ['index.html', 'favicon.ico'],
  '/projects': ['my-app', 'portfolio', 'api-server'],
  '/documents': ['notes.txt', 'todo.md'],
};

const FILE_CONTENTS: { [file: string]: string[] } = {
  'package.json': [
    '{',
    '  "name": "vibecode-dev",',
    '  "version": "1.0.0",',
    '  "type": "module",',
    '  "scripts": {',
    '    "dev": "vite",',
    '    "build": "tsc && vite build",',
    '    "preview": "vite preview"',
    '  }',
    '}',
  ],
  'README.md': [
    '# vibecode.dev',
    '',
    'AI-powered development environment',
    '',
    '## Features',
    '',
    '- AI-powered code generation',
    '- Real-time collaboration',
    '- Terminal integration',
  ],
  'notes.txt': [
    'Project ideas:',
    '- AI code assistant',
    '- Terminal emulator',
    '- File explorer',
  ],
  'todo.md': [
    '- [x] Create terminal component',
    '- [ ] Add file system',
    '- [ ] Implement git commands',
  ],
};

export const Terminal: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: 'info', text: 'Welcome to vibecode.dev terminal!' },
    { id: 1, type: 'info', text: 'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [idCounter, setIdCounter] = useState(2);
  const [currentPath, setCurrentPath] = useState('/vibecode-dev');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fileSystem] = useState<FileSystem>(INITIAL_FS);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setIdCounter(prev => {
      const id = prev;
      setLines(ls => [...ls, { id, type, text }]);
      return prev + 1;
    });
  }, []);

  const getPrompt = () => {
    const displayPath = currentPath === '/' ? '~' : `~${currentPath}`;
    return { path: displayPath, symbol: '$' };
  };

  const normalizePath = (path: string): string => {
    if (path.startsWith('/')) return path;
    if (path === '~') return '/vibecode-dev';
    if (path.startsWith('~/')) return '/vibecode-dev' + path.slice(1);
    if (currentPath === '/') return '/' + path;
    return currentPath + '/' + path;
  };

  const getDirectoryContents = (path: string): string[] => {
    return fileSystem[path] || [];
  };

  const isDirectory = (path: string): boolean => {
    return fileSystem[path] !== undefined;
  };

  const isFile = (name: string): boolean => {
    return name.includes('.') && !name.startsWith('.');
  };

  const simulateCommand = useCallback((cmd: string): { output: string[]; type: TerminalLine['type'] } => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        return {
          output: [
            'Available commands:',
            '',
            '  ls [path]       List directory contents',
            '  cd [path]       Change directory',
            '  pwd             Print working directory',
            '  cat <file>      Display file contents',
            '  npm <command>   Run npm commands (install, run dev, run build)',
            '  git <command>   Run git commands (status, log, branch)',
            '  clear           Clear terminal',
            '  echo <text>     Print text',
            '  whoami          Display current user',
            '  date            Display current date',
            '  mkdir <dir>     Create directory (simulated)',
            '  touch <file>    Create file (simulated)',
            '',
            'Shortcuts:',
            '  Up/Down         Navigate command history',
          ],
          type: 'info',
        };

      case 'ls':
        const targetPath = args[0] ? normalizePath(args[0]) : currentPath;
        const contents = getDirectoryContents(targetPath);
        if (contents.length === 0) {
          return { output: ['(empty directory)'], type: 'info' };
        }
        // Color-code directories and files
        const formatted = contents.map(item => {
          const fullPath = targetPath === '/' ? `/${item}` : `${targetPath}/${item}`;
          if (isDirectory(fullPath) || !isFile(item)) {
            return `[DIR]${item}`;
          }
          if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
            return `[JS]${item}`;
          }
          if (item.endsWith('.json')) {
            return `[JSON]${item}`;
          }
          if (item.endsWith('.md') || item.endsWith('.txt')) {
            return `[TXT]${item}`;
          }
          return item;
        });
        return { output: [formatted.join('  ')], type: 'output' };

      case 'cd':
        const newPath = args[0] ? normalizePath(args[0]) : '/vibecode-dev';
        if (newPath === '~' || newPath === '/vibecode-dev') {
          setCurrentPath('/vibecode-dev');
          return { output: [], type: 'output' };
        }
        if (isDirectory(newPath)) {
          setCurrentPath(newPath);
          return { output: [], type: 'output' };
        }
        return { output: [`cd: no such file or directory: ${args[0] || ''}`], type: 'error' };

      case 'pwd':
        return { output: [currentPath], type: 'output' };

      case 'cat':
        if (!args[0]) {
          return { output: ['cat: missing file operand'], type: 'error' };
        }
        const fileName = args[0];
        const filePath = fileName.startsWith('/') ? fileName : `${currentPath}/${fileName}`;
        const dirContents = getDirectoryContents(currentPath);
        
        if (dirContents.includes(fileName)) {
          const content = FILE_CONTENTS[fileName];
          if (content) {
            return { output: content, type: 'output' };
          }
          return { output: [`cat: ${fileName}: Is a directory`], type: 'error' };
        }
        return { output: [`cat: ${fileName}: No such file or directory`], type: 'error' };

      case 'npm':
        const npmCmd = args.join(' ');
        if (npmCmd === 'install' || npmCmd === 'i') {
          return {
            output: [
              'added 142 packages in 2.3s',
              '',
              '8 packages are looking for funding',
              'run `npm fund` for details',
            ],
            type: 'success',
          };
        }
        if (npmCmd === 'run dev') {
          return {
            output: [
              '> vibecode-dev@1.0.0 dev',
              '> vite',
              '',
              '  VITE v5.0.0  ready in 234 ms',
              '',
              '  ➜  Local:   http://localhost:5173/',
              '  ➜  Network: http://192.168.1.100:5173/',
              '  ➜  press h + enter to show help',
            ],
            type: 'success',
          };
        }
        if (npmCmd === 'run build') {
          return {
            output: [
              '> vibecode-dev@1.0.0 build',
              '> tsc && vite build',
              '',
              'vite v5.0.0 building for production...',
              '✓ 42 modules transformed.',
              'dist/                     0.05 kB │ gzip: 0.07 kB',
              'dist/assets/index-xxx.js  45.23 kB │ gzip: 12.34 kB',
              '✓ built in 1.23s',
            ],
            type: 'success',
          };
        }
        return { output: [`npm command simulated: ${npmCmd}`], type: 'info' };

      case 'git':
        const gitCmd = args[0] || 'status';
        if (gitCmd === 'status') {
          return {
            output: [
              'On branch main',
              'Your branch is up to date with origin/main.',
              '',
              'nothing to commit, working tree clean',
            ],
            type: 'output',
          };
        }
        if (gitCmd === 'log') {
          return {
            output: [
              'commit abc1234 (HEAD -> main, origin/main)',
              'Author: Developer <dev@vibecode.dev>',
              'Date:   ' + new Date().toLocaleString(),
              '',
              '    Update terminal component',
              '',
              'commit def5678',
              'Author: Developer <dev@vibecode.dev>',
              'Date:   ' + new Date(Date.now() - 86400000).toLocaleString(),
              '',
              '    Initial commit',
            ],
            type: 'output',
          };
        }
        if (gitCmd === 'branch') {
          return {
            output: ['* main', '  develop', '  feature/terminal'],
            type: 'output',
          };
        }
        return { output: [`git ${gitCmd}: command simulated`], type: 'info' };

      case 'clear':
        setLines([]);
        return { output: [], type: 'output' };

      case 'echo':
        return { output: [args.join(' ')], type: 'output' };

      case 'whoami':
        return { output: ['developer'], type: 'output' };

      case 'date':
        return { output: [new Date().toString()], type: 'output' };

      case 'mkdir':
        if (!args[0]) {
          return { output: ['mkdir: missing operand'], type: 'error' };
        }
        return { output: [`Directory created: ${args[0]}`], type: 'success' };

      case 'touch':
        if (!args[0]) {
          return { output: ['touch: missing file operand'], type: 'error' };
        }
        return { output: [`File created: ${args[0]}`], type: 'success' };

      case '':
        return { output: [], type: 'output' };

      default:
        return { output: [`Command not found: ${command}. Type "help" for available commands.`], type: 'error' };
    }
  }, [currentPath, fileSystem]);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    
    // Add to history
    if (trimmed) {
      setCommandHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);
    }

    // Add command line with prompt
    const prompt = getPrompt();
    addLine('command', `${prompt.path} ${prompt.symbol} ${trimmed}`);

    // Execute command
    const result = simulateCommand(trimmed);
    result.output.forEach(line => addLine(result.type, line));
  }, [addLine, simulateCommand]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        const contents = getDirectoryContents(currentPath);
        const matches = contents.filter(item => item.startsWith(lastPart));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          setInput(parts.join(' '));
        }
      }
    }
  };

  const clearTerminal = () => {
    setLines([]);
    setCommandHistory([]);
    setHistoryIndex(-1);
  };

  const runQuickCommand = (cmd: string) => handleCommand(cmd);

  const renderLsOutput = (text: string) => {
    const items = text.split('  ').filter(Boolean);
    return items.map((item, i) => {
      let className = 'text-gray-200';
      let displayItem = item;
      
      if (item.startsWith('[DIR]')) {
        className = 'text-blue-400 font-bold';
        displayItem = item.slice(5);
      } else if (item.startsWith('[JS]')) {
        className = 'text-yellow-400';
        displayItem = item.slice(4);
      } else if (item.startsWith('[JSON]')) {
        className = 'text-green-400';
        displayItem = item.slice(6);
      } else if (item.startsWith('[TXT]')) {
        className = 'text-gray-300';
        displayItem = item.slice(5);
      }
      
      return (
        <span key={i} className={`${className} mr-4`}>
          {displayItem}
        </span>
      );
    });
  };

  const prompt = getPrompt();

  return (
    <div className={`border-t border-gray-800 transition-all duration-300 ${isExpanded ? 'h-72' : 'h-10'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            <TerminalIcon size={14} />
            <span className="font-medium">Terminal</span>
          </button>
          {isExpanded && (
            <div className="flex items-center gap-2">
              {['npm install', 'npm run dev', 'npm run build', 'git status'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => runQuickCommand(cmd)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors border border-gray-700"
                  title={cmd}
                >
                  <Play size={8} className="text-green-400" />
                  <span className="truncate max-w-[80px]">{cmd}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={clearTerminal}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
            title="Clear terminal"
          >
            <Trash2 size={14} className="text-gray-500 hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Terminal Body */}
      {isExpanded && (
        <div
          ref={terminalRef}
          className="h-[calc(100%-40px)] flex flex-col p-3 font-mono text-sm overflow-y-auto bg-gray-950"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Output Lines */}
          <div className="flex-1 space-y-1 mb-2">
            {lines.map(line => (
              <div
                key={line.id}
                className={`whitespace-pre-wrap break-all ${
                  line.type === 'error' ? 'text-red-400'
                  : line.type === 'success' ? 'text-green-400'
                  : line.type === 'info' ? 'text-blue-400'
                  : line.type === 'command' ? 'text-gray-300'
                  : 'text-gray-200'
                }`}
              >
                {line.type === 'command' ? (
                  <>
                    <span className="text-green-400">{line.text.split(' $ ')[0]}</span>
                    <span className="text-gray-400"> $ </span>
                    <span>{line.text.split(' $ ')[1] || ''}</span>
                  </>
                ) : line.text.includes('[DIR]') || line.text.includes('[JS]') ? (
                  renderLsOutput(line.text)
                ) : (
                  line.text
                )}
              </div>
            ))}
          </div>

          {/* Input Line */}
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold shrink-0">{prompt.path}</span>
            <span className="text-gray-400 shrink-0">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-gray-200 min-w-0"
              style={{ caretColor: '#4ade80' }}
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};
