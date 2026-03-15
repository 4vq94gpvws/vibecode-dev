import { Files, Search, GitBranch, Bug, Puzzle, Settings, MessageSquare } from 'lucide-react'

interface ActivityBarProps {
  activePanel: string
  isChatOpen: boolean
  onSelect: (panel: string) => void
}

export function ActivityBar({ activePanel, isChatOpen, onSelect }: ActivityBarProps) {
  const topItems = [
    { id: 'files', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
    { id: 'debug', icon: Bug, label: 'Run and Debug' },
    { id: 'extensions', icon: Puzzle, label: 'Extensions' },
  ]

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-1 flex-shrink-0 border-r border-[#252526]">
      <div className="flex flex-col items-center gap-0.5 flex-1">
        {topItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => onSelect(id)}
            className={`w-10 h-10 flex items-center justify-center transition-colors relative ${
              activePanel === id
                ? 'text-white'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            <Icon size={22} />
            {activePanel === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r" />
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5 pb-1">
        <button
          title="AI Chat (Ctrl+L)"
          onClick={() => onSelect('chat')}
          className={`w-10 h-10 flex items-center justify-center transition-colors relative ${
            isChatOpen
              ? 'text-white'
              : 'text-[#858585] hover:text-white'
          }`}
        >
          <MessageSquare size={22} />
          {isChatOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r" />
          )}
        </button>
        <button
          title="Settings"
          className="w-10 h-10 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
        >
          <Settings size={22} />
        </button>
      </div>
    </div>
  )
}
