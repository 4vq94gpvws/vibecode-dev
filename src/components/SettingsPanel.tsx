import { useState } from 'react'

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'about'>('editor')
  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(2)
  const [wordWrap, setWordWrap] = useState(true)
  const [minimap, setMinimap] = useState(true)
  const [lineNumbers, setLineNumbers] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [provider, setProvider] = useState('claude')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="w-60 bg-[#252526] flex flex-col flex-shrink-0 overflow-hidden border-r border-[#3e3e42]">
      <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#bbbbbb] shrink-0">
        Settings
      </div>

      {/* Tabs */}
      <div className="flex px-2 gap-1 shrink-0">
        {(['editor', 'ai', 'about'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 text-[11px] rounded transition-colors capitalize ${
              activeTab === tab
                ? 'bg-[#37373d] text-white'
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {activeTab === 'editor' && (
          <>
            {/* Font Size */}
            <div>
              <label className="text-[11px] text-[#858585] block mb-1">Font Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={fontSize}
                  onChange={e => setFontSize(+e.target.value)}
                  className="flex-1 accent-[#007acc]"
                />
                <span className="text-[12px] text-[#cccccc] w-6 text-right">{fontSize}</span>
              </div>
            </div>

            {/* Tab Size */}
            <div>
              <label className="text-[11px] text-[#858585] block mb-1">Tab Size</label>
              <div className="flex gap-1">
                {[2, 4].map(size => (
                  <button
                    key={size}
                    onClick={() => setTabSize(size)}
                    className={`flex-1 py-1 text-[12px] rounded transition-colors ${
                      tabSize === size
                        ? 'bg-[#007acc] text-white'
                        : 'bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c]'
                    }`}
                  >
                    {size} spaces
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            {[
              { label: 'Word Wrap', value: wordWrap, set: setWordWrap },
              { label: 'Minimap', value: minimap, set: setMinimap },
              { label: 'Line Numbers', value: lineNumbers, set: setLineNumbers },
              { label: 'Auto Save', value: autoSave, set: setAutoSave },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px] text-[#cccccc]">{label}</span>
                <button
                  onClick={() => set(!value)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    value ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                  }`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                      value ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <div>
              <label className="text-[11px] text-[#858585] block mb-1">AI Provider</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1.5 rounded border border-[#3e3e42] outline-none focus:border-[#007acc]"
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="openai">OpenAI</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#858585] block mb-1">API Key</label>
              <div className="flex gap-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter API key..."
                  className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1.5 rounded border border-[#3e3e42] outline-none focus:border-[#007acc] placeholder-[#5a5a5a]"
                />
                <button
                  onClick={() => setShowKey(p => !p)}
                  className="px-2 bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] text-[10px] rounded border border-[#3e3e42]"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[10px] text-[#5a5a5a] mt-1">Stored locally in your browser.</p>
            </div>

            <button className="w-full py-1.5 text-[12px] bg-[#007acc] hover:bg-[#1a8ad4] text-white rounded transition-colors">
              Save Settings
            </button>
          </>
        )}

        {activeTab === 'about' && (
          <div className="space-y-3 text-[12px] text-[#cccccc]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <div>
                <p className="font-medium">vibecode.dev</p>
                <p className="text-[10px] text-[#858585]">v1.0.0</p>
              </div>
            </div>
            <p className="text-[#858585]">AI-powered code editor built with React, Monaco, and Zustand.</p>
            <div className="text-[11px] text-[#858585] space-y-1">
              <p>Monaco Editor for code editing</p>
              <p>Tailwind CSS for styling</p>
              <p>Zustand for state management</p>
              <p>Lucide for icons</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
