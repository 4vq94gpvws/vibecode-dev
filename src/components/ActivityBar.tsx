import React from 'react';
import {
  MessageSquare,
  FolderOpen,
  Search,
  GitBranch,
  Settings,
  Bug,
  Puzzle,
  User,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const activities = [
  { id: 'explorer', icon: FolderOpen, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'debug', icon: Bug, label: 'Debug' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
];

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const { openSettings } = useSettings();

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-2">
      <div className="flex-1 flex flex-col gap-1">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isActive = activeView === activity.id;
          
          return (
            <button
              key={activity.id}
              onClick={() => onViewChange(activity.id)}
              className={`relative p-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#3c3c3c]'
              }`}
              title={activity.label}
            >
              <Icon className="w-6 h-6" />
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full" />
              )}
            </button>
          );
        })}}
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={openSettings}
          className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-all"
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
        <button
          className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-all"
          title="Account"
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
