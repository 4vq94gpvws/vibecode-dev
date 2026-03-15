import { useState, useEffect } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { SettingsModal } from './components/SettingsModal'
import { Toast } from './components/ui/Toast'
import { getSettings, type Settings } from './services/settingsService'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <ActivityBar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">VibeCode.dev</h1>
          <p className="text-gray-400 mb-8">
            AI-powered development environment. Configure your AI providers in the settings.
          </p>
          
          {settings && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Provider:</span>
                  <span className="font-medium text-blue-400">
                    {settings.aiProvider.provider === 'claude' && 'Claude (Anthropic)'}
                    {settings.aiProvider.provider === 'kimi' && 'Kimi (Ollama)'}
                    {settings.aiProvider.provider === 'openai' && 'OpenAI'}
                    {settings.aiProvider.provider === 'custom' && 'Custom'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className="font-medium">{settings.aiProvider.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Key:</span>
                  <span className="font-medium">
                    {settings.aiProvider.apiKey ? '✓ Configured' : '✗ Not set'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={handleSettingsSaved}
        onShowToast={addToast}
      />

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
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
