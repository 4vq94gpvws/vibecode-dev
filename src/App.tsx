import React from 'react';
import { EditorProvider } from './contexts/EditorContext';
import { AgentProvider } from './contexts/AgentContext';
import { WebContainerProvider } from './contexts/WebContainerContext';
import { FileExplorer } from './components/FileExplorer';
import { TabBar } from './components/TabBar';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';
import { AgentPanel } from './components/AgentPanel';
import { AgentStatusBar } from './components/AgentStatusBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const EditorLayout: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-editor-fg">
      {/* Top Bar */}
      <div className="h-12 bg-editor-sidebar border-b border-editor-border flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-lg">vibecode.dev</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
          <span>Fase 2: AI Sub-agents</span>
          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Beta</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <FileExplorer />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TabBar />
          <CodeEditor />
          <Terminal />
        </div>

        {/* AI Agent Panel */}
        <AgentPanel />
      </div>

      {/* Status Bar */}
      <AgentStatusBar />
    </div>
  );
};

function App() {
  return (
    <WebContainerProvider>
      <EditorProvider>
        <AgentProvider>
          <EditorLayout />
        </AgentProvider>
      </EditorProvider>
    </WebContainerProvider>
  );
}

export default App;