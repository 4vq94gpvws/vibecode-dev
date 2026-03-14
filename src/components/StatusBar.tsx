import { GitBranch, AlertCircle, Check, Loader2 } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useWebContainer } from '../hooks/useWebContainer'

export function StatusBar() {
  const { activeFileId, files } = useEditorStore()
  const { isReady, isLoading, error } = useWebContainer()

  // Get active file info
  const activeFile = (() => {
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
  })()

  const getLanguageLabel = (lang?: string) => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      jsx: 'JSX',
      tsx: 'TSX',
      json: 'JSON',
      markdown: 'Markdown',
      css: 'CSS',
      html: 'HTML',
    }
    return labels[lang || ''] || lang || 'Plain Text'
  }

  return (
    <div className="h-6 bg-editor-accent flex items-center px-2 text-white text-xs">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <GitBranch size={12} />
          <span>main</span>
        </div>
        {activeFile?.isModified && (
          <div className="flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Modified</span>
          </div>
        )}
      </div>

      {/* Center Section */}
      <div className="flex-1 text-center">
        {isLoading ? (
          <span className="flex items-center justify-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Initializing WebContainer...
          </span>
        ) : error ? (
          <span className="flex items-center justify-center gap-1 text-red-200">
            <AlertCircle size={12} />
            {error}
          </span>
        ) : isReady ? (
          <span className="flex items-center justify-center gap-1">
            <Check size={12} />
            WebContainer Ready
          </span>
        ) : null}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {activeFile && (
          <>
            <span>{getLanguageLabel(activeFile.language)}</span>
            <span>UTF-8</span>
            <span>LF</span>
          </>
        )}
        <span>vibecode.dev</span>
      </div>
    </div>
  )
}