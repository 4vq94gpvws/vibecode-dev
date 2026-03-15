import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'directory'
  content?: string
  language?: string
  isOpen?: boolean
  isModified?: boolean
  children?: FileNode[]
  parentId?: string | null
}

export interface Tab {
  id: string
  fileId: string
  isActive: boolean
}

type ViewType = 'explorer' | 'search' | 'git' | 'ai' | 'settings'

interface EditorState {
  // View state
  activeView: ViewType
  setActiveView: (view: ViewType) => void
  
  // File system
  files: FileNode[]
  setFiles: (files: FileNode[]) => void
  addFile: (file: FileNode, parentId?: string | null) => void
  updateFile: (id: string, updates: Partial<FileNode>) => void
  deleteFile: (id: string) => void
  renameFile: (id: string, newName: string) => void
  toggleFolder: (id: string) => void
  
  // Tabs
  tabs: Tab[]
  openTab: (fileId: string) => void
  closeTab: (fileId: string) => void
  setActiveTab: (fileId: string) => void
  activeFileId: string | null
  
  // Editor content
  updateFileContent: (fileId: string, content: string) => void
  
  // AI Chat
  aiMessages: { role: 'user' | 'assistant'; content: string; timestamp: number }[]
  addAIMessage: (message: { role: 'user' | 'assistant'; content: string }) => void
  clearAIMessages: () => void
}

const defaultFiles: FileNode[] = [
  {
    id: 'root',
    name: 'project',
    type: 'directory',
    isOpen: true,
    parentId: null,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'directory',
        isOpen: true,
        parentId: 'root',
        children: [
          {
            id: 'main',
            name: 'main.js',
            type: 'file',
            language: 'javascript',
            content: `console.log('Hello from VibeDraft.Dev!');

// Try editing this file and see the changes live
function greet(name) {
  return \`Hello, \${name}! Welcome to VibeDraft.Dev\`;
}

console.log(greet('Developer'));`,
            parentId: 'src',
          },
          {
            id: 'utils',
            name: 'utils.js',
            type: 'file',
            language: 'javascript',
            content: `// Utility functions
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};`,
            parentId: 'src',
          },
        ],
      },
      {
        id: 'package',
        name: 'package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "vibedraft-project",
  "version": "1.0.0",
  "description": "A project created with VibeDraft.Dev",
  "main": "src/main.js",
  "scripts": {
    "start": "node src/main.js",
    "dev": "node src/main.js"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}`,
        parentId: 'root',
      },
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: `# VibeDraft Project

Welcome to your new project!

## Getting Started

1. Edit files in the editor
2. Run commands in the terminal
3. See your changes live!

## Features

- Monaco Editor with syntax highlighting
- WebContainer for Node.js runtime
- AI-powered code assistance
- Multi-tab editing

Happy coding!`,
        parentId: 'root',
      },
    ],
  },
]

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
  // View state
  activeView: 'explorer',
  setActiveView: (view) => set({ activeView: view }),
  
  // File system
  files: defaultFiles,
  setFiles: (files) => set({ files }),
  
  addFile: (file, parentId = null) => {
    const { files } = get()
    
    const addToParent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === parentId && node.type === 'directory') {
          return {
            ...node,
            children: [...(node.children || []), { ...file, parentId }],
            isOpen: true,
          }
        }
        if (node.children) {
          return { ...node, children: addToParent(node.children) }
        }
        return node
      })
    }
    
    if (parentId === null) {
      set({ files: [...files, file] })
    } else {
      set({ files: addToParent(files) })
    }
  },
  
  updateFile: (id, updates) => {
    const { files } = get()
    
    const updateInTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, ...updates }
        }
        if (node.children) {
          return { ...node, children: updateInTree(node.children) }
        }
        return node
      })
    }
    
    set({ files: updateInTree(files) })
  },
  
  deleteFile: (id) => {
    const { files, tabs, activeFileId } = get()
    
    const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => {
          if (node.children) {
            return { ...node, children: deleteFromTree(node.children) }
          }
          return node
        })
    }
    
    set({
      files: deleteFromTree(files),
      tabs: tabs.filter((t) => t.fileId !== id),
      activeFileId: activeFileId === id ? null : activeFileId,
    })
  },
  
  renameFile: (id, newName) => {
    const { files } = get()
    
    const renameInTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          const ext = newName.split('.').pop()
          const languageMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            jsx: 'javascript',
            tsx: 'typescript',
            json: 'json',
            md: 'markdown',
            css: 'css',
            html: 'html',
          }
          return {
            ...node,
            name: newName,
            language: ext ? languageMap[ext] || 'text' : node.language,
          }
        }
        if (node.children) {
          return { ...node, children: renameInTree(node.children) }
        }
        return node
      })
    }
    
    set({ files: renameInTree(files) })
  },
  
  toggleFolder: (id) => {
    const { files } = get()
    
    const toggleInTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen }
        }
        if (node.children) {
          return { ...node, children: toggleInTree(node.children) }
        }
        return node
      })
    }
    
    set({ files: toggleInTree(files) })
  },
  
  // Tabs
  tabs: [],
  activeFileId: null,
  
  openTab: (fileId) => {
    const { tabs } = get()
    const existingTab = tabs.find((t) => t.fileId === fileId)
    
    if (!existingTab) {
      set({
        tabs: [...tabs, { id: fileId, fileId, isActive: false }],
      })
    }
    get().setActiveTab(fileId)
  },
  
  closeTab: (fileId) => {
    const { tabs, activeFileId } = get()
    const newTabs = tabs.filter((t) => t.fileId !== fileId)
    
    if (activeFileId === fileId && newTabs.length > 0) {
      const lastTab = newTabs[newTabs.length - 1]
      set({
        tabs: newTabs.map((t) => ({ ...t, isActive: t.fileId === lastTab.fileId })),
        activeFileId: lastTab.fileId,
      })
    } else {
      set({ tabs: newTabs })
    }
  },
  
  setActiveTab: (fileId) => {
    const { tabs } = get()
    set({
      tabs: tabs.map((t) => ({ ...t, isActive: t.fileId === fileId })),
      activeFileId: fileId,
    })
  },
  
  // Editor content
  updateFileContent: (fileId, content) => {
    const { files } = get()
    
    const updateContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === fileId) {
          return { ...node, content, isModified: true }
        }
        if (node.children) {
          return { ...node, children: updateContent(node.children) }
        }
        return node
      })
    }
    
    set({ files: updateContent(files) })
  },
  
  // AI Chat
  aiMessages: [],
  addAIMessage: (message) => {
    set((state) => ({
      aiMessages: [...state.aiMessages, { ...message, timestamp: Date.now() }],
    }))
  },
  clearAIMessages: () => set({ aiMessages: [] }),
    }),
    {
      name: 'vibecode-editor',
      partialize: (state) => ({
        files: state.files,
        tabs: state.tabs,
        activeFileId: state.activeFileId,
        activeView: state.activeView,
        aiMessages: state.aiMessages,
      }),
    },
  ),
)
