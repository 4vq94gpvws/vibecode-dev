import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { useAI } from '../hooks/useAI'
import { PROVIDER_CONFIGS, AGENT_CONFIGS, type AIProvider, type AgentType } from '../types'
import {
  Settings,
  Moon,
  Sun,
  Type,
  Keyboard,
  Key,
  Bot,
  Cloud,
  Server,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  RotateCcw,
  Wand2,
  Bug,
  RefreshCw,
  FileText,
  CheckCircle,
} from 'lucide-react'

const agentIcons: Record<AgentType, typeof Wand2> = {
  completion: Wand2,
  'bug-detection': Bug,
  refactoring: RefreshCw,
  docs: FileText,
  tests: CheckCircle,
}

export function SettingsPanel() {
  const {
    settings,
    updateAISettings,
    updateEditorSettings,
    updateAgentSettings,
    setApiKey,
    getApiKey,
    hasApiKey,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings()
  
  const { testProvider } = useAI()
  
  const [activeSection, setActiveSection] = useState<'ai' | 'editor' | 'agents'>('ai')
  const [expandedProviders, setExpandedProviders] = useState<AIProvider[]>([])
  const [expandedAgents, setExpandedAgents] = useState<AgentType[]>([])
  const [apiKeyInputs, setApiKeyInputs] = useState<Partial<Record<AIProvider, string>>>({})
  const [showApiKeys, setShowApiKeys] = useState<Partial<Record<AIProvider, boolean>>>({})
  const [providerStatus, setProviderStatus] = useState<Partial<Record<AIProvider, { success: boolean; message: string }>>>({})
  const [importError, setImportError] = useState<string | null>(null)

  const toggleProvider = (provider: AIProvider) => {
    setExpandedProviders((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
    )
  }

  const toggleAgent = (agent: AgentType) => {
    setExpandedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]
    )
  }

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setApiKeyInputs((prev) => ({ ...prev, [provider]: value }))
  }

  const saveApiKey = (provider: AIProvider) => {
    const key = apiKeyInputs[provider]
    if (key) {
      setApiKey(provider, key)
      setApiKeyInputs((prev) => ({ ...prev, [provider]: '' }))
    }
  }

  const clearApiKey = (provider: AIProvider) => {
    setApiKey(provider, '')
    setApiKeyInputs((prev) => ({ ...prev, [provider]: '' }))
  }

  const testConnection = async (provider: AIProvider) => {
    const status = await testProvider(provider)
    setProviderStatus((prev) => ({ ...prev, [provider]: status }))
    
    setTimeout(() => {
      setProviderStatus((prev) => ({ ...prev, [provider]: undefined }))
    }, 5000)
  }

  const handleExport = () => {
    const data = exportSettings()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vibecode-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const success = importSettings(content)
        if (!success) {
          setImportError('Failed to import settings. Invalid file format.')
          setTimeout(() => setImportError(null), 5000)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Section Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'ai'
              ? 'bg-editor-active text-white'
              : 'text-editor-muted hover:text-editor-text hover:bg-editor-hover'
          }`}
        >
          <Bot size={16} />
          AI Providers
        </button>
        <button
          onClick={() => setActiveSection('agents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'agents'
              ? 'bg-editor-active text-white'
              : 'text-editor-muted hover:text-editor-text hover:bg-editor-hover'
          }`}
        >
          <Wand2 size={16} />
          Agents
        </button>
        <button
          onClick={() => setActiveSection('editor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'editor'
              ? 'bg-editor-active text-white'
              : 'text-editor-muted hover:text-editor-text hover:bg-editor-hover'
          }`}
        >
          <Settings size={16} />
          Editor
        </button>
      </div>

      {/* AI Providers Section */}
      {activeSection === 'ai' && (
        <div className="space-y-6">
          {/* Global AI Settings */}
          <div className="bg-editor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-editor-text mb-4 flex items-center gap-2">
              <Cloud size={14} />
              Global AI Settings
            </h3>
            
            <div className="space-y-4">
              {/* Default Provider */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Default Provider</span>
                <select
                  value={settings.ai.defaultProvider}
                  onChange={(e) => updateAISettings({ defaultProvider: e.target.value as AIProvider })}
                  className="bg-editor-active text-editor-text text-sm px-3 py-1.5 rounded border border-editor-border outline-none"
                >
                  {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cloud vs Local Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.ai.useCloudApi ? <Cloud size={14} /> : <Server size={14} />}
                  <span className="text-sm text-editor-text">
                    {settings.ai.useCloudApi ? 'Use Cloud API' : 'Use Local Ollama'}
                  </span>
                </div>
                <button
                  onClick={() => updateAISettings({ useCloudApi: !settings.ai.useCloudApi })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.ai.useCloudApi ? 'bg-accent-primary' : 'bg-editor-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.ai.useCloudApi ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Ollama URL (when local) */}
              {!settings.ai.useCloudApi && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-editor-text">Ollama URL</span>
                  <input
                    type="text"
                    value={settings.ai.ollamaUrl}
                    onChange={(e) => updateAISettings({ ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="bg-editor-active text-editor-text text-sm px-3 py-1.5 rounded border border-editor-border outline-none w-64"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Provider API Keys */}
          <div className="bg-editor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-editor-text mb-4 flex items-center gap-2">
              <Key size={14} />
              API Keys
            </h3>
            <p className="text-xs text-editor-muted mb-4">
              Your API keys are encrypted and stored locally in your browser.
            </p>

            <div className="space-y-2">
              {(Object.keys(PROVIDER_CONFIGS) as AIProvider[]).map((provider) => {
                const config = PROVIDER_CONFIGS[provider]
                const isExpanded = expandedProviders.includes(provider)
                const hasKey = hasApiKey(provider)
                const status = providerStatus[provider]

                return (
                  <div key={provider} className="border border-editor-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleProvider(provider)}
                      className="w-full flex items-center justify-between p-3 bg-editor-active hover:bg-editor-hover transition-colors">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="text-sm font-medium text-editor-text">{config.name}</span>
                        {hasKey && (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <Check size={12} />
                            Configured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {status && (
                          <span className={`flex items-center gap-1 text-xs ${
                            status.success ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {status.success ? <Check size={12} /> : <AlertCircle size={12} />}
                            {status.message}
                          </span>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 border-t border-editor-border space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs text-editor-muted">
                            {config.name} API Key
                          </label>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <input
                                type={showApiKeys[provider] ? 'text' : 'password'}
                                value={apiKeyInputs[provider] || ''}
                                onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                                placeholder={hasKey ? '••••••••••••••••' : `Enter your ${config.name} API key`}
                                className="w-full bg-editor-bg text-editor-text text-sm px-3 py-2 rounded border border-editor-border outline-none"
                              />
                            </div>
                            <button
                              onClick={() => setShowApiKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))}
                              className="px-3 py-2 text-xs text-editor-muted hover:text-editor-text bg-editor-hover rounded">
                              {showApiKeys[provider] ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <p className="text-xs text-editor-muted">
                            {config.description}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveApiKey(provider)}
                            disabled={!apiKeyInputs[provider]}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-accent-primary text-white rounded hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Key size={14} />
                            Save Key
                          </button>
                          {hasKey && (
                            <>
                              <button
                                onClick={() => testConnection(provider)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-editor-hover text-editor-text rounded hover:bg-editor-active">
                                Test Connection
                              </button>
                              <button
                                onClick={() => clearApiKey(provider)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10 rounded">
                                Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Agents Section */}
      {activeSection === 'agents' && (
        <div className="space-y-6">
          <div className="bg-editor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-editor-text mb-2 flex items-center gap-2">
              <Bot size={14} />
              Agent Configuration
            </h3>
            <p className="text-xs text-editor-muted mb-4">
              Configure AI models and settings for each agent type.
            </p>
            <div className="space-y-2">
              {(Object.keys(AGENT_CONFIGS) as AgentType[]).map((agentType) => {
                const config = AGENT_CONFIGS[agentType]
                const agentSettings = settings.ai.agentSettings[agentType]
                const isExpanded = expandedAgents.includes(agentType)
                const Icon = agentIcons[agentType]
                return (
                  <div key={agentType} className="border border-editor-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleAgent(agentType)}
                      className="w-full flex items-center justify-between p-3 bg-editor-active hover:bg-editor-hover transition-colors">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Icon size={16} />
                        <span className="text-sm font-medium text-editor-text">{config.name}</span>
                      </div>
                      <span className="text-xs text-editor-muted">
                        {agentSettings.model}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-3 border-t border-editor-border space-y-4">
                        {/* Provider */}
                        <div className="space-y-2">
                          <label className="text-xs text-editor-muted">Provider</label>
                          <select
                            value={agentSettings.provider}
                            onChange={(e) => updateAgentSettings(agentType, { provider: e.target.value as AIProvider })}
                            className="w-full bg-editor-bg text-editor-text text-sm px-3 py-2 rounded border border-editor-border outline-none"
                          >
                            {Object.entries(PROVIDER_CONFIGS).map(([key, providerConfig]) => (
                              <option key={key} value={key}>
                                {providerConfig.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                          <label className="text-xs text-editor-muted">Model</label>
                          <select
                            value={agentSettings.model}
                            onChange={(e) => updateAgentSettings(agentType, { model: e.target.value })}
                            className="w-full bg-editor-bg text-editor-text text-sm px-3 py-2 rounded border border-editor-border outline-none"
                          >
                            {PROVIDER_CONFIGS[agentSettings.provider].models.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Temperature */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-editor-muted">Temperature</label>
                            <span className="text-xs text-editor-text">{agentSettings.temperature}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={agentSettings.temperature}
                            onChange={(e) => updateAgentSettings(agentType, { temperature: parseFloat(e.target.value) })}
                            className="w-full accent-accent-primary"
                          />
                          <p className="text-xs text-editor-muted">
                            Lower = more focused, Higher = more creative
                          </p>
                        </div>

                        {/* Max Tokens */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-editor-muted">Max Tokens</label>
                            <span className="text-xs text-editor-text">{agentSettings.maxTokens}</span>
                          </div>
                          <input
                            type="range"
                            min="256"
                            max="8192"
                            step="256"
                            value={agentSettings.maxTokens}
                            onChange={(e) => updateAgentSettings(agentType, { maxTokens: parseInt(e.target.value) })}
                            className="w-full accent-accent-primary"
                          />
                        </div>

                        {/* Enabled */}
                        <div className="flex items-center justify-between pt-2 border-t border-editor-border">
                          <span className="text-sm text-editor-text">Enable {config.name}</span>
                          <button
                            onClick={() => updateAgentSettings(agentType, { enabled: !agentSettings.enabled })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              agentSettings.enabled ? 'bg-accent-primary' : 'bg-editor-border'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                agentSettings.enabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Editor Section */}
      {activeSection === 'editor' && (
        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-editor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-editor-text mb-4 flex items-center gap-2">
              <Sun size={14} />
              Appearance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Theme</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateEditorSettings({ theme: 'dark' })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                      settings.editor.theme === 'dark'
                        ? 'bg-accent-primary text-white'
                        : 'bg-editor-active text-editor-text hover:bg-editor-hover'
                    }`}
                  >
                    <Moon size={14} />
                    Dark
                  </button>
                  <button
                    onClick={() => updateEditorSettings({ theme: 'light' })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                      settings.editor.theme === 'light'
                        ? 'bg-accent-primary text-white'
                        : 'bg-editor-active text-editor-text hover:bg-editor-hover'
                    }`}
                  >
                    <Sun size={14} />
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="bg-editor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-editor-text mb-4 flex items-center gap-2">
              <Type size={14} />
              Font
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Font Family</span>
                <select
                  value={settings.editor.fontFamily}
                  onChange={(e) => updateEditorSettings({ fontFamily: e.target.value })}
                  className="bg-editor-active text-editor-text text-sm px-3 py-1.5 rounded border border-editor-border outline-none"
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="Source Code Pro">Source Code Pro</option>
                  <option value="Cascadia Code">Cascadia Code</option>
                  <option value="monospace">System Monospace</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-editor-text">Font Size</span>
                  <span className="text-xs text-editor-muted">{settings.editor.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.editor.fontSize}
                  onChange={(e) => updateEditorSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-editor-text">Line Height</span>
                  <span className="text-xs text-editor-muted">{settings.editor.lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={settings.editor.lineHeight}
                  onChange={(e) => updateEditorSettings({ lineHeight: parseFloat(e.target.value) })}
                  className="w-full accent-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Editor Behavior */}
          <div className="bg-editor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-editor-text mb-4 flex items-center gap-2">
              <Keyboard size={14} />
              Editor Behavior
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Word Wrap</span>
                <button
                  onClick={() => updateEditorSettings({ wordWrap: !settings.editor.wordWrap })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.editor.wordWrap ? 'bg-accent-primary' : 'bg-editor-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.editor.wordWrap ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Minimap</span>
                <button
                  onClick={() => updateEditorSettings({ minimap: !settings.editor.minimap })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.editor.minimap ? 'bg-accent-primary' : 'bg-editor-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.editor.minimap ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Auto Save</span>
                <button
                  onClick={() => updateEditorSettings({ autoSave: !settings.editor.autoSave })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.editor.autoSave ? 'bg-accent-primary' : 'bg-editor-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.editor.autoSave ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Format on Save</span>
                <button
                  onClick={() => updateEditorSettings({ formatOnSave: !settings.editor.formatOnSave })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.editor.formatOnSave ? 'bg-accent-primary' : 'bg-editor-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.editor.formatOnSave ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-editor-text">Tab Size</span>
                <div className="flex gap-2">
                  {[2, 4].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateEditorSettings({ tabSize: size })}
                      className={`px-3 py-1 rounded text-sm ${
                        settings.editor.tabSize === size
                          ? 'bg-accent-primary text-white'
                          : 'bg-editor-active text-editor-text hover:bg-editor-hover'
                      }`}
                    >
                      {size} spaces
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export & Reset */}
      <div className="mt-8 pt-6 border-t border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-editor-active text-editor-text rounded hover:bg-editor-hover transition-colors">
              <Download size={16} />
              Export Settings
            </button>
            <label className="flex items-center gap-2 px-4 py-2 text-sm bg-editor-active text-editor-text rounded hover:bg-editor-hover transition-colors cursor-pointer">
              <Upload size={16} />
              Import Settings
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded transition-colors">
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>
        
        {importError && (
          <div className="mt-2 text-sm text-red-400">
            {importError}
          </div>
        )}
      </div>
    </div>
  )
}