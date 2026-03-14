export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

export const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript React',
    js: 'JavaScript',
    jsx: 'JavaScript React',
    json: 'JSON',
    md: 'Markdown',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    py: 'Python',
    rs: 'Rust',
    go: 'Go',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    php: 'PHP',
    rb: 'Ruby',
    swift: 'Swift',
    kt: 'Kotlin'
  };
  return langMap[ext || ''] || 'Plain Text';
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};