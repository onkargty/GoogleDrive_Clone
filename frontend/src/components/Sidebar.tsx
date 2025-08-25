import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HardDrive, 
  Users, 
  Star, 
  Clock, 
  Trash2, 
  Cloud,
  Settings,
  Info
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'My Drive',
      icon: HardDrive,
      path: '/drive',
      active: location.pathname.startsWith('/drive')
    },
    {
      name: 'Shared with me',
      icon: Users,
      path: '/shared',
      active: location.pathname === '/shared'
    },
    {
      name: 'Recent',
      icon: Clock,
      path: '/recent',
      active: location.pathname === '/recent'
    },
    {
      name: 'Starred',
      icon: Star,
      path: '/starred',
      active: location.pathname === '/starred'
    },
    {
      name: 'Trash',
      icon: Trash2,
      path: '/trash',
      active: location.pathname === '/trash'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        {/* Storage Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Storage</span>
            <Cloud className="h-4 w-4 text-gray-400" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500">4.5 GB of 15 GB used</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Info className="h-5 w-5 mr-3" />
            Help & feedback
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;