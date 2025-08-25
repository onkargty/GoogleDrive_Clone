import React, { useState } from 'react';
import { useDrive } from '../contexts/DriveContext';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { 
  MoreVertical,
  Download,
  Trash2,
  Star,
  Move,
  Copy
} from 'lucide-react';
import ContextMenu from './ContextMenu';

interface FileItemProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    storage_path: string;
    folder_id: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
  };
  viewMode?: 'grid' | 'list';
}

const FileItem: React.FC<FileItemProps> = ({ file, viewMode = 'grid' }) => {
  const { deleteItems, downloadFile, selectedItems, setSelectedItems, toggleStar, moveToTrash } = useDrive();
  const [showContextMenu, setShowContextMenu] = useState(false);

  const isSelected = selectedItems.includes(file.id);
  const FileIcon = getFileIcon(file.type, file.name);
  const fileTypeColor = getFileTypeColor(file.type, file.name);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems([...selectedItems, file.id]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== file.id));
    }
  };
  const handleDownload = async () => {
    await downloadFile(file.id);
    setShowContextMenu(false);
  };

  const handleStar = async () => {
    await toggleStar(file.id, 'file');
    setShowContextMenu(false);
  };

  const handleTrash = async () => {
    await moveToTrash([file.id], 'file');
    setShowContextMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      await deleteItems([file.id], 'file');
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
      icon: Download,
      label: 'Download',
      onClick: handleDownload,
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
      <div className={`relative group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border border-blue-200' : ''
      }`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <FileIcon className={`h-6 w-6 mr-3 ${fileTypeColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <span className="w-20 text-right">{formatFileSize(file.size)}</span>
          <span className="w-24 text-right">{formatDate(file.created_at)}</span>
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
    );
  }
  return (
    <div className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className={`card p-4 hover:shadow-md transition-all duration-200 ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}>
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <FileIcon className={`h-8 w-8 ${fileTypeColor}`} />
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
        
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1" title={file.name}>
          {file.name}
        </h3>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>{formatFileSize(file.size)}</p>
          <p>{formatDate(file.created_at)}</p>
        </div>
      </div>

      <ContextMenu
        isOpen={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        items={contextMenuItems}
      />
    </div>
  );
};

export default FileItem;