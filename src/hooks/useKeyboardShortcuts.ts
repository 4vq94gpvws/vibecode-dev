import { useEffect, useCallback } from 'react';
import { useAgents } from './useAgents';
import { useEditor } from './useEditor';

export const useKeyboardShortcuts = () => {
  const { requestCompletion, detectBugs, requestRefactor, generateDocs, generateTests } = useAgents();
  const { getAIContext, activeFile } = useEditor();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle shortcuts when editor is focused
    const target = e.target as HTMLElement;
    const isEditorFocused = target.closest('[data-editor="true"]') !== null;
    
    if (!isEditorFocused) return;

    const context = getAIContext();
    
    // Ctrl+Space: Code Completion
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      if (activeFile) {
        requestCompletion(context);
      }
    }
    
    // Ctrl+Shift+B: Bug Detection
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyB') {
      e.preventDefault();
      if (activeFile) {
        detectBugs(context);
      }
    }
    
    // Ctrl+Shift+R: Refactoring
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
      e.preventDefault();
      if (activeFile) {
        requestRefactor(context);
      }
    }
    
    // Ctrl+Shift+D: Documentation
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      e.preventDefault();
      if (activeFile) {
        generateDocs(context);
      }
    }
    
    // Ctrl+Shift+T: Test Generation
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
      e.preventDefault();
      if (activeFile) {
        generateTests(context);
      }
    }
  }, [requestCompletion, detectBugs, requestRefactor, generateDocs, generateTests, getAIContext, activeFile]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};