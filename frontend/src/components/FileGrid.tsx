import React from 'react';
import { useDrive } from '../contexts/DriveContext';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import { Folder, FileText, Grid as Grid3X3, List } from 'lucide-react'id: React.FC = () => {
  const { files, folders, loading } = useDrive();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasContent = folders.length > 0 || files.length > 0;

  if (!hasContent) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Folder className="h-16 w-16 text-gray-300" />
            <FileText className="h-8 w-8 text-gray-300 absolute -bottom-1 -right-1" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files or folders</h3>
        <p className="text-gray-500">Upload files or create folders to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
};

export default FileGrid;