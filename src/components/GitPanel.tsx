import { GitBranch, GitCommit, GitPullRequest, Plus, Check } from 'lucide-react'

export function GitPanel() {
  const changes = [
    { file: 'src/main.js', status: 'modified', additions: 5, deletions: 2 },
    { file: 'package.json', status: 'modified', additions: 1, deletions: 0 },
    { file: 'README.md', status: 'untracked', additions: 10, deletions: 0 },
  ]

  return (
    <div className="p-4">
      {/* Branch Info */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-editor-border">
        <GitBranch size={16} className="text-editor-muted" />
        <span className="text-sm text-editor-text">main</span>
        <span className="text-xs text-editor-muted ml-auto">0↓ 0↑</span>
      </div>
      
      {/* Changes Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-editor-muted uppercase">Changes</span>
          <button className="text-xs text-editor-accent hover:underline">
            + Stage All
          </button>
        </div>
        
        {changes.map((change, index) => (
          <div
            key={index}
            className="flex items-center gap-2 py-1.5 px-2 hover:bg-editor-hover cursor-pointer group"
          >
            <button className="opacity-0 group-hover:opacity-100 text-editor-muted hover:text-editor-text">
              <Plus size={14} />
            </button>
            <span className={`text-xs ${
              change.status === 'modified' ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {change.status === 'modified' ? 'M' : 'U'}
            </span>
            <span className="text-sm text-editor-text flex-1 truncate">
              {change.file}
            </span>
            <span className="text-xs text-editor-muted">
              +{change.additions} -{change.deletions}
            </span>
          </div>
        ))}
      </div>
      
      {/* Message Input */}
      <div className="mb-4">
        <textarea
          placeholder="Message (Ctrl+Enter to commit)"
          className="w-full bg-editor-bg text-editor-text text-sm p-2 rounded border border-editor-border outline-none focus:border-editor-accent resize-none h-16"
        />
        <button className="w-full mt-2 py-1.5 bg-editor-accent text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Check size={14} />
          Commit
        </button>
      </div>
      
      {/* Recent Commits */}
      <div>
        <span className="text-xs font-semibold text-editor-muted uppercase">Recent Commits</span>
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2">
            <GitCommit size={14} className="text-editor-muted mt-0.5" />
            <div>
              <div className="text-sm text-editor-text">Initial commit</div>
              <div className="text-xs text-editor-muted">You • 2 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}