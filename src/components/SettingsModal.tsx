import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react'
import {
  getSettings,
  saveSettings,
  type Settings,
  type AIProvider,
  type AIProviderType,
} from '../services/settingsService'
import { verifyAPIKey } from '../hooks/useVerifyAPI'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void
}

const PROVIDER_OPTIONS: { value: AIProviderType; label: string }[] = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'kimi', label: 'Kimi (Ollama)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'custom', label: 'Custom' },
]

const MODEL_OPTIONS: Record<AIProviderType, string[]> = {
  claude: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  kimi: ['kimi-k2', 'kimi-k1.5', 'kimi-latest'],
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  custom: ['custom-model'],
}

const DEFAULT_BASE_URLS: Record<AIProviderType, string> = {
  claude: 'https://api.anthropic.com',
  kimi: 'http://localhost:11434',
  openai: 'https://api.openai.com',
  custom: '',
}

export function SettingsModal({ isOpen, onClose, onSaved, onShowToast }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'editor' | 'appearance'>('ai')
  const [settings, setSettings] = useState<Settings>(getSettings())
  const [showApiKey, setShowApiKey] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings())
      setVerificationStatus('idle')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleProviderChange = (provider: AIProviderType) => {
    setSettings((prev) => ({
      ...prev,
      aiProvider: {
        ...prev.aiProvider,
        provider,
        baseUrl: DEFAULT_BASE_URLS[provider],
        model: MODEL_OPTIONS[provider][0],
      },
    }))
    setVerificationStatus('idle')
  }

  const handleSave = () => {
    saveSettings(settings)
    onSaved()
    onClose()
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setVerificationStatus('idle')
    
    try {
      const result = await verifyAPIKey(settings.aiProvider)
      if (result.success) {
        setVerificationStatus('success')
        onShowToast('API key verified successfully', 'success')
      } else {
        setVerificationStatus('error')
        onShowToast(result.error || 'Failed to verify API key', 'error')
      }
    } catch {
      setVerificationStatus('error')
      onShowToast('An error occurred during verification', 'error')
    } finally {
      setIsVerifying(false)
    }
  }

  const updateAIProvider = (updates: Partial<AIProvider>) => {
    setSettings((prev) => ({
      ...prev,
      aiProvider: { ...prev.aiProvider, ...updates },
    }))
    setVerificationStatus('idle')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['ai', 'editor', 'appearance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
              }`}
            >
              {tab === 'ai' && 'AI Providers'}
              {tab === 'editor' && 'Editor'}
              {tab === 'appearance' && 'Appearance'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Provider
                </label>
                <select
                  value={settings.aiProvider.provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProviderType)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={settings.aiProvider.model}
                  onChange={(e) => updateAIProvider({ model: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {MODEL_OPTIONS[settings.aiProvider.provider].map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.aiProvider.apiKey}
                    onChange={(e) => updateAIProvider({ apiKey: e.target.value })}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your API key is stored locally in your browser.
                </p>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL
                  {settings.aiProvider.provider === 'kimi' && (
                    <span className="ml-2 text-xs text-gray-500">(Ollama endpoint)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={settings.aiProvider.baseUrl}
                  onChange={(e) => updateAIProvider({ baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Verify Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !settings.aiProvider.apiKey}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
                
                {verificationStatus === 'success' && (
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <Check className="w-4 h-4" />
                    Verified
                  </span>
                )}
                
                {verificationStatus === 'error' && (
                  <span className="flex items-center gap-1 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    Failed
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="text-gray-400 text-center py-8">
                Editor settings coming soon...
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="text-gray-400 text-center py-8">
                Appearance settings coming soon...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
