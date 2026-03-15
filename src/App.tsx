import { useState, useEffect } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { SettingsModal } from './components/SettingsModal'
import { Toast } from './components/ui/Toast'
import { getSettings, type Settings } from './services/settingsService'
import { Folder, GitBranch, Terminal, Search, Command, Cpu, X, Minus, Square } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleSettingsSaved = () => {
    addToast('Settings saved successfully', 'success')
    setSettings(getSettings())
  }

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col overflow-hidden font-sans">
      {/* Topbar - macOS style */}
      <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4 shrink-0">
        {/* Left: Window controls + Search */}
        <div className="flex items-center gap-4">
          {/* macOS Window Controls */}
          <div className="flex items-center gap-2">
            <button className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center">
              <X className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
            </button>
            <button className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center">
              <Minus className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
            </button>
            <button className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 flex items-center justify-center">
              <Square className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-3 py-1.5 min-w-[300px]">
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Search files...</span>
          </div>
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-sm font-medium text-gray-400">vibecode-dev</span>
        </div>

        {/* Right: Upgrade button */}
        <div className="flex items-center gap-3">
          <button className="text-xs text-gray-400 hover:text-white transition-colors">
            Upgrade to Pro
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors"
            title="Settings"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activity Bar */}
        <ActivityBar />

        {/* Left Sidebar - Chat Panel */}
        <Sidebar />

        {/* Center - Main Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Welcome Screen */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Cursor Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>

            {/* Free Plan Badge */}
            <div className="mb-8">
              <span className="text-sm text-gray-500">Free Plan</span>
              <span className="text-sm text-gray-600 mx-2">•</span>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Upgrade
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded-md text-sm font-medium transition-colors">
                <Folder className="w-4 h-4" />
                Open project
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded-md text-sm font-medium transition-colors">
                <GitBranch className="w-4 h-4" />
                Clone repo
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded-md text-sm font-medium transition-colors">
                <Terminal className="w-4 h-4" />
                Connect via SSH
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={handleSettingsSaved}
        onShowToast={addToast}
      />

      {/* Toasts */}
      <div className="fixed bottom-12 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default App