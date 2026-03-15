import { useState } from 'react'
import { GitBranch, GitCommit, RotateCcw, Check, Plus, Minus } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

function collectModified(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const n of nodes) {
    if (n.type === 'file' && n.isModified) result.push(n)
    if (n.children) result.push(...collectModified(n.children))
  }
  return result
}

export function GitPanel() {
  const files = useEditorStore(s => s.files)
  const [commitMsg, setCommitMsg] = useState('')
  const [staged, setStaged] = useState<Set<string>>(new Set())
  const [committed, setCommitted] = useState(false)

  const modified = collectModified(files)

  const toggleStage = (id: string) => {
    setStaged(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const stageAll = () => {
    setStaged(new Set(modified.map(f => f.id)))
  }

  const unstageAll = () => {
    setStaged(new Set())
  }

  const handleCommit = () => {
    if (!commitMsg.trim() || staged.size === 0) return
    setCommitted(true)
    setStaged(new Set())
    setCommitMsg('')
    setTimeout(() => setCommitted(false), 2000)
  }

  return (
    <div className="w-60 bg-[#252526] flex flex-col flex-shrink-0 overflow-hidden border-r border-[#3e3e42]">
      <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#bbbbbb] shrink-0">
        Source Control
      </div>

      {/* Commit input */}
      <div className="px-2 shrink-0">
        <div className="flex items-center bg-[#3c3c3c] rounded border border-transparent focus-within:border-[#007acc]">
          <input
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCommit()}
            placeholder="Message (Enter to commit)"
            className="flex-1 bg-transparent text-[#cccccc] text-[12px] px-2 py-1.5 outline-none placeholder-[#5a5a5a]"
          />
        </div>
        <button
          onClick={handleCommit}
          disabled={!commitMsg.trim() || staged.size === 0}
          className="w-full mt-1.5 py-1 text-[12px] bg-[#007acc] hover:bg-[#1a8ad4] disabled:opacity-40 text-white rounded transition-colors"
        >
          {committed ? (
            <span className="flex items-center justify-center gap-1"><Check size={12} /> Committed!</span>
          ) : (
            <span className="flex items-center justify-center gap-1"><GitCommit size={12} /> Commit</span>
          )}
        </button>
      </div>

      {/* Branch */}
      <div className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-[#858585] border-b border-[#3e3e42] mt-2">
        <GitBranch size={13} />
        <span>main</span>
      </div>

      {/* Staged */}
      {staged.size > 0 && (
        <div>
          <div className="flex items-center justify-between px-3 py-1 text-[11px] text-[#bbbbbb] uppercase tracking-wider">
            <span>Staged ({staged.size})</span>
            <button onClick={unstageAll} className="p-0.5 text-[#858585] hover:text-[#cccccc]" title="Unstage All">
              <Minus size={12} />
            </button>
          </div>
          {modified.filter(f => staged.has(f.id)).map(f => (
            <div
              key={f.id}
              onClick={() => toggleStage(f.id)}
              className="flex items-center gap-1.5 px-4 py-0.5 text-[12px] text-[#4ec9b0] hover:bg-[#2a2d2e] cursor-pointer"
            >
              <span className="truncate">{f.name}</span>
              <span className="ml-auto text-[10px] bg-[#2ea04333] px-1 rounded">S</span>
            </div>
          ))}
        </div>
      )}

      {/* Changes */}
      <div>
        <div className="flex items-center justify-between px-3 py-1 text-[11px] text-[#bbbbbb] uppercase tracking-wider">
          <span>Changes ({modified.filter(f => !staged.has(f.id)).length})</span>
          <button onClick={stageAll} className="p-0.5 text-[#858585] hover:text-[#cccccc]" title="Stage All">
            <Plus size={12} />
          </button>
        </div>
        {modified.filter(f => !staged.has(f.id)).map(f => (
          <div
            key={f.id}
            onClick={() => toggleStage(f.id)}
            className="flex items-center gap-1.5 px-4 py-0.5 text-[12px] text-[#e2c08d] hover:bg-[#2a2d2e] cursor-pointer"
          >
            <span className="truncate">{f.name}</span>
            <span className="ml-auto text-[10px] bg-[#c8860033] px-1 rounded">M</span>
          </div>
        ))}
        {modified.length === 0 && (
          <div className="px-4 py-4 text-[12px] text-[#858585] text-center">
            No changes detected.
            <br />
            <span className="text-[11px]">Edit a file to see changes here.</span>
          </div>
        )}
      </div>

      {/* Recent commits */}
      <div className="mt-auto border-t border-[#3e3e42]">
        <div className="px-3 py-1 text-[11px] text-[#bbbbbb] uppercase tracking-wider">
          Recent Commits
        </div>
        <div className="px-3 py-1 text-[11px] text-[#858585] flex items-center gap-1.5">
          <GitCommit size={12} />
          <span className="text-[#569cd6] font-mono">abc1234</span>
          <span className="truncate">Initial commit</span>
        </div>
      </div>
    </div>
  )
}
