import React, { useEffect, useRef } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ContextMenuItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, onClose, items }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-8 right-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.onClick}
            className={clsx(
              'w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150',
              item.className || 'text-gray-700 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;