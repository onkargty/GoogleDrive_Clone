import React from 'react';
import { useDrive } from '../contexts/DriveContext';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const { breadcrumbs, navigateToBreadcrumb } = useDrive();

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.id || 'root'}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          <button
            onClick={() => navigateToBreadcrumb(index)}
            className={`flex items-center px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {index === 0 && <Home className="h-4 w-4 mr-1" />}
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;