import { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  MoreVertical,
  FileCode
} from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'
import { v4 as uuidv4 } from 'uuid'

const fileIcons: Record<string, React.ReactNode> = {
  js: <FileCode size={16} className="text-yellow-400" />,
  ts: <FileCode size={16} className="text-blue-400" />,
  jsx: <FileCode size={16} className="text-cyan-400" />,
  tsx: <FileCode size={16} className="text-blue-500" />,
  json: <FileCode size={16} className="text-orange-400" />,
  md: <FileCode size={16} className="text-gray-400" />,
  css: <FileCode size={16} className="text-blue-300" />,
  html: <FileCode size={16} className="text-orange-500" />,
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return fileIcons[ext] || <File size={16} className="text-gray-400" />
}

interface FileTreeItemProps {
  node: FileNode
  level: number
}

function FileTreeItem({ node, level }: FileTreeItemProps) {
  const { toggleFolder, openTab, activeFileId, deleteFile, renameFile } = useEditorStore()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [showMenu, setShowMenu] = useState(false)

  const isActive = activeFileId === node.id

  const handleClick = () => {
    if (node.type === 'directory') {
      toggleFolder(node.id)
    } else {
      openTab(node.id)
    }
  }

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      renameFile(node.id, renameValue.trim())
    }
    setIsRenaming(false)
  }

  const paddingLeft = level * 12 + 8

  return (
    <div>
      <div
        className={`flex items-center py-1 cursor-pointer group ${
          isActive ? 'bg-editor-active' : 'hover:bg-editor-hover'
        }`}
        style={{ paddingLeft }}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(true)
        }}
      >
        {node.type === 'directory' ? (
          <span className="mr-1 text-editor-muted">
            {node.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className="mr-1 w-4" />
        )}
        
        <span className="mr-2">
          {node.type === 'directory' 
            ? (node.isOpen ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-400" />)
            : getFileIcon(node.name)
          }
        </span>
        
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setIsRenaming(false)
                setRenameValue(node.name)
              }
            }}
            className="bg-editor-bg text-editor-text text-sm px-1 rounded border border-editor-accent outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`text-sm ${isActive ? 'text-white' : 'text-editor-text'}`}>
            {node.name}
            {node.isModified && <span className="ml-1 text-editor-accent">●</span>}
          </span>
        )}
        
        {/* Context Menu */}
        {showMenu && (
          <div className="absolute left-full ml-2 bg-editor-active border border-editor-border rounded shadow-lg z-50 py-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsRenaming(true)
                setShowMenu(false)
              }}
              className="w-full px-4 py-1 text-left text-sm text-editor-text hover:bg-editor-hover">
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteFile(node.id)
                setShowMenu(false)
              }}
              className="w-full px-4 py-1 text-left text-sm text-terminal-red hover:bg-editor-hover">
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
              }}
              className="w-full px-4 py-1 text-left text-sm text-editor-text hover:bg-editor-hover">
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {node.type === 'directory' && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer() {
  const { files, addFile } = useEditorStore()
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const newFile: FileNode = {
        id: uuidv4(),
        name: newFileName.trim(),
        type: 'file',
        content: '',
        language: 'javascript',
        parentId: 'src',
      }
      addFile(newFile, 'src')
      setNewFileName('')
      setShowNewFileInput(false)
    }
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-editor-muted uppercase">Project</span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewFileInput(true)}
            className="p-1 hover:bg-editor-hover rounded text-editor-muted hover:text-editor-text"
            title="New File"
          >
            <Plus size={16} />
          </button>
          <button
            className="p-1 hover:bg-editor-hover rounded text-editor-muted hover:text-editor-text"
            title="More Actions"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
      
      {/* New File Input */}
      {showNewFileInput && (
        <div className="px-4 py-1">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={handleCreateFile}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile()
              if (e.key === 'Escape') {
                setShowNewFileInput(false)
                setNewFileName('')
              }
            }}
            placeholder="filename.js"
            className="w-full bg-editor-bg text-editor-text text-sm px-2 py-1 rounded border border-editor-accent outline-none"
            autoFocus
          />
        </div>
      )}
      
      {/* File Tree */}
      <div className="py-1">
        {files.map((node) => (
          <FileTreeItem key={node.id} node={node} level={0} />
        ))}
      </div>
    </div>
  )
}