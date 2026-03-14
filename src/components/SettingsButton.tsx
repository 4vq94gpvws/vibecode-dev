import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { SettingsPanel } from './SettingsPanel'

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Settings Button in Toolbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-editor-muted hover:text-editor-text hover:bg-editor-hover rounded transition-colors"
        title="Settings"
      >
        <Settings size={18} />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] bg-editor-sidebar rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
              <h2 className="text-lg font-semibold text-editor-text">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-editor-muted hover:text-editor-text hover:bg-editor-hover rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-60px)] overflow-auto">
              <SettingsPanel />
            </div>
          </div>
        </div>
      )}
    </>
  )
}