import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Code2,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ChevronDown,
  RotateCcw,
  Key,
  Link,
  Thermometer,
  Hash,
  Type,
  Moon,
  Sun,
  Monitor,
  Save,
  Play,
  Shield,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AI_PROVIDERS, THEMES, FONT_FAMILIES, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    settings,
    updateAISettings,
    updateEditorSettings,
    updateAgentSettings,
    resetSettings,
    activeSettingsTab,
    setActiveSettingsTab,
  } = useSettings();

  const [showApiKey, setShowApiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset hasChanges when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasChanges(false);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  // Show save success message temporarily
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleAIChange = (key: keyof typeof settings.ai, value: any) => {
    updateAISettings({ [key]: value });
    setHasChanges(true);
  };

  const handleEditorChange = (key: keyof typeof settings.editor, value: any) => {
    updateEditorSettings({ [key]: value });
    setHasChanges(true);
  };

  const handleAgentChange = (key: keyof typeof settings.agent, value: any) => {
    updateAgentSettings({ [key]: value });
    setHasChanges(true);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const providerConfig = AI_PROVIDERS[provider];
    updateAISettings({
      provider,
      model: providerConfig.models[0].id,
      baseUrl: providerConfig.defaultBaseUrl,
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    setSaveSuccess(true);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
      setHasChanges(true);
    }
  };

  if (!isOpen) return null;

  const currentProvider = AI_PROVIDERS[settings.ai.provider];

  const tabs = [
    { id: 'ai', label: 'AI Provider', icon: Bot },
    { id: 'editor', label: 'Editor', icon: Code2 },
    { id: 'agent', label: 'Agents', icon: Sparkles },
    { id: 'general', label: 'General', icon: Settings },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#333] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-[#252526] border-r border-[#333] flex flex-col">
          <div className="p-4 border-b border-[#333]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </h2>
          </div>

          <nav className="flex-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSettingsTab === tab.id
                      ? 'bg-[#37373d] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2d2e]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#333]">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#2a2d2e] rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
            <h3 className="text-xl font-semibold text-white">
              {tabs.find(t => t.id === activeSettingsTab)?.label}
            </h3>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              )}
              {hasChanges && (
                <span className="flex items-center gap-1.5 text-sm text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2d2e] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSettingsTab === 'ai' && (
              <div className="space-y-6">
                {/* Provider Selection */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    AI Provider
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => {
                      const config = AI_PROVIDERS[provider];
                      return (
                        <button
                          key={provider}
                          onClick={() => handleProviderChange(provider)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                            settings.ai.provider === provider
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-[#333] bg-[#252526] hover:border-[#444]'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{config.name}</div>
                            <div className="text-xs text-gray-500">
                              {config.requiresApiKey ? 'API Key required' : 'Local / No API key'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Model Selection */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      value={settings.ai.model}
                      onChange={(e) => handleAIChange('model', e.target.value)}
                      className="w-full bg-[#252526] border border-[#333] rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {currentProvider.models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} — {model.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </section>

                {/* API Key */}
                {currentProvider.requiresApiKey && (
                  <section className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.ai.apiKey}
                        onChange={(e) => handleAIChange('apiKey', e.target.value)}
                        placeholder={`Enter your ${currentProvider.name} API key`}
                        className="w-full bg-[#252526] border border-[#333] rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your API key is stored locally in your browser and never sent to our servers.
                    </p>
                  </section>
                )}

                {/* Base URL */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={settings.ai.baseUrl}
                    onChange={(e) => handleAIChange('baseUrl', e.target.value)}
                    placeholder={currentProvider.defaultBaseUrl}
                    className="w-full bg-[#252526] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">
                    {settings.ai.provider === 'ollama'
                      ? 'Default: http://localhost:11434'
                      : 'Leave empty to use the default endpoint'}
                  </p>
                </section>

                {/* Temperature */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature: {settings.ai.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.ai.temperature}
                    onChange={(e) => handleAIChange('temperature', parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0)</span>
                    <span>Balanced (1)</span>
                    <span>Creative (2)</span>
                  </div>
                </section>

                {/* Max Tokens */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={settings.ai.maxTokens}
                    onChange={(e) => handleAIChange('maxTokens', parseInt(e.target.value))}
                    min="256"
                    max="8192"
                    step="256"
                    className="w-full bg-[#252526] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </section>
              </div>
            )}

            {activeSettingsTab === 'editor' && (
              <div className="space-y-6">
                {/* Theme */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {THEMES.map((theme) => {
                      const Icon = theme.icon === 'Moon' ? Moon : theme.icon === 'Sun' ? Sun : Monitor;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleEditorChange('theme', theme.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            settings.editor.theme === theme.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-[#333] bg-[#252526] hover:border-[#444]'
                          }`}
                        >
                          <Icon className="w-6 h-6 text-gray-400" />
                          <span className="text-sm font-medium text-white">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Font Family */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Font Family
                  </label>
                  <div className="relative">
                    <select
                      value={settings.editor.fontFamily}
                      onChange={(e) => handleEditorChange('fontFamily', e.target.value)}
                      className="w-full bg-[#252526] border border-[#333] rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {FONT_FAMILIES.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </section>

                {/* Font Size */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Font Size: {settings.editor.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    step="1"
                    value={settings.editor.fontSize}
                    onChange={(e) => handleEditorChange('fontSize', parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </section>

                {/* Line Height */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Line Height: {settings.editor.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={settings.editor.lineHeight}
                    onChange={(e) => handleEditorChange('lineHeight', parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </section>

                {/* Tab Size */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Tab Size
                  </label>
                  <div className="flex gap-2">
                    {[2, 4].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleEditorChange('tabSize', size)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          settings.editor.tabSize === size
                            ? 'bg-blue-500 text-white'
                            : 'bg-[#252526] text-gray-400 hover:text-white'
                        }`}
                      >
                        {size} spaces
                      </button>
                    ))}
                  </div>
                </section>

                {/* Toggles */}
                <section className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Editor Features
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'wordWrap', label: 'Word Wrap' },
                      { key: 'minimap', label: 'Minimap' },
                      { key: 'lineNumbers', label: 'Line Numbers' },
                      { key: 'autoSave', label: 'Auto Save' },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 bg-[#252526] rounded-lg cursor-pointer hover:bg-[#2a2d2e] transition-colors"
                      >
                        <span className="text-sm text-gray-300">{label}</span>
                        <button
                          onClick={() => handleEditorChange(key as any, !settings.editor[key as keyof typeof settings.editor])}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            settings.editor[key as keyof typeof settings.editor]
                              ? 'bg-blue-500'
                              : 'bg-[#444]'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.editor[key as keyof typeof settings.editor]
                                ? 'left-6'
                                : 'left-1'
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeSettingsTab === 'agent' && (
              <div className="space-y-6">
                {/* Agent Enabled */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#252526] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Enable AI Agents</div>
                        <div className="text-sm text-gray-500">Allow agents to assist with coding tasks</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAgentChange('enabled', !settings.agent.enabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.agent.enabled ? 'bg-blue-500' : 'bg-[#444]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.agent.enabled ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </section>

                {settings.agent.enabled && (
                  <>
                    {/* Auto Run */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-[#252526] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                            <Play className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">Auto Run</div>
                            <div className="text-sm text-gray-500">Automatically execute agent actions</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAgentChange('autoRun', !settings.agent.autoRun)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            settings.agent.autoRun ? 'bg-blue-500' : 'bg-[#444]'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.agent.autoRun ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </section>

                    {/* Confirm Before Action */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-[#252526] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">Confirm Before Action</div>
                            <div className="text-sm text-gray-500">Ask for confirmation before executing</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAgentChange('confirmBeforeAction', !settings.agent.confirmBeforeAction)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            settings.agent.confirmBeforeAction ? 'bg-blue-500' : 'bg-[#444]'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.agent.confirmBeforeAction ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </section>

                    {/* Max Iterations */}
                    <section className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Max Iterations: {settings.agent.maxIterations}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={settings.agent.maxIterations}
                        onChange={(e) => handleAgentChange('maxIterations', parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <p className="text-xs text-gray-500">
                        Maximum number of iterations an agent can perform before stopping
                      </p>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeSettingsTab === 'general' && (
              <div className="space-y-6">
                <section className="p-6 bg-[#252526] rounded-lg">
                  <h4 className="text-lg font-medium text-white mb-2">About VibeCode</h4>
                  <p className="text-gray-400 text-sm">
                    Version {settings.version}
                  </p>
                  <p className="text-gray-500 text-sm mt-4">
                    VibeCode is an AI-powered code editor that helps you write, edit, and understand code faster.
                  </p>
                </section>

                <section className="p-6 bg-[#252526] rounded-lg">
                  <h4 className="text-lg font-medium text-white mb-4">Keyboard Shortcuts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Open Settings</span>
                      <kbd className="px-2 py-1 bg-[#333] rounded text-gray-300">Ctrl + ,</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Chat</span>
                      <kbd className="px-2 py-1 bg-[#333] rounded text-gray-300">Ctrl + L</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Send Message</span>
                      <kbd className="px-2 py-1 bg-[#333] rounded text-gray-300">Enter</kbd>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#333] bg-[#252526]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
