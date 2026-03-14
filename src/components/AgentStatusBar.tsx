import React from 'react';
import { useAgentContext } from '../contexts/AgentContext';
import { useWebContainer } from '../contexts/WebContainerContext';
import { AGENT_CONFIGS } from '../types/agents';
import { Bot, Circle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AgentStatusBar: React.FC = () => {
  const { activeAgents, isProcessing, messages } = useAgentContext();
  const { isReady, isLoading, error } = useWebContainer();

  const getStatusIcon = () => {
    if (isProcessing) return <Loader2 size={14} className="animate-spin text-blue-400" />;
    if (messages.some(m => m.status === 'error')) return <AlertCircle size={14} className="text-red-400" />;
    return <CheckCircle2 size={14} className="text-green-400" />;
  };

  return (
    <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        {/* WebContainer Status */}
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : error ? (
            <AlertCircle size={12} className="text-red-300" />
          ) : isReady ? (
            <Circle size={12} className="fill-green-400 text-green-400" />
          ) : (
            <Circle size={12} className="text-gray-400" />
          )}
          <span>
            {isLoading ? 'Initializing...' : error ? 'Error' : isReady ? 'Ready' : 'Offline'}
          </span>
        </div>

        {/* Active Agents */}
        <div className="flex items-center gap-2">
          <Bot size={12} />
          <span>{activeAgents.length} active</span>
          <div className="flex gap-1 ml-1">
            {activeAgents.map(type => {
              const config = AGENT_CONFIGS.find(a => a.type === type);
              return (
                <span
                  key={type}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config?.color }}
                  title={config?.name}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Processing Status */}
        {isProcessing && (
          <div className="flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" />
            <span>Processing...</span>
          </div>
        )}

        {/* Last Message Status */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span>{messages[messages.length - 1].status}</span>
          </div>
        )}

        {/* Keyboard Shortcuts Hint */}
        <div className="text-blue-200">
          Ctrl+Space: Complete | Ctrl+Shift+R: Refactor | Ctrl+Shift+B: Bug Check
        </div>
      </div>
    </div>
  );
};