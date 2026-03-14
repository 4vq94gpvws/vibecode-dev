import React from 'react';
import { ActivityBar } from './components/ActivityBar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import { AgentProvider } from './contexts/AgentContext';
import { EditorProvider } from './contexts/EditorContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <EditorProvider>
        <AgentProvider>
          <div className="h-screen flex flex-col bg-editor-bg">
            <div className="flex-1 flex overflow-hidden">
              <ActivityBar />
              <Sidebar />
              <Editor />
            </div>
            <StatusBar />
          </div>
        </AgentProvider>
      </EditorProvider>
    </SettingsProvider>
  );
}

export default App;