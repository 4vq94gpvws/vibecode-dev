import { X } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

function getTabIcon(name: string): { color: string; label: string } {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'ts': case 'tsx': return { color: '#3178c6', label: 'TS' }
    case 'js': case 'jsx': return { color: '#f1e05a', label: 'JS' }
    case 'json': return { color: '#cb8622', label: '{}' }
    case 'md': return { color: '#519aba', label: 'M' }
    case 'css': return { color: '#563d7c', label: '#' }
    case 'html': return { color: '#e34c26', label: '<>' }
    default: return { color: '#858585', label: '~' }
  }
}

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

export function TabBar() {
  const tabs = useEditorStore(s => s.tabs)
  const files = useEditorStore(s => s.files)
  const activeFileId = useEditorStore(s => s.activeFileId)
  const setActiveTab = useEditorStore(s => s.setActiveTab)
  const closeTab = useEditorStore(s => s.closeTab)

  if (tabs.length === 0) return <div className="h-[35px] bg-[#252526] border-b border-[#3e3e42]" />

  return (
    <div className="h-[35px] bg-[#252526] flex items-end overflow-x-auto border-b border-[#3e3e42] shrink-0">
      {tabs.map(tab => {
        const file = findFile(files, tab.fileId)
        if (!file) return null
        const isActive = activeFileId === tab.fileId
        const icon = getTabIcon(file.name)

        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.fileId)}
            className={`group flex items-center gap-1.5 h-[35px] px-3 cursor-pointer text-[13px] border-r border-[#252526] shrink-0 ${
              isActive
                ? 'bg-[#1e1e1e] text-white border-t border-t-[#007acc]'
                : 'bg-[#2d2d30] text-[#969696] hover:bg-[#2d2d30] border-t border-t-transparent'
            }`}
          >
            <span className="text-[9px] font-bold" style={{ color: icon.color }}>
              {icon.label}
            </span>
            <span className="truncate max-w-[120px]">{file.name}</span>
            {file.isModified && (
              <span className="w-2 h-2 rounded-full bg-white/60 shrink-0" />
            )}
            <button
              onClick={e => { e.stopPropagation(); closeTab(tab.fileId) }}
              className={`p-0.5 rounded shrink-0 ${
                isActive
                  ? 'hover:bg-[#3c3c3c] text-[#cccccc]'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] text-[#969696]'
              }`}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
