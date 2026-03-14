import { useState } from 'react'
import { Search, Replace, ChevronRight, ChevronDown } from 'lucide-react'

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)
  const [isRegex, setIsRegex] = useState(false)

  // Mock search results
  const mockResults = query ? [
    { file: 'src/main.js', line: 5, content: `console.log('${query}');` },
    { file: 'src/utils.js', line: 12, content: `return ${query};` },
  ] : []

  return (
    <div className="p-4">
      {/* Search Input */}
      <div className="relative mb-2">
        <Search size={14} className="absolute left-2 top-2.5 text-editor-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-editor-bg text-editor-text text-sm pl-8 pr-8 py-1.5 rounded border border-editor-border outline-none focus:border-editor-accent"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-2 text-editor-muted hover:text-editor-text"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Replace Input */}
      {showReplace && (
        <div className="relative mb-2">
          <Replace size={14} className="absolute left-2 top-2.5 text-editor-muted" />
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace"
            className="w-full bg-editor-bg text-editor-text text-sm pl-8 pr-8 py-1.5 rounded border border-editor-border outline-none focus:border-editor-accent"
          />
        </div>
      )}
      
      {/* Options */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="text-xs text-editor-muted hover:text-editor-text flex items-center gap-1"
        >
          {showReplace ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Replace
        </button>
        <label className="flex items-center gap-1 text-xs text-editor-muted cursor-pointer">
          <input
            type="checkbox"
            checked={isCaseSensitive}
            onChange={(e) => setIsCaseSensitive(e.target.checked)}
            className="rounded"
          />
          Aa
        </label>
        <label className="flex items-center gap-1 text-xs text-editor-muted cursor-pointer">
          <input
            type="checkbox"
            checked={isRegex}
            onChange={(e) => setIsRegex(e.target.checked)}
            className="rounded"
          />
          .*
        </label>
      </div>
      
      {/* Results */}
      {mockResults.length > 0 && (
        <div>
          <div className="text-xs text-editor-muted mb-2">
            {mockResults.length} results in 2 files
          </div>
          {mockResults.map((result, index) => (
            <div
              key={index}
              className="py-2 px-2 hover:bg-editor-hover cursor-pointer border-l-2 border-transparent hover:border-editor-accent"
            >
              <div className="text-xs text-editor-muted mb-1">{result.file}</div>
              <div className="text-sm text-editor-text font-mono">
                {result.content.split(query).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="bg-yellow-600/50 text-white">{query}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}