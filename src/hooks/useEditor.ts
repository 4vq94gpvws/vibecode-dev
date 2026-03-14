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

  const activeTab = useMemo(() => 
    tabs.find(t => t.id === activeTabId) || null,
    [tabs, activeTabId]
  );

  const activeFile = useMemo(() => {
    if (!activeTab) return null;
    const findFile = (nodes: FileNode[]): FileNode | null => {
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
      projectFiles: files
    };
  }, [activeFile, activeTab, files]);

  const getFileContent = useCallback((fileId: string): string => {
    const findFile = (nodes: FileNode[]): FileNode | null => {
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

  return {
    files,
    tabs,
    activeTab,
    activeTabId,
    activeFile,
    openFile,
    closeTab,
    updateFileContent,
    setActiveTab,
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