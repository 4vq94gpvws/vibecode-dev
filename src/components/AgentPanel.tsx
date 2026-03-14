import React, { useState } from 'react';
import { useAgentContext, AIProvider } from '../contexts/AgentContext';
import { AGENT_CONFIGS } from '../types/agents';
import { useAgents } from '../hooks/useAgents';
import { useEditor } from '../hooks/useEditor';
import { Bot, X, Send, Sparkles, Bug, Wand2, FileText, TestTube, Check, Loader2, Cpu, Zap } from 'lucide-react';

const AgentIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 16 }) => {
  switch (type) {
    case 'completion': return <Sparkles size={size} />;
    case 'bug': return <Bug size={size} />;
    case 'refactor': return <Wand2 size={size} />;
    case 'docs': return <FileText size={size} />;
    case 'test': return <TestTube size={size} />;
    default: return <Bot size={size} />;
  }
};

const PROVIDER_CONFIG: Record<AIProvider, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  claude: {
    label: 'Claude',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: 'rgba(217, 119, 6, 0.4)',
    icon: <Cpu size={12} />,
  },
  kimi: {
    label: 'Kimi',
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(124, 58, 237, 0.4)',
    icon: <Zap size={12} />,
  },
};

export const AgentPanel: React.FC = () => {
  const { messages, activeAgents, isProcessing, clearMessages, toggleAgent, provider, setProvider } = useAgentContext();
  const { requestCompletion, detectBugs, requestRefactor, generateDocs, generateTests } = useAgents();
  const { getAIContext } = useEditor();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleSend = async (type: string) => {
    if (!input.trim()) return;
    const context = getAIContext();
    
    switch (type) {
      case 'completion':
        await requestCompletion(context);
        break;
      case 'bug':
        await detectBugs(context);
        break;
      case 'refactor':
        await requestRefactor(context);
        break;
      case 'docs':
        await generateDocs(context);
        break;
      case 'test':
        await generateTests(context);
        break;
    }
    setInput('');
  };

  const handleQuickAction = async (type: string) => {
    const context = getAIContext();
    switch (type) {
      case 'completion':
        await requestCompletion(context);
        break;
      case 'bug':
        await detectBugs(context);
        break;
      case 'refactor':
        await requestRefactor(context);
        break;
      case 'docs':
        await generateDocs(context);
        break;
      case 'test':
        await generateTests(context);
        break;
    }
  };

  const activeProvider = PROVIDER_CONFIG[provider];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="w-80 bg-editor-sidebar border-l border-editor-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-blue-400" />
          <span className="font-semibold">AI Agents</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={clearMessages}
            className="p-1.5 hover:bg-editor-active rounded transition-colors"
            title="Clear messages"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Provider switcher */}
      <div className="px-4 py-3 border-b border-editor-border">
        <span className="text-xs text-gray-500 uppercase tracking-wider">AI Provider</span>
        <div className="flex gap-2 mt-2">
          {(Object.keys(PROVIDER_CONFIG) as AIProvider[]).map((p) => {
            const cfg = PROVIDER_CONFIG[p];
            const isActive = provider === p;
            return (
              <button
                key={p}
                onClick={() => setProvider(p)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                style={{
                  backgroundColor: isActive ? cfg.bgColor : 'transparent',
                  color: isActive ? cfg.color : '#6b7280',
                  borderColor: isActive ? cfg.borderColor : '#374151',
                  boxShadow: isActive ? `0 0 8px ${cfg.color}40` : 'none',
                }}
                title={`Gebruik ${cfg.label}`}
              >
                {cfg.icon}
                {cfg.label}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: cfg.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* Active provider indicator */}
        <div
          className="mt-2 px-2 py-1 rounded text-[10px] flex items-center gap-1.5"
          style={{ backgroundColor: activeProvider.bgColor, color: activeProvider.color }}
        >
          {activeProvider.icon}
          <span>Actief: <strong>{activeProvider.label}</strong> — berichten worden via {activeProvider.label} verwerkt</span>
        </div>
      </div>

      {/* Active Agents */}
      <div className="px-4 py-3 border-b border-editor-border">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Active Agents</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {AGENT_CONFIGS.map(agent => (
            <button
              key={agent.type}
              onClick={() => toggleAgent(agent.type)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                activeAgents.includes(agent.type)
                  ? 'bg-opacity-20 text-white'
                  : 'bg-editor-active text-gray-400 hover:text-editor-fg'
              }`}
              style={{
                backgroundColor: activeAgents.includes(agent.type) ? agent.color : undefined
              }}
              title={agent.description}
            >
              <AgentIcon type={agent.type} size={12} />
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-editor-border">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Quick Actions</span>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {AGENT_CONFIGS.map(agent => (
            <button
              key={agent.type}
              onClick={() => handleQuickAction(agent.type)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-editor-active hover:bg-editor-border rounded text-xs transition-colors text-left"
            >
              <span style={{ color: agent.color }}>
                <AgentIcon type={agent.type} size={14} />
              </span>
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-gray-500 text-[10px]">{agent.shortcut}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Use keyboard shortcuts or quick actions</p>
          </div>
        ) : (
          messages.map(message => {
            const config = AGENT_CONFIGS.find(a => a.type === message.agentType);
            return (
              <div
                key={message.id}
                className="bg-editor-active rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: config?.color }}>
                    <AgentIcon type={message.agentType} size={14} />
                  </span>
                  <span className="text-xs font-medium" style={{ color: config?.color }}>
                    {config?.name}
                  </span>
                  {/* Provider badge op elk bericht */}
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: PROVIDER_CONFIG[provider]?.bgColor,
                      color: PROVIDER_CONFIG[provider]?.color,
                    }}
                  >
                    {PROVIDER_CONFIG[provider]?.icon}
                    {PROVIDER_CONFIG[provider]?.label}
                  </span>
                  {message.status === 'streaming' && (
                    <Loader2 size={12} className="animate-spin text-gray-400" />
                  )}
                  {message.status === 'complete' && (
                    <Check size={12} className="text-green-400" />
                  )}
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                  {message.content || (message.status === 'streaming' ? 'Thinking...' : '')}
                </pre>
                {message.fileId && (
                  <div className="mt-2 text-[10px] text-gray-500">
                    Line {message.lineNumber}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-editor-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend('completion')}
            placeholder={`Ask ${activeProvider.label}...`}
            className="flex-1 bg-editor-bg border border-editor-border rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend('completion')}
            disabled={!input.trim() || isProcessing}
            className="px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeProvider.color,
              color: 'white',
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
          {activeProvider.icon}
          <span style={{ color: activeProvider.color }}>{activeProvider.label}</span>
          <span>is actief — Enter om te sturen</span>
        </div>
      </div>
    </div>
  );
};
