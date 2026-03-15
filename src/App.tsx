import { useState, useEffect, useRef, useCallback } from 'react'
import { FileExplorer } from './components/FileExplorer'
import { TabBar } from './components/TabBar'
import { CodeEditor } from './components/CodeEditor'
import { Terminal } from './components/Terminal'
import { StatusBar } from './components/StatusBar'
import { SettingsModal } from './components/SettingsModal'
import { Toast } from './components/ui/Toast'
import { ActivityBar } from './components/ActivityBar'
import { AIPanel } from './components/AIPanel'
import { getSettings, type Settings } from './services/settingsService'
import { Folder, GitBranch, Terminal as TerminalIcon, Search, Command, X, Loader2 } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

// Project type
interface Project {
  name: string
  path: string
  type: 'local' | 'git' | 'ssh'
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showSSHModal, setShowSSHModal] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [sshHost, setSshHost] = useState('')
  const [sshUser, setSshUser] = useState('')
  const [isTerminalVisible, setIsTerminalVisible] = useState(true)
  const [activePanel, setActivePanel] = useState('files')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  // Keyboard shortcut for terminal toggle (Ctrl+`)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setIsTerminalVisible(prev => !prev)
      }
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        setIsChatOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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

  const handlePanelSelect = (panel: string) => {
    if (panel === 'chat') {
      setIsChatOpen(prev => !prev)
    } else {
      setActivePanel(panel)
    }
  }

  // Upgrade to Pro
  const handleUpgrade = () => {
    setShowUpgradeModal(true)
  }

  // Open Project
  const handleOpenProject = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsLoading(true)
      setTimeout(() => {
        const projectName = files[0].name.split('/')[0] || 'New Project'
        setCurrentProject({
          name: projectName,
          path: files[0].webkitRelativePath || projectName,
          type: 'local'
        })
        setIsLoading(false)
        addToast(`Project "${projectName}" opened successfully`, 'success')
      }, 1000)
    }
  }

  // Clone Repo
  const handleCloneRepo = () => {
    setShowCloneModal(true)
  }

  const executeClone = () => {
    if (!repoUrl.trim()) {
      addToast('Please enter a repository URL', 'error')
      return
    }
    setIsLoading(true)
    setShowCloneModal(false)
    setTimeout(() => {
      const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'cloned-repo'
      setCurrentProject({
        name: repoName,
        path: repoUrl,
        type: 'git'
      })
      setIsLoading(false)
      setRepoUrl('')
      addToast(`Repository "${repoName}" cloned successfully`, 'success')
    }, 2000)
  }

  // Connect via SSH
  const handleConnectSSH = () => {
    setShowSSHModal(true)
  }

  const executeSSHConnect = () => {
    if (!sshHost.trim() || !sshUser.trim()) {
      addToast('Please enter both host and username', 'error')
      return
    }
    setIsLoading(true)
    setShowSSHModal(false)
    setTimeout(() => {
      setCurrentProject({
        name: `${sshUser}@${sshHost}`,
        path: `ssh://${sshUser}@${sshHost}`,
        type: 'ssh'
      })
      setIsLoading(false)
      setSshHost('')
      setSshUser('')
      addToast(`Connected to ${sshUser}@${sshHost}`, 'success')
    }, 1500)
  }

  // IDE Layout - shown when project is open
  if (currentProject) {
    return (
      <div className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col overflow-hidden font-sans">
        {/* Topbar - macOS style */}
        <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4 shrink-0">
          {/* Left: Search */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-3 py-1.5 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Search files...</span>
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">{currentProject.name}</span>
            <span className="text-xs text-gray-500 px-2 py-0.5 bg-[#3c3c3c] rounded">{currentProject.type}</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors"
              title="Settings"
            >
              <Command className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Activity Bar */}
          <ActivityBar
            activePanel={activePanel}
            isChatOpen={isChatOpen}
            onSelect={handlePanelSelect}
          />

          {/* File Explorer */}
          <FileExplorer />

          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <TabBar />
            <div className="flex-1 overflow-hidden">
              <CodeEditor />
            </div>
            {isTerminalVisible && (
              <div className="h-48 border-t border-[#3c3c3c]">
                <Terminal />
              </div>
            )}
          </div>

          {/* AI Chat Panel */}
          {isChatOpen && (
            <div className="w-[350px] flex-shrink-0 border-l border-[#3c3c3c]">
              <AIPanel />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSaved}
        />

        {/* Toasts */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    )
  }

  // Welcome Screen - shown when no project is open
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col overflow-hidden font-sans">
      {/* Topbar */}
      <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4 shrink-0">
        {/* Left: Search */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-3 py-1.5 min-w-[300px]">
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Search files...</span>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-300">vibecode.dev</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors"
            title="Settings"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl px-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">V</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to <span className="text-blue-400">vibecode.dev</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            The AI-powered code editor that helps you build faster
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={handleOpenProject}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Folder className="w-5 h-5" />}
              Open Project
            </button>
            <button
              onClick={handleCloneRepo}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#3c3c3c] hover:bg-[#4c4c4c] disabled:bg-[#2a2a2a] disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitBranch className="w-5 h-5" />}
              Clone Repository
            </button>
            <button
              onClick={handleConnectSSH}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#3c3c3c] hover:bg-[#4c4c4c] disabled:bg-[#2a2a2a] disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TerminalIcon className="w-5 h-5" />}
              Connect via SSH
            </button>
          </div>

          {/* Recent Projects */}
          <div className="mt-16">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Recent Projects
            </h2>
            <div className="text-gray-600 text-sm">
              No recent projects
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
        onSave={handleSettingsSaved}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#252526] rounded-xl border border-[#3c3c3c] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upgrade to Pro</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="p-1 hover:bg-[#3c3c3c] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mb-6">
              Unlock unlimited AI completions, advanced features, and priority support.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded-lg transition-colors">
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  addToast('Thank you for your interest in Pro!', 'success')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#252526] rounded-xl border border-[#3c3c3c] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Clone Repository</h2>
              <button onClick={() => setShowCloneModal(false)} className="p-1 hover:bg-[#3c3c3c] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Repository URL</label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo.git"
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloneModal(false)}
                className="flex-1 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={executeClone}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors">
                {isLoading ? 'Cloning...' : 'Clone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SSH Modal */}
      {showSSHModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#252526] rounded-xl border border-[#3c3c3c] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Connect via SSH</h2>
              <button onClick={() => setShowSSHModal(false)} className="p-1 hover:bg-[#3c3c3c] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Host</label>
              <input
                type="text"
                value={sshHost}
                onChange={(e) => setSshHost(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
              />
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={sshUser}
                onChange={(e) => setSshUser(e.target.value)}
                placeholder="root"
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSSHModal(false)}
                className="flex-1 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={executeSSHConnect}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors">
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default App
