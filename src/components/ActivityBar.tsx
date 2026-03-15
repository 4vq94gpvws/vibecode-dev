import { Settings, Bot } from 'lucide-react'
import { getSettings } from '../services/settingsService'

interface ActivityBarProps {
  onOpenSettings: () => void
}

export function ActivityBar({ onOpenSettings }: ActivityBarProps) {
  const settings = getSettings()
  
  const getProviderLabel = () => {
    switch (settings.aiProvider.provider) {
      case 'claude':
        return 'Claude'
      case 'kimi':
        return 'Kimi'
      case 'openai':
        return 'OpenAI'
      case 'custom':
        return 'Custom'
      default:
        return 'AI'
    }
  }
  
  const getProviderColor = () => {
    switch (settings.aiProvider.provider) {
      case 'claude':
        return 'text-orange-400'
      case 'kimi':
        return 'text-purple-400'
      case 'openai':
        return 'text-green-400'
      case 'custom':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-400" />
          <span className="font-semibold text-white">VibeCode</span>
        </div>
        
        <div className="h-6 w-px bg-gray-600 mx-2" />
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/50 ${getProviderColor()}`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-sm font-medium">{getProviderLabel()}</span>
          <span className="text-xs text-gray-400">{settings.aiProvider.model}</span>
        </div>
      </div>
      
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm">Settings</span>
      </button>
    </header>
  )
}
