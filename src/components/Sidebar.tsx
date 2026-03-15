import { useState } from 'react'
import { Plus, Clock, MoreHorizontal, Image, Mic, ChevronDown, Sparkles } from 'lucide-react'

export function Sidebar() {
  const [agentMode, setAgentMode] = useState('Agent')
  const [autoMode, setAutoMode] = useState('Auto')
  const [localMode, setLocalMode] = useState('Local')

  return (
    <div className="w-80 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
      {/* Header - New Chat */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">New Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors" title="New chat">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors" title="History">
            <Clock className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors" title="More">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="flex-1 p-4">
        <div className="bg-[#3c3c3c] rounded-lg p-3">
          <textarea
            placeholder="Plan, @ for context, / for commands"
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 resize-none outline-none min-h-[80px]"
            rows={3}
          />
          
          {/* Input Actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* Agent Dropdown */}
              <button className="flex items-center gap-1 px-2 py-1 bg-[#252526] rounded text-xs text-gray-400 hover:text-gray-300 transition-colors">
                <Sparkles className="w-3 h-3" />
                <span>{agentMode}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Auto Dropdown */}
              <button className="flex items-center gap-1 px-2 py-1 bg-[#252526] rounded text-xs text-gray-400 hover:text-gray-300 transition-colors">
                <span>{autoMode}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-[#4c4c4c] rounded transition-colors" title="Add image">
                <Image className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#4c4c4c] rounded transition-colors" title="Voice input">
                <Mic className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Local Dropdown */}
      <div className="px-4 py-3 border-t border-[#3c3c3c]">
        <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 transition-colors">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>{localMode}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}