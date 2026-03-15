import React, { useRef } from 'react';
import { useEditor } from '../hooks/useEditor';
import { X, FileCode } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, reorderTabs } = useEditor();
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      reorderTabs(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const colorClass = {
      ts: 'text-blue-400',
      tsx: 'text-blue-400',
      js: 'text-yellow-400',
      jsx: 'text-yellow-400',
      json: 'text-green-400',
      md: 'text-gray-400',
      css: 'text-cyan-400',
      html: 'text-orange-400'
    }[ext || ''] || 'text-gray-400';
    return <FileCode size={14} className={colorClass} />;
  };

  // Validate tabs array
  const validTabs = Array.isArray(tabs) ? tabs : [];

  if (validTabs.length === 0) {
    return (
      <div className="h-9 bg-editor-sidebar border-b border-editor-border flex items-center px-4">
        <span className="text-xs text-gray-500">No files open</span>
      </div>
    );
  }

  return (
    <div className="h-9 bg-editor-sidebar border-b border-editor-border flex overflow-x-auto">
      {validTabs.map((tab, index) => {
        // Skip invalid tabs
        if (!tab || typeof tab !== 'object') {
          console.warn('TabBar: Invalid tab object', tab);
          return null;
        }
        
        const isActive = tab.id === activeTabId;
        const tabName = tab.name || 'Untitled';
        
        return (
          <div
            key={tab.id || `tab-${index}`}
            draggable={!!tab.id}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => tab.id && setActiveTab(tab.id)}
            className={`flex items-center min-w-fit px-3 py-2 cursor-pointer border-r border-editor-border select-none group ${
              isActive
                ? 'bg-editor-bg text-editor-fg'
                : 'bg-editor-sidebar text-gray-400 hover:bg-editor-hover'
            }`}
          >
            {getFileIcon(tabName)}
            <span className={`ml-2 text-xs ${tab.isDirty ? 'italic' : ''}`}>
              {tabName}
              {tab.isDirty && <span className="ml-1">•</span>}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (tab.id) {
                  closeTab(tab.id);
                }
              }}
              className="ml-2 p-0.5 hover:bg-editor-active rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};