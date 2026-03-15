import { 
  GitBranch, 
  XCircle, 
  AlertTriangle, 
  Check, 
  Bell,
  Zap
} from 'lucide-react'

export function StatusBar() {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
            <GitBranch className="w-3.5 h-3.5" />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
            <XCircle className="w-3.5 h-3.5" />
            <span>0</span>
            <AlertTriangle className="w-3.5 h-3.5 ml-2" />
            <span>0</span>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
            <Check className="w-3.5 h-3.5" />
            <span>Prettier</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
            <Zap className="w-3.5 h-3.5" />
            <span>Cursor Tab</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
            <Bell className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
  )
}