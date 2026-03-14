import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileNode, Tab } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface EditorContextType {
  files: FileNode[];
  tabs: Tab[];
  activeTabId: string | null;
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setActiveTab: (tabId: string) => void;
  reorderTabs: (dragIndex: number, hoverIndex: number) => void;
  updateCursorPosition: (tabId: string, position: { lineNumber: number; column: number }) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  createFile: (name: string, parentId?: string | null) => void;
  createDirectory: (name: string, parentId?: string | null) => void;
  toggleDirectory: (dirId: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const initialFiles: FileNode[] = [
  {
    id: 'root',
    name: 'project',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'directory',
        isOpen: true,
        parentId: 'root',
        children: [
          {
            id: 'app.tsx',
            name: 'App.tsx',
            type: 'file',
            language: 'typescript',
            parentId: 'src',
            content: `import React from 'react';\
\
function App() {\
  return (\
    <div className="App">\
      <h1>Hello vibecode.dev</h1>\
    </div>\
  );\
}\
\
export default App;`
          },
          {
            id: 'main.tsx',
            name: 'main.tsx',
            type: 'file',
            language: 'typescript',
            parentId: 'src',
            content: `import React from 'react';\
import ReactDOM from 'react-dom/client';\
import App from './App';\
\
ReactDOM.createRoot(document.getElementById('root')!).render(\
  <React.StrictMode>\
    <App />\
  </React.StrictMode>\
);`
          },
          {
            id: 'utils',
            name: 'utils',
            type: 'directory',
            isOpen: false,
            parentId: 'src',
            children: [
              {
                id: 'helpers.ts',
                name: 'helpers.ts',
                type: 'file',
                language: 'typescript',
                parentId: 'utils',
                content: 'export const formatDate = (date: Date): string => {\
  return date.toISOString();\
};'
              }
            ]
          }
        ]
      },
      {
        id: 'package.json',
        name: 'package.json',
        type: 'file',
        language: 'json',
        parentId: 'root',
        content: '{\
  "name": "project",\
  "version": "1.0.0"\
}'
      },
      {
        id: 'readme.md',
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        parentId: 'root',
        content: '# Project\
\
This is a sample project.'
      }
    ]
  }
];

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const findFileById = (files: FileNode[], id: string): FileNode | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateFileInTree = (files: FileNode[], fileId: string, updates: Partial<FileNode>): FileNode[] => {
    return files.map(file => {
      if (file.id === fileId) {
        return { ...file, ...updates };
      }
      if (file.children) {
        return { ...file, children: updateFileInTree(file.children, fileId, updates) };
      }
      return file;
    });
  };

  const openFile = useCallback((file: FileNode) => {
    if (file.type !== 'file') return;
    
    const existingTab = tabs.find(t => t.fileId === file.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: Tab = {
      id: uuidv4(),
      fileId: file.id,
      name: file.name,
      isDirty: false
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const index = prev.findIndex(t => t.id === tabId);
      const newTabs = prev.filter(t => t.id !== tabId);
      
      if (activeTabId === tabId) {
        const newActiveTab = newTabs[Math.min(index, newTabs.length - 1)];
        setActiveTabId(newActiveTab?.id || null);
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prev => updateFileInTree(prev, fileId, { content }));
    const tab = tabs.find(t => t.fileId === fileId);
    if (tab && !tab.isDirty) {
      setTabs(prev => prev.map(t => 
        t.fileId === fileId ? { ...t, isDirty: true } : t
      ));
    }
  }, [tabs]);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const reorderTabs = useCallback((dragIndex: number, hoverIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [draggedTab] = newTabs.splice(dragIndex, 1);
      newTabs.splice(hoverIndex, 0, draggedTab);
      return newTabs;
    });
  }, []);

  const updateCursorPosition = useCallback((tabId: string, position: { lineNumber: number; column: number }) => {
    setTabs(prev => prev.map(t => 
      t.id === tabId ? { ...t, cursorPosition: position } : t
    ));
  }, []);

  const markTabDirty = useCallback((tabId: string, isDirty: boolean) => {
    setTabs(prev => prev.map(t => 
      t.id === tabId ? { ...t, isDirty } : t
    ));
  }, []);

  const createFile = useCallback((name: string, parentId: string | null = 'root') => {
    const newFile: FileNode = {
      id: uuidv4(),
      name,
      type: 'file',
      parentId,
      content: '',
      language: name.split('.').pop() || 'text'
    };
    
    setFiles(prev => {
      if (parentId === null || parentId === 'root') {
        const root = prev[0];
        if (root) {
          return [{ ...root, children: [...(root.children || []), newFile] }];
        }
        return [newFile];
      }
      return updateFileInTree(prev, parentId, {
        children: [...(findFileById(prev, parentId)?.children || []), newFile]
      });
    });
    
    openFile(newFile);
  }, [openFile]);

  const createDirectory = useCallback((name: string, parentId: string | null = 'root') => {
    const newDir: FileNode = {
      id: uuidv4(),
      name,
      type: 'directory',
      parentId,
      isOpen: true,
      children: []
    };
    
    setFiles(prev => {
      if (parentId === null || parentId === 'root') {
        const root = prev[0];
        if (root) {
          return [{ ...root, children: [...(root.children || []), newDir] }];
        }
        return [newDir];
      }
      return updateFileInTree(prev, parentId, {
        children: [...(findFileById(prev, parentId)?.children || []), newDir]
      });
    });
  }, []);

  const toggleDirectory = useCallback((dirId: string) => {
    setFiles(prev => updateFileInTree(prev, dirId, {
      isOpen: !findFileById(prev, dirId)?.isOpen
    }));
  }, []);

  return (
    <EditorContext.Provider value={{
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
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditorContext must be used within EditorProvider');
  return context;
};