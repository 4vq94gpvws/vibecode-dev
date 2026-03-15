import { useState } from 'react'
import { GitBranch, AlertTriangle, XCircle, Bell, Check, ChevronUp } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

function findFile(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) { const f = findFile(n.children, id); if (f) return f }
  }
  return null
}

const LANGUAGES = ['javascript', 'typescript', 'json', 'markdown', 'css', 'html', 'python', 'plaintext']
const ENCODINGS = ['UTF-8', 'UTF-16', 'ASCII', 'ISO-8859-1']
const BRANCHES = ['main', 'develop', 'feature/new-ui', 'bugfix/crash-fix']

export function StatusBar() {
  const activeFileId = useEditorStore(s => s.activeFileId)
  const files = useEditorStore(s => s.files)
  const updateFile = useEditorStore(s => s.updateFile)
  const file = activeFileId ? findFile(files, activeFileId) : null

  const [showLangPicker, setShowLangPicker] = useState(false)
  const [showEncodingPicker, setShowEncodingPicker] = useState(false)
  const [showBranchPicker, setShowBranchPicker] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [branch, setBranch] = useState('main')
  const [encoding, setEncoding] = useState('UTF-8')
  const [notifications] = useState(['No new notifications'])

  const closeAll = () => {
    setShowLangPicker(false)
    setShowEncodingPicker(false)
    setShowBranchPicker(false)
    setShowNotifications(false)
  }

  const handleLangChange = (lang: string) => {
    if (activeFileId) updateFile(activeFileId, { language: lang })
    closeAll()
  }

  const handleBranchChange = (b: string) => {
    setBranch(b)
    closeAll()
  }

  const handleEncodingChange = (enc: string) => {
    setEncoding(enc)
    closeAll()
  }

  return (
    <>
      {/* Dropup overlays */}
      {(showLangPicker || showEncodingPicker || showBranchPicker || showNotifications) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <div className="h-[22px] bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px] shrink-0 select-none relative z-50">
        <div className="flex items-center gap-1">
          {/* Branch Picker */}
          <div className="relative">
            <button
              onClick={() => { closeAll(); setShowBranchPicker(p => !p) }}
              className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors"
            >
              <GitBranch size={12} />
              <span>{branch}</span>
            </button>
            {showBranchPicker && (
              <div className="absolute bottom-full left-0 mb-1 bg-[#252526] border border-[#3e3e42] rounded-md shadow-xl min-w-[150px] py-1">
                {BRANCHES.map(b => (
                  <button
                    key={b}
                    onClick={() => handleBranchChange(b)}
                    className={`w-full text-left px-3 py-1 text-[12px] hover:bg-[#37373d] transition-colors ${b === branch ? 'text-[#007acc]' : 'text-[#cccccc]'}`}
                  >
                    {b === branch && <Check size={10} className="inline mr-1" />}
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-default">
            <XCircle size={12} />
            <span>0</span>
            <AlertTriangle size={12} className="ml-0.5" />
            <span>0</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {file && (
            <>
              {/* Language Picker */}
              <div className="relative">
                <button
                  onClick={() => { closeAll(); setShowLangPicker(p => !p) }}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors capitalize"
                >
                  {file.language || 'Plain Text'}
                </button>
                {showLangPicker && (
                  <div className="absolute bottom-full right-0 mb-1 bg-[#252526] border border-[#3e3e42] rounded-md shadow-xl min-w-[140px] py-1 max-h-[200px] overflow-y-auto">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLangChange(lang)}
                        className={`w-full text-left px-3 py-1 text-[12px] hover:bg-[#37373d] transition-colors capitalize ${lang === file.language ? 'text-[#007acc]' : 'text-[#cccccc]'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Encoding Picker */}
              <div className="relative">
                <button
                  onClick={() => { closeAll(); setShowEncodingPicker(p => !p) }}
                  className="hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors"
                >
                  {encoding}
                </button>
                {showEncodingPicker && (
                  <div className="absolute bottom-full right-0 mb-1 bg-[#252526] border border-[#3e3e42] rounded-md shadow-xl min-w-[120px] py-1">
                    {ENCODINGS.map(enc => (
                      <button
                        key={enc}
                        onClick={() => handleEncodingChange(enc)}
                        className={`w-full text-left px-3 py-1 text-[12px] hover:bg-[#37373d] transition-colors ${enc === encoding ? 'text-[#007acc]' : 'text-[#cccccc]'}`}
                      >
                        {enc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-default">
            <Check size={12} />
            <span>Prettier</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { closeAll(); setShowNotifications(p => !p) }}
              className="hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors"
            >
              <Bell size={12} />
            </button>
            {showNotifications && (
              <div className="absolute bottom-full right-0 mb-1 bg-[#252526] border border-[#3e3e42] rounded-md shadow-xl min-w-[180px] py-1">
                {notifications.map((n, i) => (
                  <div key={i} className="px-3 py-1.5 text-[12px] text-[#858585]">{n}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
