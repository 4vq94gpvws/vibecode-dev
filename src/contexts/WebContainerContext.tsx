import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

interface WebContainerContextType {
  webcontainer: WebContainer | null;
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
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    
    const initWebContainer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!('crossOriginIsolated' in window) || !window.crossOriginIsolated) {
          throw new Error('Cross-origin isolation required. Please use a proper server setup.');
        }
        
        const instance = await WebContainer.boot();
        setWebcontainer(instance);
        setIsReady(true);
        bootedRef.current = true;
        
        // Setup initial file structure
        await instance.fs.writeFile('/package.json', JSON.stringify({
          name: 'vibecode-project',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            vite: '^4.4.0'
          }
        }, null, 2));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
        console.error('WebContainer init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initWebContainer();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const runCommand = useCallback(async (command: string, args: string[] = []): Promise<{ output: string; exitCode: number }> => {
    if (!webcontainer) throw new Error('WebContainer not initialized');
    
    const process = await webcontainer.spawn(command, args);
    let output = '';
    
    process.output.pipeTo(new WritableStream({
      write(data) {
        output += data;
      }
    }));
    
    const exitCode = await process.exit;
    return { output, exitCode };
  }, [webcontainer]);

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    if (!webcontainer) throw new Error('WebContainer not initialized');
    await webcontainer.fs.writeFile(path, content);
  }, [webcontainer]);

  const readFile = useCallback(async (path: string): Promise<string> => {
    if (!webcontainer) throw new Error('WebContainer not initialized');
    return await webcontainer.fs.readFile(path, 'utf-8');
  }, [webcontainer]);

  const installDependencies = useCallback(async (): Promise<void> => {
    if (!webcontainer) throw new Error('WebContainer not initialized');
    const process = await webcontainer.spawn('npm', ['install']);
    await process.exit;
  }, [webcontainer]);

  const startDevServer = useCallback(async (): Promise<void> => {
    if (!webcontainer) throw new Error('WebContainer not initialized');
    await webcontainer.spawn('npm', ['run', 'dev']);
  }, [webcontainer]);

  return (
    <WebContainerContext.Provider value={{
      webcontainer,
      isReady,
      isLoading,
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