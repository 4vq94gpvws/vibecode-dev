import { GitBranch, AlertTriangle, XCircle, Bell, Check } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

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

export function StatusBar() {
  const activeFileId = useEditorStore(s => s.activeFileId)
  const files = useEditorStore(s => s.files)
  const file = activeFileId ? findFile(files, activeFileId) : null

  return (
    <div className="h-[22px] bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px] shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 hover:bg-white/10 px-1.5 rounded cursor-pointer">
          <GitBranch size={12} />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1 hover:bg-white/10 px-1.5 rounded cursor-pointer">
          <XCircle size={12} />
          <span>0</span>
          <AlertTriangle size={12} className="ml-1" />
          <span>0</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {file && (
          <>
            <span className="hover:bg-white/10 px-1.5 rounded cursor-pointer">
              {file.language || 'Plain Text'}
            </span>
            <span className="hover:bg-white/10 px-1.5 rounded cursor-pointer">UTF-8</span>
          </>
        )}
        <div className="flex items-center gap-1 hover:bg-white/10 px-1.5 rounded cursor-pointer">
          <Check size={12} />
          <span>Prettier</span>
        </div>
        <div className="hover:bg-white/10 px-1.5 rounded cursor-pointer">
          <Bell size={12} />
        </div>
      </div>
    </div>
  )
}
