import { Files, Search, GitBranch, MessageSquare, Settings } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

type ViewType = 'explorer' | 'search' | 'git' | 'settings'

const topItems: { id: ViewType; icon: typeof Files; label: string }[] = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
]

interface Props {
  chatOpen: boolean
  onToggleChat: () => void
}

export function ActivityBar({ chatOpen, onToggleChat }: Props) {
  const activeView = useEditorStore(s => s.activeView)
  const setActiveView = useEditorStore(s => s.setActiveView)

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center pt-0.5 flex-shrink-0 select-none">
      <div className="flex flex-col items-center flex-1">
        {topItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => setActiveView(id)}
            className={`w-12 h-12 flex items-center justify-center relative transition-colors ${
              activeView === id ? 'text-white' : 'text-[#858585] hover:text-white'
            }`}
          >
            <Icon size={24} strokeWidth={1.5} />
            {activeView === id && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white rounded-r" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center pb-1">
        <button
          title="AI Chat (Ctrl+L)"
          onClick={onToggleChat}
          className={`w-12 h-12 flex items-center justify-center relative transition-colors ${
            chatOpen ? 'text-white' : 'text-[#858585] hover:text-white'
          }`}
        >
          <MessageSquare size={24} strokeWidth={1.5} />
          {chatOpen && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white rounded-r" />
          )}
        </button>
        <button
          title="Settings"
          onClick={() => setActiveView('settings')}
          className={`w-12 h-12 flex items-center justify-center relative transition-colors ${
            activeView === 'settings' ? 'text-white' : 'text-[#858585] hover:text-white'
          }`}
        >
          <Settings size={24} strokeWidth={1.5} />
          {activeView === 'settings' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white rounded-r" />
          )}
        </button>
      </div>
    </div>
  )
}
