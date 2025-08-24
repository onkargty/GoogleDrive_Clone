import React, { useState } from 'react';
import { useDrive } from '../contexts/DriveContext';
import { 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  MoreVertical,
  Download,
  Trash2
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
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
  const { deleteFile, downloadFile } = useDrive();
  const [showContextMenu, setShowContextMenu] = useState(false);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
    if (mimeType.includes('text') || mimeType.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    await downloadFile(file.id);
    setShowContextMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      await deleteFile(file.id);
    }
    setShowContextMenu(false);
  };

  const FileIcon = getFileIcon(file.type);

  const contextMenuItems = [
    {
      icon: Download,
      label: 'Download',
      onClick: handleDownload,
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-700',
    },
  ];

  return (
    <div className="relative group">
      <div className="card p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-2">
          <FileIcon className="h-8 w-8 text-gray-600" />
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
          <p>{new Date(file.created_at).toLocaleDateString()}</p>
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