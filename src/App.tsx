import { useState, useEffect, useRef, useCallback } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { FileExplorer } from './components/FileExplorer'
import { SearchPanel } from './components/SearchPanel'
import { GitPanel } from './components/GitPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { TabBar } from './components/TabBar'
import { CodeEditor } from './components/CodeEditor'
import { Terminal } from './components/Terminal'
import { AIPanel } from './components/AIPanel'
import { StatusBar } from './components/StatusBar'
import { AuthPage } from './components/AuthPage'
import { useEditorStore, FileNode } from './store/editorStore'
import { useAuth } from './lib/useAuth'
import { listProjects, loadProject, saveProject, deleteProject, type Project } from './lib/projects'
import { Folder, Terminal as TerminalIcon, Loader2, Plus, Trash2, LogOut, Cloud, Clock } from 'lucide-react'

const extToLang: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  json: 'json', md: 'markdown', css: 'css', html: 'html', py: 'python',
  yml: 'yaml', yaml: 'yaml', sh: 'shell', txt: 'text',
}

function App() {
  const setFiles = useEditorStore(s => s.setFiles)
  const files = useEditorStore(s => s.files)
  const activeView = useEditorStore(s => s.activeView)
  const [chatOpen, setChatOpen] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [hasProject, setHasProject] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>()

  const { user, loading: authLoading, signIn, signUp, signInWithGithub, signInWithGoogle, signOut, resetPassword } = useAuth()

  // Load user projects on login
  useEffect(() => {
    if (user) {
      setLoadingProjects(true)
      listProjects()
        .then(setProjects)
        .catch(() => {})
        .finally(() => setLoadingProjects(false))
    }
  }, [user])

  // Auto-save every 30s when project is open
  const doSave = useCallback(async () => {
    if (!projectId || !user) return
    setSaving(true)
    try {
      await saveProject(projectName, files, projectId)
      setLastSaved(new Date())
    } catch {}
    setSaving(false)
  }, [projectId, projectName, files, user])

  useEffect(() => {
    if (!hasProject || !projectId) return
    autoSaveTimer.current = setInterval(doSave, 30000)
    return () => clearInterval(autoSaveTimer.current)
  }, [hasProject, projectId, doSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); setChatOpen(p => !p) }
      if (e.ctrlKey && e.key === '`') { e.preventDefault(); setTerminalOpen(p => !p) }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); doSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [doSave])

  // Upload a project folder
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    setIsLoading(true)

    const firstPath = fileList[0].webkitRelativePath || fileList[0].name
    const name = firstPath.split('/')[0] || 'project'

    const entries: { path: string; content: string }[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const relPath = file.webkitRelativePath || file.name
      if (/\/(node_modules|\.git|dist|build|\.next)\//.test('/' + relPath)) continue
      if (file.size > 500 * 1024) continue
      try {
        const text = await file.text()
        const stripped = relPath.includes('/') ? relPath.substring(relPath.indexOf('/') + 1) : relPath
        entries.push({ path: stripped, content: text })
      } catch { /* skip binary */ }
    }

    const root: FileNode = { id: 'root', name, type: 'directory', isOpen: true, parentId: null, children: [] }
    for (const entry of entries) {
      const parts = entry.path.split('/')
      let current = root
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isFile = i === parts.length - 1
        if (isFile) {
          const ext = part.split('.').pop()?.toLowerCase() || ''
          current.children!.push({
            id: entry.path,
            name: part,
            type: 'file',
            content: entry.content,
            language: extToLang[ext] || 'text',
            parentId: current.id,
          })
        } else {
          let dir = current.children!.find(c => c.name === part && c.type === 'directory')
          if (!dir) {
            const dirId = parts.slice(0, i + 1).join('/')
            dir = { id: dirId, name: part, type: 'directory', isOpen: true, parentId: current.id, children: [] }
            current.children!.push(dir)
          }
          current = dir
        }
      }
    }

    setFiles([root])
    setProjectName(name)

    // Save to Supabase
    if (user) {
      try {
        const project = await saveProject(name, [root])
        setProjectId(project.id)
        setProjects(prev => [project, ...prev])
      } catch {}
    }

    setHasProject(true)
    setIsLoading(false)
  }

  const handleDemo = async () => {
    setProjectName('demo-project')
    if (user) {
      try {
        const project = await saveProject('demo-project', useEditorStore.getState().files)
        setProjectId(project.id)
        setProjects(prev => [project, ...prev])
      } catch {}
    }
    setHasProject(true)
  }

  const handleOpenProject = async (project: Project) => {
    setIsLoading(true)
    try {
      const full = await loadProject(project.id)
      setFiles(full.files)
      setProjectName(full.name)
      setProjectId(full.id)
      setHasProject(true)
    } catch {}
    setIsLoading(false)
  }

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const handleBackToProjects = async () => {
    if (projectId) await doSave()
    setHasProject(false)
    setProjectId(null)
    // Refresh project list
    listProjects().then(setProjects).catch(() => {})
  }

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      /* @ts-ignore */
      webkitdirectory=""
      directory=""
      className="hidden"
      onChange={handleFileSelect}
    />
  )

  const renderSidebar = () => {
    switch (activeView) {
      case 'search': return <SearchPanel />
      case 'git': return <GitPanel />
      case 'settings': return <SettingsPanel />
      default: return <FileExplorer />
    }
  }

  // ─── Auth Loading ───
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#007acc]" />
      </div>
    )
  }

  // ─── Auth Gate ───
  if (!user) {
    return (
      <AuthPage
        onSignIn={signIn}
        onSignUp={signUp}
        onGithub={signInWithGithub}
        onGoogle={signInWithGoogle}
        onResetPassword={resetPassword}
      />
    )
  }

  // ─── Project Dashboard ───
  if (!hasProject) {
    return (
      <div className="h-screen w-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">VibeDraft.Dev</h1>
                  <p className="text-[#8b949e] text-xs">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] hover:text-white hover:bg-[#21262d] rounded-lg transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#007acc] hover:bg-[#1a8ad4] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Folder size={16} />}
                Open Folder
              </button>
              <button
                onClick={handleDemo}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-lg text-sm font-medium transition-colors border border-[#30363d]"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>

            {/* Recent Projects */}
            <div>
              <h2 className="text-sm font-medium text-[#8b949e] mb-3 flex items-center gap-2">
                <Cloud size={14} />
                Your Projects
              </h2>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-[#484f58]" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-[#484f58] text-sm">
                  No projects yet. Open a folder or start a new project.
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleOpenProject(p)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#161b22] rounded-lg transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder size={16} className="text-[#007acc] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-[#c9d1d9] truncate">{p.name}</p>
                          <p className="text-[10px] text-[#484f58] flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(p.updated_at).toLocaleDateString()} {new Date(p.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="p-1.5 text-[#484f58] hover:text-[#f85149] hover:bg-[#f8514915] rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-8 bg-[#161b22] border-t border-[#21262d] flex items-center px-4 text-[11px] text-[#484f58]">
          VibeDraft.Dev — AI-powered code editor
        </div>
        {fileInput}
      </div>
    )
  }

  // ─── IDE Layout ───
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="h-[30px] bg-[#2d2d30] flex items-center justify-between px-3 shrink-0 border-b border-[#252526]">
        <button
          onClick={handleBackToProjects}
          className="text-[11px] text-[#858585] hover:text-white transition-colors"
        >
          &larr; Projects
        </button>
        <div className="flex items-center gap-2 text-[12px] text-[#969696]">
          <span>{projectName}</span>
          <span className="text-[#3e3e42]">—</span>
          <span>VibeDraft.Dev</span>
          {saving && <Loader2 size={10} className="animate-spin text-[#007acc]" />}
          {!saving && lastSaved && (
            <span className="text-[10px] text-[#3e3e42]">
              saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={doSave}
            className="text-[10px] text-[#858585] hover:text-white px-1.5 py-0.5 hover:bg-[#3c3c3c] rounded transition-colors"
            title="Save (Ctrl+S)"
          >
            <Cloud size={12} />
          </button>
          <button
            onClick={signOut}
            className="text-[10px] text-[#858585] hover:text-white px-1.5 py-0.5 hover:bg-[#3c3c3c] rounded transition-colors"
            title="Sign out"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar chatOpen={chatOpen} onToggleChat={() => setChatOpen(p => !p)} />
        {renderSidebar()}

        <div className="flex-1 flex flex-col min-w-0">
          <TabBar />
          <CodeEditor />
          {terminalOpen && (
            <div className="h-[200px] shrink-0">
              <Terminal onClose={() => setTerminalOpen(false)} />
            </div>
          )}
        </div>

        {chatOpen && <AIPanel onClose={() => setChatOpen(false)} />}
      </div>

      <StatusBar />
      {fileInput}
    </div>
  )
}

export default App
