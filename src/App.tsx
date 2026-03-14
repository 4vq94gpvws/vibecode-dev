import { useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Terminal } from './components/Terminal'
import { StatusBar } from './components/StatusBar'
import { useEditorStore } from './store/editorStore'
import { useWebContainer } from './hooks/useWebContainer'

function App() {
  const { activeView, setActiveView } = useEditorStore()
  const { isReady, error, boot } = useWebContainer()

  useEffect(() => {
    boot()
  }, [boot])

  return (
    <div className="h-screen w-screen flex flex-col bg-editor-bg">
      {/* Top Bar */}
      <div className="h-9 bg-editor-sidebar flex items-center px-4 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center text-sm text-editor-muted">
          vibecode.dev - {isReady ? 'WebContainer Ready' : error ? 'Error' : 'Initializing...'}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Sidebar + Editor + Terminal */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar */}
          <Panel defaultSize={15} minSize={10} maxSize={30} className="bg-editor-sidebar">
            <Sidebar activeView={activeView} />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-editor-border hover:bg-editor-accent transition-colors" />

          {/* Editor + Terminal */}
          <Panel defaultSize={85}>
            <PanelGroup direction="vertical">
              {/* Editor Area */}
              <Panel defaultSize={70} minSize={20}>
                <Editor />
              </Panel>
              
              <PanelResizeHandle className="h-1 bg-editor-border hover:bg-editor-accent transition-colors" />

              {/* Terminal */}
              <Panel defaultSize={30} minSize={10} maxSize={50}>
                <Terminal />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  )
}

export default App