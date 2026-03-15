import { useState, useEffect, useRef } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { FileExplorer } from './components/FileExplorer'
import { TabBar } from './components/TabBar'
import { CodeEditor } from './components/CodeEditor'
import { Terminal } from './components/Terminal'
import { AIPanel } from './components/AIPanel'
import { StatusBar } from './components/StatusBar'
import { useEditorStore, FileNode } from './store/editorStore'
import { Folder, GitBranch, Terminal as TerminalIcon, Loader2 } from 'lucide-react'

const extToLang: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  json: 'json', md: 'markdown', css: 'css', html: 'html', py: 'python',
  yml: 'yaml', yaml: 'yaml', sh: 'shell', txt: 'text',
}

function App() {
  const setFiles = useEditorStore(s => s.setFiles)
  const [chatOpen, setChatOpen] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [hasProject, setHasProject] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); setChatOpen(p => !p) }
      if (e.ctrlKey && e.key === '`') { e.preventDefault(); setTerminalOpen(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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

    // Build tree from flat paths
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
    setHasProject(true)
    setIsLoading(false)
  }

  // Use demo project
  const handleDemo = () => {
    setProjectName('project')
    setHasProject(true)
  }

  // Hidden file input
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

  // ─── Welcome Screen ───
  if (!hasProject) {
    return (
      <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">vibecode.dev</h1>
            <p className="text-[#858585] mb-8">AI-powered code editor</p>

            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#007acc] hover:bg-[#1a8ad4] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Folder size={16} />}
                Open Folder
              </button>
              <button
                onClick={handleDemo}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2d2d30] hover:bg-[#3c3c3c] text-[#cccccc] rounded-lg text-sm font-medium transition-colors border border-[#3e3e42]"
              >
                <TerminalIcon size={16} />
                Try Demo Project
              </button>
            </div>

            <p className="text-[11px] text-[#5a5a5a] mt-6">
              Open a local folder or try the demo project to get started.
            </p>
          </div>
        </div>
        <StatusBar />
        {fileInput}
      </div>
    )
  }

  // ─── IDE Layout ───
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="h-[30px] bg-[#2d2d30] flex items-center justify-center text-[12px] text-[#969696] shrink-0 border-b border-[#252526]">
        {projectName} — vibecode.dev
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar chatOpen={chatOpen} onToggleChat={() => setChatOpen(p => !p)} />
        <FileExplorer />

        {/* Editor + Terminal */}
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
