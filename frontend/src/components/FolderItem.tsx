import React, { useState } from 'react';
import { useDrive } from '../contexts/DriveContext';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';
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
}

const FolderItem: React.FC<FolderItemProps> = ({ folder }) => {
  const { navigateToFolder, deleteFolder, renameFolder } = useDrive();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const handleDoubleClick = () => {
    navigateToFolder(folder.id);
  };

  const handleRename = async (newName: string) => {
    await renameFolder(folder.id, newName);
    setShowRenameModal(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      await deleteFolder(folder.id);
    }
    setShowContextMenu(false);
  };

  const contextMenuItems = [
    {
      icon: Edit2,
      label: 'Rename',
      onClick: () => {
        setShowRenameModal(true);
        setShowContextMenu(false);
      },
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-700',
    },
  ];

  return (
    <>
      <div className="relative group">
        <div
          className="card p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
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
            {new Date(folder.created_at).toLocaleDateString()}
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