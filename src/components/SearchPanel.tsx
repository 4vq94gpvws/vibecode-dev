import { useState, useMemo } from 'react'
import { Search, X, ChevronRight, ChevronDown, Replace } from 'lucide-react'
import { useEditorStore, FileNode } from '../store/editorStore'

function collectFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const n of nodes) {
    if (n.type === 'file') result.push(n)
    if (n.children) result.push(...collectFiles(n.children))
  }
  return result
}

interface SearchResult {
  fileId: string
  fileName: string
  line: number
  text: string
  col: number
}

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const files = useEditorStore(s => s.files)
  const openTab = useEditorStore(s => s.openTab)
  const updateFileContent = useEditorStore(s => s.updateFileContent)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const allFiles = collectFiles(files)
    const matches: SearchResult[] = []

    for (const file of allFiles) {
      if (!file.content) continue
      const lines = file.content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const searchLine = caseSensitive ? line : line.toLowerCase()
        const searchQuery = caseSensitive ? query : query.toLowerCase()

        if (useRegex) {
          try {
            const re = new RegExp(query, caseSensitive ? 'g' : 'gi')
            const match = re.exec(line)
            if (match) {
              matches.push({ fileId: file.id, fileName: file.name, line: i + 1, text: line.trim(), col: match.index })
            }
          } catch { /* invalid regex */ }
        } else {
          const idx = searchLine.indexOf(searchQuery)
          if (idx !== -1) {
            matches.push({ fileId: file.id, fileName: file.name, line: i + 1, text: line.trim(), col: idx })
          }
        }
      }
    }
    // Auto-expand all matched files
    setExpandedFiles(new Set(matches.map(m => m.fileId)))
    return matches
  }, [query, files, caseSensitive, useRegex])

  const resultsByFile = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of results) {
      if (!map.has(r.fileId)) map.set(r.fileId, [])
      map.get(r.fileId)!.push(r)
    }
    return map
  }, [results])

  const handleReplace = (fileId: string, line: number) => {
    const allFiles = collectFiles(files)
    const file = allFiles.find(f => f.id === fileId)
    if (!file?.content) return
    const lines = file.content.split('\n')
    if (useRegex) {
      try {
        lines[line - 1] = lines[line - 1].replace(new RegExp(query, caseSensitive ? '' : 'i'), replaceText)
      } catch { return }
    } else {
      const searchLine = caseSensitive ? lines[line - 1] : lines[line - 1].toLowerCase()
      const searchQuery = caseSensitive ? query : query.toLowerCase()
      const idx = searchLine.indexOf(searchQuery)
      if (idx !== -1) {
        lines[line - 1] = lines[line - 1].substring(0, idx) + replaceText + lines[line - 1].substring(idx + query.length)
      }
    }
    updateFileContent(fileId, lines.join('\n'))
  }

  const handleReplaceAll = () => {
    for (const [fileId, fileResults] of resultsByFile) {
      for (const r of fileResults.reverse()) {
        handleReplace(fileId, r.line)
      }
    }
  }

  const toggleFile = (fileId: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev)
      next.has(fileId) ? next.delete(fileId) : next.add(fileId)
      return next
    })
  }

  return (
    <div className="w-60 bg-[#252526] flex flex-col flex-shrink-0 overflow-hidden border-r border-[#3e3e42]">
      <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#bbbbbb] shrink-0">
        Search
      </div>

      <div className="px-2 space-y-1.5 shrink-0">
        {/* Search input */}
        <div className="flex items-center gap-1">
          <button onClick={() => setShowReplace(p => !p)} className="p-0.5 text-[#858585] hover:text-[#cccccc]">
            {showReplace ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <div className="flex-1 flex items-center bg-[#3c3c3c] rounded border border-transparent focus-within:border-[#007acc]">
            <Search size={13} className="ml-1.5 text-[#858585] shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-[#cccccc] text-[12px] px-1.5 py-1 outline-none placeholder-[#5a5a5a]"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5 mr-0.5 text-[#858585] hover:text-[#cccccc]">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2 pl-5">
          <button
            onClick={() => setCaseSensitive(p => !p)}
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${caseSensitive ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'}`}
          >
            Aa
          </button>
          <button
            onClick={() => setUseRegex(p => !p)}
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${useRegex ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'}`}
          >
            .*
          </button>
        </div>

        {/* Replace input */}
        {showReplace && (
          <div className="flex items-center gap-1 pl-5">
            <div className="flex-1 flex items-center bg-[#3c3c3c] rounded border border-transparent focus-within:border-[#007acc]">
              <input
                value={replaceText}
                onChange={e => setReplaceText(e.target.value)}
                placeholder="Replace"
                className="flex-1 bg-transparent text-[#cccccc] text-[12px] px-2 py-1 outline-none placeholder-[#5a5a5a]"
              />
            </div>
            <button
              onClick={handleReplaceAll}
              disabled={results.length === 0}
              className="p-1 text-[#858585] hover:text-[#cccccc] disabled:opacity-30"
              title="Replace All"
            >
              <Replace size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto mt-2">
        {query && (
          <div className="px-3 py-1 text-[11px] text-[#858585]">
            {results.length} result{results.length !== 1 ? 's' : ''} in {resultsByFile.size} file{resultsByFile.size !== 1 ? 's' : ''}
          </div>
        )}

        {Array.from(resultsByFile).map(([fileId, fileResults]) => (
          <div key={fileId}>
            <div
              onClick={() => toggleFile(fileId)}
              className="flex items-center gap-1 px-2 py-0.5 text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer"
            >
              {expandedFiles.has(fileId) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="truncate">{fileResults[0].fileName}</span>
              <span className="ml-auto text-[10px] text-[#858585] bg-[#3c3c3c] px-1.5 rounded-full">{fileResults.length}</span>
            </div>
            {expandedFiles.has(fileId) && fileResults.map((r, i) => (
              <div
                key={i}
                onClick={() => openTab(fileId)}
                className="flex items-center px-6 py-0.5 text-[12px] text-[#bbbbbb] hover:bg-[#2a2d2e] cursor-pointer"
              >
                <span className="text-[#858585] w-8 shrink-0 text-right mr-2">{r.line}</span>
                <span className="truncate font-mono text-[11px]">
                  {r.text.substring(0, r.col)}
                  <span className="bg-[#613214] text-[#e8ab6a]">{r.text.substring(r.col, r.col + query.length)}</span>
                  {r.text.substring(r.col + query.length)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
