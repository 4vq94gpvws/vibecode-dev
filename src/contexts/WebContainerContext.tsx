import React, { createContext, useContext, useState } from 'react';

interface WebContainerContextType {
  webcontainer: null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  runCommand: (command: string, args?: string[]) => Promise<{ output: string; exitCode: number }>;
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  installDependencies: () => Promise<void>;
  startDevServer: () => Promise<void>;
}

const WebContainerContext = createContext<WebContainerContextType | undefined>(undefined);

export const WebContainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error] = useState<string | null>(null);

  const runCommand = async (_command: string, _args: string[] = []) => {
    return { output: 'WebContainer not available in this environment.', exitCode: 0 };
  };

  const writeFile = async (_path: string, _content: string) => {};
  const readFile = async (_path: string) => '';
  const installDependencies = async () => {};
  const startDevServer = async () => {};

  return (
    <WebContainerContext.Provider value={{
      webcontainer: null,
      isReady: false,
      isLoading: false,
      error,
      runCommand,
      writeFile,
      readFile,
      installDependencies,
      startDevServer
    }}>
      {children}
    </WebContainerContext.Provider>
  );
};

export const useWebContainer = () => {
  const context = useContext(WebContainerContext);
  if (!context) throw new Error('useWebContainer must be used within WebContainerProvider');
  return context;
};
