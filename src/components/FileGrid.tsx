import React from 'react';
import { useDrive } from '../contexts/DriveContext';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import { Folder, FileText } from 'lucide-react';

const FileGrid: React.FC = () => {
  const { files, folders, loading, viewMode } = useDrive();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-6">Name</div>
          <div className="col-span-2 text-right">Size</div>
          <div className="col-span-3 text-right">Modified</div>
          <div className="col-span-1"></div>
        </div>
        {folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} viewMode="list" />
        ))}
        {files.map((file) => (
          <FileItem key={file.id} file={file} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} viewMode="grid" />
      ))}
      {files.map((file) => (
        <FileItem key={file.id} file={file} viewMode="grid" />
      ))}
    </div>
  );
};

export default FileGrid;