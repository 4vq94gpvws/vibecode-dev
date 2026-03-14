import { 
  Files, 
  Search, 
  GitBranch, 
  Bot, 
  Settings,
  type LucideIcon 
} from 'lucide-react'

interface ActivityBarProps {
  activeView: string
  onViewChange: (view: 'explorer' | 'search' | 'git' | 'ai' | 'settings') => void
}

interface ActivityItem {
  id: 'explorer' | 'search' | 'git' | 'ai' | 'settings'
  icon: LucideIcon
  label: string
}

const activities: ActivityItem[] = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'ai', icon: Bot, label: 'AI Assistant' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-12 bg-editor-sidebar border-r border-editor-border flex flex-col items-center py-2">
      {activities.map((activity) => {
        const Icon = activity.icon
        const isActive = activeView === activity.id
        
        return (
          <button
            key={activity.id}
            onClick={() => onViewChange(activity.id)}
            className={`w-10 h-10 flex items-center justify-center rounded mb-1 transition-colors relative group ${
              isActive 
                ? 'text-white' 
                : 'text-editor-muted hover:text-editor-text'
            }`}
            title={activity.label}
          >
            {isActive && (
              <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />
            )}
            <Icon size={24} />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-editor-active text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {activity.label}
            </div>
          </button>
        )
      })}
    </div>
  )
}