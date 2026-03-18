import type { FileNode } from '../store/editorStore'

const extToLang: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  json: 'json', md: 'markdown', css: 'css', html: 'html', py: 'python',
  yml: 'yaml', yaml: 'yaml', sh: 'shell', txt: 'text',
}

interface GitHubFile {
  path: string
  type: 'blob' | 'tree'
  url: string
  size?: number
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', '.cache', 'coverage'])
const MAX_FILE_SIZE = 500 * 1024 // 500KB

function parseRepoUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  // Supports: https://github.com/owner/repo, github.com/owner/repo, owner/repo
  const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '')
  
  const fullMatch = cleaned.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+))?$/)
  if (fullMatch) return { owner: fullMatch[1], repo: fullMatch[2], branch: fullMatch[3] }
  
  const shortMatch = cleaned.match(/^([^/]+)\/([^/]+)$/)
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] }
  
  return null
}

async function fetchGitHubApi(url: string): Promise<Response> {
  return fetch(url, {
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  })
}

export async function importFromGitHub(
  url: string,
  onProgress?: (msg: string) => void,
): Promise<{ name: string; root: FileNode }> {
  const parsed = parseRepoUrl(url)
  if (!parsed) throw new Error('Invalid GitHub URL. Use: https://github.com/owner/repo')

  const { owner, repo, branch } = parsed
  onProgress?.(`Fetching ${owner}/${repo}...`)

  // Get default branch if not specified
  let targetBranch = branch
  if (!targetBranch) {
    const repoResp = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repo}`)
    if (repoResp.status === 404) throw new Error('Repository not found. Make sure it exists and is public.')
    if (!repoResp.ok) throw new Error(`GitHub API error: ${repoResp.status}`)
    const repoData = await repoResp.json()
    targetBranch = repoData.default_branch || 'main'
  }

  // Get the full file tree
  onProgress?.('Loading file tree...')
  const treeResp = await fetchGitHubApi(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`
  )
  if (!treeResp.ok) throw new Error(`Could not load repository tree (branch: ${targetBranch})`)
  const treeData = await treeResp.json()

  // Filter files
  const files: GitHubFile[] = (treeData.tree || []).filter((item: GitHubFile) => {
    if (item.type !== 'blob') return false
    const parts = item.path.split('/')
    if (parts.some(p => SKIP_DIRS.has(p))) return false
    if ((item.size || 0) > MAX_FILE_SIZE) return false
    return true
  })

  if (files.length === 0) throw new Error('No files found in repository')

  // Fetch file contents (batch, max 15 concurrent)
  onProgress?.(`Downloading ${files.length} files...`)
  const contents = new Map<string, string>()
  const batchSize = 15

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    onProgress?.(`Downloading files ${i + 1}-${Math.min(i + batchSize, files.length)} of ${files.length}...`)
    
    const results = await Promise.allSettled(
      batch.map(async (file) => {
        const resp = await fetchGitHubApi(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${targetBranch}`
        )
        if (!resp.ok) return
        const data = await resp.json()
        if (data.encoding === 'base64' && data.content) {
          try {
            const text = atob(data.content.replace(/\n/g, ''))
            // Skip binary-looking content
            if (!text.includes('\0')) {
              contents.set(file.path, text)
            }
          } catch { /* skip decode errors */ }
        }
      })
    )
  }

  if (contents.size === 0) throw new Error('Could not download any files')

  // Build file tree
  onProgress?.('Building project...')
  const root: FileNode = {
    id: 'root',
    name: repo,
    type: 'directory',
    isOpen: true,
    parentId: null,
    children: [],
  }

  for (const [path, content] of contents) {
    const parts = path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1

      if (isFile) {
        const ext = part.split('.').pop()?.toLowerCase() || ''
        current.children!.push({
          id: path,
          name: part,
          type: 'file',
          content,
          language: extToLang[ext] || 'text',
          parentId: current.id,
        })
      } else {
        let dir = current.children!.find(c => c.name === part && c.type === 'directory')
        if (!dir) {
          const dirId = parts.slice(0, i + 1).join('/')
          dir = { id: dirId, name: part, type: 'directory', isOpen: true, parentId: current.id, children: [] }
          current.children!.push(dir)
        }
        current = dir
      }
    }
  }

  return { name: repo, root }
}
