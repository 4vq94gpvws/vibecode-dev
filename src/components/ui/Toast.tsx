import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  const bgColors = {
    success: 'bg-gray-800 border-green-500/30',
    error: 'bg-gray-800 border-red-500/30',
    info: 'bg-gray-800 border-blue-500/30',
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] animate-in slide-in-from-right ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="flex-1 text-sm text-gray-200">{message}</p>
      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
