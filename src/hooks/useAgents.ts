import { useCallback } from 'react';
import { AIContext } from '../types';
import { useAgentContext } from '../contexts/AgentContext';

export const useAgents = () => {
  const ctx = useAgentContext() as any;

  const messages = ctx.messages || [];
  const activeAgents = ctx.activeAgents || [];
  const isProcessing = ctx.isProcessing || false;
  const currentStreamingMessage = ctx.currentStreamingMessage || null;
  const suggestions = ctx.suggestions || [];
  const sendMessage = ctx.sendMessage || (async () => {});
  const clearMessages = ctx.clearMessages || (() => {});
  const toggleAgent = ctx.toggleAgent || (() => {});
  const applySuggestion = ctx.applySuggestion || (() => {});
  const dismissSuggestion = ctx.dismissSuggestion || (() => {});

  const requestCompletion = useCallback((context: AIContext) => {
    return sendMessage('completion', 'Complete this code', context);
  }, [sendMessage]);

  const detectBugs = useCallback((context: AIContext) => {
    return sendMessage('bug', 'Analyze for bugs', context);
  }, [sendMessage]);

  const requestRefactor = useCallback((context: AIContext) => {
    return sendMessage('refactor', 'Refactor selected code', context);
  }, [sendMessage]);

  const generateDocs = useCallback((context: AIContext) => {
    return sendMessage('docs', 'Generate documentation', context);
  }, [sendMessage]);

  const generateTests = useCallback((context: AIContext) => {
    return sendMessage('test', 'Generate unit tests', context);
  }, [sendMessage]);

  return {
    messages,
    activeAgents,
    isProcessing,
    currentStreamingMessage,
    suggestions,
    requestCompletion,
    detectBugs,
    requestRefactor,
    generateDocs,
    generateTests,
    clearMessages,
    toggleAgent,
    applySuggestion,
    dismissSuggestion
  };
};
