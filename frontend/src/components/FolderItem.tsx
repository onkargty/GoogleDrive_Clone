import React, { useState } from 'react';
import { useDrive } from '../contexts/DriveContext';
import { formatDate } from '../utils/fileUtils';
import { Folder, MoreVertical, Edit2, Trash2, Star, Move, Copy } from 'lucide-react';
import ContextMenu from './ContextMenu';
import RenameModal from './RenameModal';

interface FolderItemProps {
  folder: {
    id: string;
    name: string;
    parent_id: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
  };
  viewMode?: 'grid' | 'list';
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, viewMode = 'grid' }) => {
  const { 
    navigateToFolder, 
    deleteItems, 
    renameItem, 
    selectedItems, 
    setSelectedItems,
    toggleStar,
    moveToTrash
  } = useDrive();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const isSelected = selectedItems.includes(folder.id);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems([...selectedItems, folder.id]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== folder.id));
    }
  };

  const handleDoubleClick = () => {
    navigateToFolder(folder.id);
  };

  const handleRename = async (newName: string) => {
    await renameItem(folder.id, newName, 'folder');
    setShowRenameModal(false);
  };

  const handleStar = async () => {
    await toggleStar(folder.id, 'folder');
    setShowContextMenu(false);
  };

  const handleTrash = async () => {
    await moveToTrash([folder.id], 'folder');
    setShowContextMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      await deleteItems([folder.id], 'folder');
    }
    setShowContextMenu(false);
  };

  const contextMenuItems = [
    {
      icon: Star,
      label: 'Add to starred',
      onClick: handleStar,
    },
    {
      icon: Edit2,
      label: 'Rename',
      onClick: () => {
        setShowRenameModal(true);
        setShowContextMenu(false);
      },
    },
    {
      icon: Move,
      label: 'Move',
      onClick: () => setShowContextMenu(false),
    },
    {
      icon: Copy,
      label: 'Make a copy',
      onClick: () => setShowContextMenu(false),
    },
    {
      icon: Trash2,
      label: 'Move to trash',
      onClick: handleTrash,
    },
    {
      icon: Trash2,
      label: 'Delete forever',
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-700',
    },
  ];

  if (viewMode === 'list') {
    return (
      <>
        <div className={`relative group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
          isSelected ? 'bg-blue-50 border border-blue-200' : ''
        }`} onDoubleClick={handleDoubleClick}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          <Folder className="h-6 w-6 mr-3 text-blue-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="w-20 text-right">—</span>
            <span className="w-24 text-right">{formatDate(folder.created_at)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(!showContextMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          
          <ContextMenu
            isOpen={showContextMenu}
            onClose={() => setShowContextMenu(false)}
            items={contextMenuItems}
          />
        </div>

        <RenameModal
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          onRename={handleRename}
          currentName={folder.name}
          title="Rename Folder"
        />
      </>
    );
  }
  return (
    <>
      <div className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div
          className={`card p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
            isSelected ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onDoubleClick={handleDoubleClick}
        >
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <Folder className="h-8 w-8 text-primary-600" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(!showContextMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity duration-200"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 truncate" title={folder.name}>
            {folder.name}
          </h3>
          
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(folder.created_at)}
          </p>
        </div>

        <ContextMenu
          isOpen={showContextMenu}
          onClose={() => setShowContextMenu(false)}
          items={contextMenuItems}
        />
      </div>

      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRename}
        currentName={folder.name}
        title="Rename Folder"
      />
    </>
  );
};

export default FolderItem;