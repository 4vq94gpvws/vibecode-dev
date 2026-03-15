import { useState, useEffect, useRef } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { SettingsModal } from './components/SettingsModal'
import { Toast } from './components/ui/Toast'
import { getSettings, type Settings } from './services/settingsService'
import { Folder, GitBranch, Terminal, Search, Command, X, Minus, Square, Loader2, Check, AlertCircle } from 'lucide-react'

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
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showSSHModal, setShowSSHModal] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [sshHost, setSshHost] = useState('')
  const [sshUser, setSshUser] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-gray-300 flex flex-col overflow-hidden font-sans">
      {/* Hidden file input for folder selection */}
      <input
        ref={fileInputRef}
        type="file"
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
            {currentProject ? currentProject.name : 'vibecode-dev'}
          </span>
        </div>

        {/* Right: Upgrade button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpgrade}
            className="text-xs text-gray-400 hover:text-white transition-colors">
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
        <ActivityBar onShowToast={addToast} />

        {/* Left Sidebar - Chat Panel */}
        <Sidebar onShowToast={addToast} currentProject={currentProject} />

        {/* Center - Main Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Welcome Screen or Project View */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : currentProject ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                  <Folder className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">{currentProject.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{currentProject.path}</p>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Connected ({currentProject.type})</span>
                </div>
              </div>
            ) : (
              <>
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
                  <button onClick={handleUpgrade} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Upgrade
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenProject}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded-md text-sm font-medium transition-colors">
                    <Folder className="w-4 h-4" />
                    Open project
                  </button>
                  <button
                    onClick={handleCloneRepo}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded-md text-sm font-medium transition-colors">
                    <GitBranch className="w-4 h-4" />
                    Clone repo
                  </button>
                  <button
                    onClick={handleConnectSSH}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded-md text-sm font-medium transition-colors">
                    <Terminal className="w-4 h-4" />
                    Connect via SSH
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar currentProject={currentProject} onShowToast={addToast} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={handleSettingsSaved}
        onShowToast={addToast}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#252526] rounded-xl border border-[#3c3c3c] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upgrade to Pro</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="p-1 hover:bg-[#3c3c3c] rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#3c3c3c] rounded-lg">
                <h3 className="font-medium text-white mb-2">Pro Features</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited AI requests</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Priority support</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced AI models</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Team collaboration</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  addToast('Redirecting to payment...', 'info')
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Upgrade Now - $20/month
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
                <X className="w-5 h-5 text-gray-400" />
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
                  className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#4c4c4c] rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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
                <X className="w-5 h-5 text-gray-400" />
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
                  className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#4c4c4c] rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={sshUser}
                  onChange={(e) => setSshUser(e.target.value)}
                  placeholder="root"
                  className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#4c4c4c] rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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