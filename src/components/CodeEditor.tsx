import { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useEditorStore, FileNode } from '../store/editorStore'
import { Code2 } from 'lucide-react'

function findFile(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const f = findFile(n.children, id)
      if (f) return f
    }
  }
  return null
}

function getLanguage(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', md: 'markdown', css: 'css', html: 'html', py: 'python',
    rs: 'rust', go: 'go', yml: 'yaml', yaml: 'yaml', sh: 'shell',
  }
  return map[ext] || 'plaintext'
}

export function CodeEditor() {
  const activeFileId = useEditorStore(s => s.activeFileId)
  const files = useEditorStore(s => s.files)
  const updateFileContent = useEditorStore(s => s.updateFileContent)
  const editorRef = useRef<any>(null)

  const file = activeFileId ? findFile(files, activeFileId) : null

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center text-[#5a5a5a]">
          <Code2 size={64} strokeWidth={1} className="mx-auto mb-4" />
          <p className="text-lg mb-1">vibecode.dev</p>
          <p className="text-sm text-[#4a4a4a]">Open a file to start editing</p>
          <div className="mt-6 space-y-1 text-xs text-[#4a4a4a]">
            <p><kbd className="px-1.5 py-0.5 bg-[#2d2d30] rounded text-[#858585]">Ctrl+L</kbd> Toggle AI Chat</p>
            <p><kbd className="px-1.5 py-0.5 bg-[#2d2d30] rounded text-[#858585]">Ctrl+`</kbd> Toggle Terminal</p>
          </div>
        </div>
      </div>
    )
  }

  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monaco.editor.defineTheme('cursor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
      }
    })
    monaco.editor.setTheme('cursor-dark')
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={getLanguage(file.name)}
        value={file.content || ''}
        onChange={val => { if (val !== undefined) updateFileContent(file.id, val) }}
        onMount={handleMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: 'none',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 8 },
        }}
      />
    </div>
  )
}
