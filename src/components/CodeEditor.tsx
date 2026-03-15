import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useEditor } from '../hooks/useEditor';
import { useAgents } from '../hooks/useAgents';
import { CodeSuggestion } from '../types/agents';
import { Check, X, Sparkles } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { activeFile, activeTab, updateFileContent, updateCursorPosition, getAIContext } = useEditor();
  const { suggestions, applySuggestion, dismissSuggestion, requestCompletion } = useAgents();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [decorations, setDecorations] = useState<string[]>([]);

  useEffect(() => {
    if (editorRef.current && activeFile?.content !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== activeFile.content) {
        editorRef.current.setValue(activeFile.content);
      }
    }
  }, [activeFile?.id]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current && suggestions.length > 0) {
      const newDecorations = suggestions.map(suggestion => ({
        range: new monacoRef.current.Range(
          suggestion.range.startLineNumber,
          suggestion.range.startColumn,
          suggestion.range.endLineNumber,
          suggestion.range.endColumn
        ),
        options: {
          isWholeLine: suggestion.type === 'insert',
          className: 'ai-suggestion-line',
          glyphMarginClassName: 'ai-suggestion-glyph',
          hoverMessage: { value: suggestion.description || 'AI Suggestion' },
          inlineClassName: 'ai-suggestion-inline'
        }
      }));
      
      const decorationIds = editorRef.current.deltaDecorations(decorations, newDecorations);
      setDecorations(decorationIds);
    }
  }, [suggestions]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Add custom styles for AI suggestions
    monaco.editor.defineTheme('vibecode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6'
      }
    });
    monaco.editor.setTheme('vibecode-dark');
    
    // Add CSS for decorations
    const style = document.createElement('style');
    style.textContent = `
      .ai-suggestion-line {
        background-color: rgba(59, 130, 246, 0.1);
        border-left: 2px solid #3b82f6;
      }
      .ai-suggestion-glyph {
        background-color: #3b82f6;
        border-radius: 50%;
      }
      .ai-suggestion-inline {
        background-color: rgba(59, 130, 246, 0.2);
      }
    `;
    document.head.appendChild(style);
    
    editor.onDidChangeCursorPosition((e: any) => {
      if (activeTab) {
        updateCursorPosition(activeTab.id, {
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      }
    });
    
    // Add command for Ctrl+Space
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      const context = getAIContext();
      requestCompletion(context);
    });
  };

  const handleChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile.id, value);
    }
  };

  const handleApplySuggestion = (suggestion: CodeSuggestion) => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const range = new monacoRef.current.Range(
          suggestion.range.startLineNumber,
          suggestion.range.startColumn,
          suggestion.range.endLineNumber,
          suggestion.range.endColumn
        );
        model.pushEditOperations(
          [],
          [{ range, text: suggestion.content }],
          () => null
        );
      }
    }
    applySuggestion(suggestion);
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Select a file to start coding</p>
          <p className="text-gray-600 text-sm mt-2">Use AI agents with keyboard shortcuts:</p>
          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <p><kbd className="px-2 py-1 bg-editor-sidebar rounded">Ctrl+Space</kbd> Code Completion</p>
            <p><kbd className="px-2 py-1 bg-editor-sidebar rounded">Ctrl+Shift+B</kbd> Bug Detection</p>
            <p><kbd className="px-2 py-1 bg-editor-sidebar rounded">Ctrl+Shift+R</kbd> Refactoring</p>
            <p><kbd className="px-2 py-1 bg-editor-sidebar rounded">Ctrl+Shift+D</kbd> Documentation</p>
            <p><kbd className="px-2 py-1 bg-editor-sidebar rounded">Ctrl+Shift+T</kbd> Test Generation</p>
          </div>
        </div>
      </div>
    );
  }

  const getLanguage = () => {
    const ext = activeFile.name.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
      py: 'python',
      rs: 'rust',
      go: 'go'
    };
    return langMap[ext || ''] || 'plaintext';
  };

  return (
    <div className="flex-1 flex flex-col relative" data-editor="true">
      <Editor
        height="100%"
        language={getLanguage()}
        value={activeFile.content || ''}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          }
        }}
      />
      
      {/* Suggestion Widget */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-editor-sidebar border border-editor-border rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-medium">AI Suggestion</span>
            </div>
            <button
              onClick={() => dismissSuggestion(suggestions[0].id)}
              className="p-1 hover:bg-editor-active rounded"
            >
              <X size={14} />
            </button>
          </div>
          <pre className="text-xs bg-editor-bg p-2 rounded mb-3 overflow-x-auto">
            <code>{suggestions[0].content}</code>
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => handleApplySuggestion(suggestions[0])}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              <Check size={12} />
              Apply
            </button>
            <button
              onClick={() => dismissSuggestion(suggestions[0].id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-editor-active hover:bg-editor-border text-editor-fg text-xs rounded transition-colors"
            >
              <X size={12} />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};