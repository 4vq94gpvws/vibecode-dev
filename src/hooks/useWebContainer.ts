import { useState, useCallback, useRef } from 'react'
import { WebContainer } from '@webcontainer/api'
import { useEditorStore } from '../store/editorStore'

interface WebContainerState {
  isReady: boolean
  isLoading: boolean
  error: string | null
  output: string[]
}

export function useWebContainer() {
  const [state, setState] = useState<WebContainerState>({
    isReady: false,
    isLoading: false,
    error: null,
    output: [],
  })
  
  const webcontainerRef = useRef<WebContainer | null>(null)
  const { files } = useEditorStore()

  const boot = useCallback(async () => {
    if (webcontainerRef.current) return
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      webcontainerRef.current = await WebContainer.boot()
      
      // Mount initial files
      await mountFiles(files)
      
      setState(prev => ({ ...prev, isReady: true, isLoading: false }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to boot WebContainer',
      }))
    }
  }, [files])

  const mountFiles = useCallback(async (fileNodes: any[]) => {
    if (!webcontainerRef.current) return
    
    const fileSystem: Record<string, any> = {}
    
    const processNode = (node: any, path: string = '') => {
      const fullPath = path ? `${path}/${node.name}` : node.name
      
      if (node.type === 'file') {
        fileSystem[fullPath] = {
          file: {
            contents: node.content || '',
          },
        }
      } else if (node.type === 'directory' && node.children) {
        for (const child of node.children) {
          processNode(child, fullPath)
        }
      }
    }
    
    for (const node of fileNodes) {
      processNode(node)
    }
    
    await webcontainerRef.current.mount(fileSystem)
  }, [])

  const runCommand = useCallback(async (command: string) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized')
    }
    
    setState(prev => ({ ...prev, output: [...prev.output, `$ ${command}`] }))
    
    const [cmd, ...args] = command.split(' ')
    
    const process = await webcontainerRef.current.spawn(cmd, args)
    
    process.output.pipeTo(new WritableStream({
      write(data) {
        setState(prev => ({
          ...prev,
          output: [...prev.output, data],
        }))
      },
    }))
    
    return process.exit
  }, [])

  const writeFile = useCallback(async (path: string, content: string) => {
    if (!webcontainerRef.current) return
    
    try {
      await webcontainerRef.current.fs.writeFile(path, content)
    } catch (err) {
      console.error('Failed to write file:', err)
    }
  }, [])

  const readFile = useCallback(async (path: string) => {
    if (!webcontainerRef.current) return ''
    
    try {
      const content = await webcontainerRef.current.fs.readFile(path, 'utf-8')
      return content
    } catch (err) {
      console.error('Failed to read file:', err)
      return ''
    }
  }, [])

  return {
    ...state,
    boot,
    runCommand,
    writeFile,
    readFile,
    mountFiles,
  }
}