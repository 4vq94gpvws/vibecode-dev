import { useCallback, useEffect, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { X, Circle, AlertCircle } from 'lucide-react'
import { useEditor } from '../hooks/useEditor'
import { useAI } from '../hooks/useAI'

export function Editor() {
  const { tabs, activeTab, activeFile, closeTab, setActiveTab, updateFileContent, files } = useEditor()
  const { complete } = useAI()
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Clear error when tab changes
  useEffect(() => {
    setError(null)
  }, [activeTab?.id])

  const handleEditorChange = useCallback((value: string | undefined) => {
    try {
      if (activeTab?.fileId && value !== undefined) {
        updateFileContent(activeTab.fileId, value)
      }
    } catch (err) {
      console.error('Editor: Error updating file content:', err)
      setError('Failed to update file content')
    }
  }, [activeTab, updateFileContent])

  // AI completion on Ctrl+Space
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    if (!editor || !monaco) return
    
    try {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, async () => {
        try {
          const position = editor.getPosition()
          const model = editor.getModel()
          if (!position || !model) return
          
          const content = model.getValue()
          
          const result = await complete({
            code: content,
            language: activeFile?.language || 'javascript',
            cursorPosition: model.getOffsetAt(position),
          })
          
          if (result) {
            setSuggestion(result)
          }
        } catch (err) {
          console.error('Editor: Error in AI completion:', err)
        }
      })
    } catch (err) {
      console.error('Editor: Error mounting editor:', err)
    }
  }, [activeFile?.language, complete])

  // Safe file finder with error handling
  const findFileById = (nodes: any[], id: string): any => {
    if (!nodes || !Array.isArray(nodes) || !id) return null
    
    try {
      for (const node of nodes) {
        if (!node) continue
        if (node.id === id) return node
        if (node.children) {
          const found = findFileById(node.children, id)
          if (found) return found
        }
      }
    } catch (err) {
      console.error('Editor: Error finding file:', err)
    }
    return null
  }

  if (!tabs || tabs.length === 0) {
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
      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-red-200 text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-200"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex bg-editor-sidebar border-b border-editor-border overflow-x-auto">
        {tabs.map((tab) => {
          // Find the file for this tab with null safety
          const file = tab?.fileId ? findFileById(files || [], tab.fileId) : null
          const isActive = tab?.id && activeTab?.id === tab.id
          
          return (
            <div
              key={tab?.id || 'unknown'}
              onClick={() => tab?.id && setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer group border-r border-editor-border ${
                isActive
                  ? 'bg-editor-bg text-white'
                  : 'bg-editor-sidebar text-editor-muted hover:bg-editor-hover'
              }`}
            >
              <span className="flex-1 truncate text-sm">
                {file?.name || tab?.name || 'Untitled'}
              </span>
              {tab?.isDirty && (
                <Circle size={8} className="fill-current text-editor-accent" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (tab?.id) {
                    closeTab(tab.id)
                  }
                }}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-editor-hover ${
                  isActive ? 'text-editor-muted hover:text-white' : 'text-editor-muted'
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