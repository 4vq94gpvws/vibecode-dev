import { useState, useEffect, useRef, useCallback } from 'react'
import { FileExplorer } from './components/FileExplorer'
import { TabBar } from './components/TabBar'
import { CodeEditor } from './components/CodeEditor'
import { Terminal } from './components/Terminal'
import { StatusBar } from './components/StatusBar'
import { SettingsModal } from './components/SettingsModal'
import { Toast } from './components/ui/Toast'
import { getSettings, type Settings } from './services/settingsService'
import { Folder, GitBranch, Terminal as TerminalIcon, Search, Command, X, Minus, Square, Loader2, Check, AlertCircle } from 'lucide-react'

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

  // Window controls
  const handleClose = () => {
    addToast('Window close requested', 'info')
  }

  const handleMinimize = () => {
    addToast('Window minimized', 'info')
  }

  const handleMaximize = () => {
    addToast('Window maximized', 'info')
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
          {/* Left: Window controls + Search */}
          <div className="flex items-center gap-4">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-2">
              <button onClick={handleClose} className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center">
                <X className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
              </button>
              <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center">
                <Minus className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
              </button>
              <button onClick={handleMaximize} className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 flex items-center justify-center">
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
            <span className="text-sm font-medium text-gray-400">
              {currentProject.name}
            </span>
          </div>

          {/* Right: Upgrade button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpgrade}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors">
              <Command className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main IDE Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: File Explorer (250px) */}
          <div className="w-[250px] shrink-0">
            <FileExplorer />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tab Bar */}
            <TabBar />
            
            {/* Editor Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <CodeEditor />
              </div>
              
              {/* Terminal (200px height, toggleable) */}
              {isTerminalVisible && (
                <div className="h-[200px] shrink-0 border-t border-[#3c3c3c]">
                  <Terminal />
                </div>
              )}
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

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
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

  // Welcome Screen - shown when no project is open
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col overflow-hidden font-sans">
      {/* Hidden file input for folder selection */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Topbar - macOS style */}
      <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4 shrink-0">
        {/* Left: Window controls + Search */}
        <div className="flex items-center gap-4">
          {/* macOS Window Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handleClose} className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center">
              <X className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
            </button>
            <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center">
              <Minus className="w-2 h-2 text-[#1e1e1e] opacity-0 hover:opacity-100" />
            </button>
            <button onClick={handleMaximize} className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 flex items-center justify-center">
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
          <span className="text-sm font-medium text-gray-400">
            vibecode-dev
          </span>
        </div>

        {/* Right: Upgrade button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpgrade}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity">
            Upgrade to Pro
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors">
            <Command className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Welcome Screen Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl px-8">
          {/* Logo / Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Command className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to vibecode.dev
          </h1>
          <p className="text-lg text-gray-400 mb-12">
            AI-powered code editor with intelligent agents
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpenProject}
              disabled={isLoading}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Folder className="w-5 h-5" />
              )}
              {isLoading ? 'Opening...' : 'Open project'}
            </button>
            
            <button
              onClick={handleCloneRepo}
              disabled={isLoading}
              className="flex items-center gap-3 px-8 py-4 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <GitBranch className="w-5 h-5" />
              Clone repository
            </button>
            
            <button
              onClick={handleConnectSSH}
              disabled={isLoading}
              className="flex items-center gap-3 px-8 py-4 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <TerminalIcon className="w-5 h-5" />
              Connect via SSH
            </button>
          </div>

          {/* Recent Projects (placeholder) */}
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
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Unlimited AI Agents</h3>
                  <p className="text-sm text-gray-400">Run multiple AI agents simultaneously</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Priority Support</h3>
                  <p className="text-sm text-gray-400">Get help within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Advanced Features</h3>
                  <p className="text-sm text-gray-400">Access to beta features and custom models</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-2 text-gray-400 hover:text-white transition-colors">
                Maybe later
              </button>
              <button onClick={() => { setShowUpgradeModal(false); addToast('Upgrade feature coming soon!', 'info') }} className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Repo Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#252526] rounded-xl border border-[#3c3c3c] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Clone Repository</h2>
              <button onClick={() => setShowCloneModal(false)} className="p-1 hover:bg-[#3c3c3c] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#4c4c4c] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCloneModal(false)} className="flex-1 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={executeClone} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Clone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SSH Connect Modal */}
      {showSSHModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#252526] rounded-xl border border-[#3c3c3c] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Connect via SSH</h2>
              <button onClick={() => setShowSSHModal(false)} className="p-1 hover:bg-[#3c3c3c] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Host</label>
                <input
                  type="text"
                  value={sshHost}
                  onChange={(e) => setSshHost(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#4c4c4c] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={sshUser}
                  onChange={(e) => setSshUser(e.target.value)}
                  placeholder="user"
                  className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#4c4c4c] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSSHModal(false)} className="flex-1 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={executeSSHConnect} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
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