import { useState } from 'react'
import { 
  MessageSquare, 
  Search, 
  GitBranch, 
  Bug, 
  Puzzle, 
  Settings, 
  User, 
  Plus,
  Clock,
  MoreHorizontal
} from 'lucide-react'

interface ActivityItem {
  id: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

export function ActivityBar() {
  const [activeItem, setActiveItem] = useState('chat')

  const activityItems: ActivityItem[] = [
    { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat', active: true },
    { id: 'search', icon: <Search className="w-5 h-5" />, label: 'Search' },
    { id: 'git', icon: <GitBranch className="w-5 h-5" />, label: 'Source Control' },
    { id: 'debug', icon: <Bug className="w-5 h-5" />, label: 'Debug' },
    { id: 'extensions', icon: <Puzzle className="w-5 h-5" />, label: 'Extensions' },
  ]

  const bottomItems: ActivityItem[] = [
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    { id: 'account', icon: <User className="w-5 h-5" />, label: 'Account' },
  ]

  return (
    <div className="w-12 bg-[#252526] border-r border-[#3c3c3c] flex flex-col items-center py-2 shrink-0">
      {/* Top Activity Icons */}
      <div className="flex flex-col gap-1">
        {activityItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors relative ${
              activeItem === item.id 
                ? 'text-white bg-[#3c3c3c]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#3c3c3c]/50'
            }`}
            title={item.label}
          >
            {item.icon}
            {activeItem === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r" />
            )}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Activity Icons */}
      <div className="flex flex-col gap-1 pb-2">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-[#3c3c3c]/50 transition-colors"
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}