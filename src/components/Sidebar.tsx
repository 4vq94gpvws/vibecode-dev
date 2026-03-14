import { useState } from 'react'
import { FileExplorer } from './FileExplorer'
import { SearchPanel } from './SearchPanel'
import { GitPanel } from './GitPanel'
import { AIPanel } from './AIPanel'
import { SettingsPanel } from './SettingsPanel'

interface SidebarProps {
  activeView: string
}

export function Sidebar({ activeView }: SidebarProps) {
  const renderContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />
      case 'search':
        return <SearchPanel />
      case 'git':
        return <GitPanel />
      case 'ai':
        return <AIPanel />
      case 'settings':
        return <SettingsPanel />
      default:
        return <FileExplorer />
    }
  }

  const getTitle = () => {
    switch (activeView) {
      case 'explorer':
        return 'EXPLORER'
      case 'search':
        return 'SEARCH'
      case 'git':
        return 'SOURCE CONTROL'
      case 'ai':
        return 'AI ASSISTANT'
      case 'settings':
        return 'SETTINGS'
      default:
        return 'EXPLORER'
    }
  }

  return (
    <div className="h-full flex flex-col bg-editor-sidebar">
      <div className="h-9 flex items-center px-4 text-xs font-semibold text-editor-muted uppercase tracking-wider">
        {getTitle()}
      </div>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}