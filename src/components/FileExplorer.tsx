import { useState } from 'react'
import { useEditorStore, FileNode } from '../store/editorStore'
import { ChevronRight, ChevronDown } from 'lucide-react'

function getFileIcon(name: string): { color: string; label: string } {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'ts': case 'tsx': return { color: '#3178c6', label: 'TS' }
    case 'js': case 'jsx': return { color: '#f1e05a', label: 'JS' }
    case 'json': return { color: '#cb8622', label: '{}' }
    case 'md': return { color: '#519aba', label: 'M' }
    case 'css': return { color: '#563d7c', label: '#' }
    case 'html': return { color: '#e34c26', label: '<>' }
    case 'py': return { color: '#3572A5', label: 'PY' }
    default: return { color: '#858585', label: '~' }
  }
}

function FileTreeItem({ node, depth }: { node: FileNode; depth: number }) {
  const openTab = useEditorStore(s => s.openTab)
  const toggleFolder = useEditorStore(s => s.toggleFolder)
  const activeFileId = useEditorStore(s => s.activeFileId)

  const isActive = node.type === 'file' && activeFileId === node.id
  const children = node.children || []

  const handleClick = () => {
    if (node.type === 'directory') {
      toggleFolder(node.id)
    } else {
      openTab(node.id)
    }
  }

  const icon = node.type === 'file' ? getFileIcon(node.name) : null

  return (
    <>
      <div
        onClick={handleClick}
        className={`flex items-center h-[22px] cursor-pointer text-[13px] pr-2 ${
          isActive
            ? 'bg-[#37373d] text-white'
            : 'text-[#cccccc] hover:bg-[#2a2d2e]'
        }`}
        style={{ paddingLeft: depth * 8 + 8 }}
      >
        {node.type === 'directory' ? (
          <>
            {node.isOpen ? (
              <ChevronDown size={16} className="shrink-0 text-[#858585] mr-0.5" />
            ) : (
              <ChevronRight size={16} className="shrink-0 text-[#858585] mr-0.5" />
            )}
            <span className="truncate">{node.name}</span>
          </>
        ) : (
          <>
            <span
              className="w-4 h-4 text-[9px] font-bold flex items-center justify-center shrink-0 mr-1.5 ml-5 rounded-sm"
              style={{ color: icon?.color }}
            >
              {icon?.label}
            </span>
            <span className="truncate">{node.name}</span>
            {node.isModified && (
              <span className="ml-auto text-[#c8c8c8] text-[10px] shrink-0">M</span>
            )}
          </>
        )}
      </div>
      {node.type === 'directory' && node.isOpen && children.length > 0 && (
        <div>
          {children.map(child => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  )
}

export function FileExplorer() {
  const files = useEditorStore(s => s.files)
  const [newFileName, setNewFileName] = useState('')
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null)
  const addFile = useEditorStore(s => s.addFile)

  const handleCreate = () => {
    if (!newFileName.trim()) {
      setIsCreating(null)
      return
    }
    const isFolder = isCreating === 'folder'
    addFile(
      {
        id: `${Date.now()}-${newFileName}`,
        name: newFileName.trim(),
        type: isFolder ? 'directory' : 'file',
        ...(isFolder ? { children: [], isOpen: true } : { content: '', language: 'text' }),
      },
      'root'
    )
    setNewFileName('')
    setIsCreating(null)
  }

  const rootChildren = files[0]?.children || []

  return (
    <div className="w-60 bg-[#252526] flex flex-col flex-shrink-0 select-none overflow-hidden border-r border-[#3e3e42]">
      <div className="h-9 flex items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-wider text-[#bbbbbb] shrink-0">
        <span>Explorer</span>
        <div className="flex gap-1">
          <button
            onClick={() => setIsCreating('file')}
            className="p-0.5 hover:bg-[#3c3c3c] rounded text-[#cccccc]"
            title="New File"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"/></svg>
          </button>
          <button
            onClick={() => setIsCreating('folder')}
            className="p-0.5 hover:bg-[#3c3c3c] rounded text-[#cccccc]"
            title="New Folder"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13H2V3h4.29l.85.85.36.15H14v7.49z"/></svg>
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="px-2 py-1">
          <input
            autoFocus
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setIsCreating(null); setNewFileName('') }
            }}
            onBlur={handleCreate}
            placeholder={isCreating === 'file' ? 'filename.ts' : 'folder name'}
            className="w-full bg-[#3c3c3c] text-[#cccccc] text-xs px-2 py-1 rounded outline-none border border-[#007acc]"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-0.5">
        {rootChildren.map(node => (
          <FileTreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  )
}
