import { useCallback, useMemo } from 'react';
import { useEditorContext } from '../contexts/EditorContext';
import { FileNode, AIContext } from '../types';

export const useEditor = () => {
  const {
    files,
    tabs,
    activeTabId,
    openFile,
    closeTab,
    updateFileContent,
    setActiveTab,
    reorderTabs,
    updateCursorPosition,
    markTabDirty,
    createFile,
    createDirectory,
    toggleDirectory
  } = useEditorContext();

  const activeTab = useMemo(() => {
    if (!tabs || !Array.isArray(tabs)) return null;
    return tabs.find(t => t.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  const activeFile = useMemo(() => {
    if (!activeTab || !files || !Array.isArray(files)) return null;
    
    const findFile = (nodes: FileNode[]): FileNode | null => {
      if (!nodes || !Array.isArray(nodes)) return null;
      for (const node of nodes) {
        if (node.id === activeTab.fileId) return node;
        if (node.children) {
          const found = findFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findFile(files);
  }, [activeTab, files]);

  const getAIContext = useCallback((): AIContext => {
    return {
      currentFile: activeFile || undefined,
      cursorPosition: activeTab?.cursorPosition,
      projectFiles: files || []
    };
  }, [activeFile, activeTab, files]);

  const getFileContent = useCallback((fileId: string): string => {
    if (!fileId || !files || !Array.isArray(files)) return '';
    
    const findFile = (nodes: FileNode[]): FileNode | null => {
      if (!nodes || !Array.isArray(nodes)) return null;
      for (const node of nodes) {
        if (node.id === fileId) return node;
        if (node.children) {
          const found = findFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findFile(files)?.content || '';
  }, [files]);

  // Wrapper functions with error handling
  const safeOpenFile = useCallback((file: FileNode) => {
    try {
      if (!file) {
        console.error('useEditor.openFile: File is null or undefined');
        return;
      }
      openFile(file);
    } catch (error) {
      console.error('useEditor.openFile: Error opening file:', error);
    }
  }, [openFile]);

  const safeCloseTab = useCallback((tabId: string) => {
    try {
      if (!tabId) {
        console.error('useEditor.closeTab: Invalid tabId');
        return;
      }
      closeTab(tabId);
    } catch (error) {
      console.error('useEditor.closeTab: Error closing tab:', error);
    }
  }, [closeTab]);

  const safeSetActiveTab = useCallback((tabId: string) => {
    try {
      if (!tabId) {
        console.error('useEditor.setActiveTab: Invalid tabId');
        return;
      }
      setActiveTab(tabId);
    } catch (error) {
      console.error('useEditor.setActiveTab: Error setting active tab:', error);
    }
  }, [setActiveTab]);

  return {
    files: files || [],
    tabs: tabs || [],
    activeTab,
    activeTabId,
    activeFile,
    openFile: safeOpenFile,
    closeTab: safeCloseTab,
    updateFileContent,
    setActiveTab: safeSetActiveTab,
    reorderTabs,
    updateCursorPosition,
    markTabDirty,
    createFile,
    createDirectory,
    toggleDirectory,
    getAIContext,
    getFileContent
  };
};