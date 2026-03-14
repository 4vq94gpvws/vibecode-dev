import { useState } from 'react'
import { Settings, Moon, Sun, Type, Keyboard } from 'lucide-react'

export function SettingsPanel() {
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [minimap, setMinimap] = useState(true)

  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <h3 className="text-sm font-medium text-editor-text mb-3 flex items-center gap-2">
            <Settings size={14} />
            Appearance
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between py-2 px-3 bg-editor-bg rounded cursor-pointer hover:bg-editor-hover">
              <span className="text-sm text-editor-text flex items-center gap-2">
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                Theme
              </span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-editor-active text-editor-text text-sm px-2 py-1 rounded border border-editor-border outline-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="high-contrast">High Contrast</option>
              </select>
            </label>
          </div>
        </div>
        
        {/* Editor */}
        <div>
          <h3 className="text-sm font-medium text-editor-text mb-3 flex items-center gap-2">
            <Type size={14} />
            Editor
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between py-2 px-3 bg-editor-bg rounded cursor-pointer hover:bg-editor-hover">
              <span className="text-sm text-editor-text">Font Size</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                  className="w-6 h-6 flex items-center justify-center bg-editor-active rounded hover:bg-editor-hover text-editor-text"
                >
                  -
                </button>
                <span className="text-sm text-editor-text w-8 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                  className="w-6 h-6 flex items-center justify-center bg-editor-active rounded hover:bg-editor-hover text-editor-text"
                >
                  +
                </button>
              </div>
            </label>
            
            <label className="flex items-center justify-between py-2 px-3 bg-editor-bg rounded cursor-pointer hover:bg-editor-hover">
              <span className="text-sm text-editor-text">Word Wrap</span>
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between py-2 px-3 bg-editor-bg rounded cursor-pointer hover:bg-editor-hover">
              <span className="text-sm text-editor-text">Minimap</span>
              <input
                type="checkbox"
                checked={minimap}
                onChange={(e) => setMinimap(e.target.checked)}
                className="rounded"
              />
            </label>
          </div>
        </div>
        
        {/* Keyboard */}
        <div>
          <h3 className="text-sm font-medium text-editor-text mb-3 flex items-center gap-2">
            <Keyboard size={14} />
            Keyboard
          </h3>
          <div className="space-y-2">
            <div className="py-2 px-3 bg-editor-bg rounded">
              <div className="flex justify-between text-sm">
                <span className="text-editor-text">Command Palette</span>
                <span className="text-editor-muted font-mono">Ctrl+Shift+P</span>
              </div>
            </div>
            <div className="py-2 px-3 bg-editor-bg rounded">
              <div className="flex justify-between text-sm">
                <span className="text-editor-text">Quick Open</span>
                <span className="text-editor-muted font-mono">Ctrl+P</span>
              </div>
            </div>
            <div className="py-2 px-3 bg-editor-bg rounded">
              <div className="flex justify-between text-sm">
                <span className="text-editor-text">Terminal</span>
                <span className="text-editor-muted font-mono">Ctrl+\`</span>
              </div>
            </div>
            <div className="py-2 px-3 bg-editor-bg rounded">
              <div className="flex justify-between text-sm">
                <span className="text-editor-text">AI Chat</span>
                <span className="text-editor-muted font-mono">Ctrl+Shift+A</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* About */}
        <div className="pt-4 border-t border-editor-border">
          <div className="text-center">
            <h4 className="text-lg font-bold text-editor-text mb-1">vibecode.dev</h4>
            <p className="text-xs text-editor-muted">Version 0.1.0 (Fase 1)</p>
            <p className="text-xs text-editor-muted mt-2">
              AI-powered code editor with WebContainers
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}