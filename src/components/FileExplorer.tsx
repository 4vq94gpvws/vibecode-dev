import React, { useState } from 'react';
import { useEditor } from '../hooks/useEditor';
import { FileNode } from '../types';
import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown, Plus, FilePlus, FolderPlus } from 'lucide-react';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const { openFile, toggleDirectory, createFile, createDirectory } = useEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleClick = () => {
    if (node.type === 'directory') {
      toggleDirectory(node.id);
    } else {
      openFile(node);
    }
  };

  const handleCreateFile = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItemName.trim()) {
      createFile(newItemName.trim(), node.id);
      setNewItemName('');
      setShowNewFileInput(false);
    }
    if (e.key === 'Escape') {
      setNewItemName('');
      setShowNewFileInput(false);
    }
  };

  const handleCreateFolder = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItemName.trim()) {
      createDirectory(newItemName.trim(), node.id);
      setNewItemName('');
      setShowNewFolderInput(false);
    }
    if (e.key === 'Escape') {
      setNewItemName('');
      setShowNewFolderInput(false);
    }
  };

  const getFileIcon = () => {
    if (node.type === 'directory') {
      return node.isOpen ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-400" />;
    }
    const ext = node.name.split('.').pop()?.toLowerCase();
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
    return <FileCode size={16} className={colorClass} />;
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-editor-hover transition-colors ${
          level > 0 ? 'ml-4' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="mr-1">
          {node.type === 'directory' && (
            node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </span>
        <span className="mr-2">{getFileIcon()}</span>
        <span className="text-sm text-editor-fg truncate">{node.name}</span>
        
        {isHovered && node.type === 'directory' && (
          <div className="ml-auto flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNewFileInput(true);
              }}
              className="p-1 hover:bg-editor-active rounded"
              title="New File"
            >
              <FilePlus size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNewFolderInput(true);
              }}
              className="p-1 hover:bg-editor-active rounded"
              title="New Folder"
            >
              <FolderPlus size={12} />
            </button>
          </div>
        )}
      </div>
      
      {showNewFileInput && (
        <div
          className="flex items-center py-1 px-2 ml-4"
          style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
        >
          <FileCode size={16} className="mr-2 text-gray-400" />
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleCreateFile}
            onBlur={() => setShowNewFileInput(false)}
            autoFocus
            className="bg-editor-active text-editor-fg text-sm px-2 py-0.5 rounded outline-none border border-editor-border"
            placeholder="filename..."
          />
        </div>
      )}
      
      {showNewFolderInput && (
        <div
          className="flex items-center py-1 px-2 ml-4"
          style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
        >
          <Folder size={16} className="mr-2 text-blue-400" />
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleCreateFolder}
            onBlur={() => setShowNewFolderInput(false)}
            autoFocus
            className="bg-editor-active text-editor-fg text-sm px-2 py-0.5 rounded outline-none border border-editor-border"
            placeholder="foldername..."
          />
        </div>
      )}
      
      {node.type === 'directory' && node.isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC = () => {
  const { files, createFile, createDirectory } = useEditor();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleCreateFile = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItemName.trim()) {
      createFile(newItemName.trim());
      setNewItemName('');
      setShowNewFileInput(false);
    }
  };

  const handleCreateFolder = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItemName.trim()) {
      createDirectory(newItemName.trim());
      setNewItemName('');
      setShowNewFolderInput(false);
    }
  };

  return (
    <div className="w-64 bg-editor-sidebar border-r border-editor-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-editor-border">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewFileInput(true)}
            className="p-1 hover:bg-editor-active rounded"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="p-1 hover:bg-editor-active rounded"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>
      
      {showNewFileInput && (
        <div className="px-4 py-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleCreateFile}
            onBlur={() => setShowNewFileInput(false)}
            autoFocus
            className="w-full bg-editor-active text-editor-fg text-sm px-2 py-1 rounded outline-none border border-editor-border"
            placeholder="New file name..."
          />
        </div>
      )}
      
      {showNewFolderInput && (
        <div className="px-4 py-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleCreateFolder}
            onBlur={() => setShowNewFolderInput(false)}
            autoFocus
            className="w-full bg-editor-active text-editor-fg text-sm px-2 py-1 rounded outline-none border border-editor-border"
            placeholder="New folder name..."
          />
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-2">
        {files.map(node => (
          <FileTreeItem key={node.id} node={node} level={0} />
        ))}
      </div>
    </div>
  );
};