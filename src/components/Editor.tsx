import { useCallback, useEffect, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { X, Circle } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useAI } from '../hooks/useAI'

export function Editor() {
  const { tabs, activeFileId, closeTab, setActiveTab, files, updateFileContent } = useEditorStore()
  const { complete } = useAI()
  const [suggestion, setSuggestion] = useState('')

  // Get active file content
  const getActiveFile = useCallback(() => {
    const findFile = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.id === activeFileId) return node
        if (node.children) {
          const found = findFile(node.children)
          if (found) return found
        }
      }
      return null
    }
    return findFile(files)
  }, [activeFileId, files])

  const activeFile = getActiveFile()

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value)
    }
  }, [activeFileId, updateFileContent])

  // AI completion on Ctrl+Space
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, async () => {
      const position = editor.getPosition()
      const model = editor.getModel()
      const content = model.getValue()
      
      const result = await complete({
        code: content,
        language: activeFile?.language || 'javascript',
        cursorPosition: model.getOffsetAt(position),
      })
      
      if (result) {
        setSuggestion(result)
      }
    })
  }, [activeFile?.language, complete])

  if (tabs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-editor-text mb-2">vibecode.dev</h2>
          <p className="text-editor-muted">Open a file to start coding</p>
          <div className="mt-4 text-sm text-editor-muted">
            <p>Ctrl+P - Quick Open</p>
            <p>Ctrl+Shift+P - Command Palette</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Tabs */}
      <div className="flex bg-editor-sidebar border-b border-editor-border overflow-x-auto">
        {tabs.map((tab) => {
          const file = (() => {
            const findFile = (nodes: any[]): any => {
              for (const node of nodes) {
                if (node.id === tab.fileId) return node
                if (node.children) {
                  const found = findFile(node.children)
                  if (found) return found
                }
              }
              return null
            }
            return findFile(files)
          })()
          
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.fileId)}
              className={`flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer group border-r border-editor-border ${
                tab.isActive 
                  ? 'bg-editor-bg text-white' 
                  : 'bg-editor-sidebar text-editor-muted hover:bg-editor-hover'
              }`}
            >
              <span className="flex-1 truncate text-sm">
                {file?.name || 'Untitled'}
              </span>
              {file?.isModified && (
                <Circle size={8} className="fill-current text-editor-accent" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.fileId)
                }}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-editor-hover ${
                  tab.isActive ? 'text-editor-muted hover:text-white' : 'text-editor-muted'
                }`}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            language={activeFile.language || 'javascript'}
            value={activeFile.content || ''}
            theme="vs-dark"
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              renderWhitespace: 'selection',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-editor-muted">Select a file to edit</p>
          </div>
        )}
        
        {/* AI Suggestion */}
        {suggestion && (
          <div className="absolute bottom-4 right-4 bg-editor-active border border-editor-accent rounded p-3 shadow-lg">
            <div className="text-sm text-editor-text mb-2">AI Suggestion:</div>
            <code className="text-sm text-terminal-green font-mono">{suggestion}</code>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setSuggestion('')}
                className="px-2 py-1 text-xs bg-editor-accent text-white rounded hover:bg-blue-600">
                Accept (Tab)
              </button>
              <button
                onClick={() => setSuggestion('')}
                className="px-2 py-1 text-xs bg-editor-hover text-editor-text rounded hover:bg-editor-border">
                Dismiss (Esc)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}