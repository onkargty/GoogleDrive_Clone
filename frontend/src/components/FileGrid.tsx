import React from 'react';
import { useDrive } from '../contexts/DriveContext';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import { Folder, FileText, Grid3X3, List } from 'lucide-react';

const FileGrid: React.FC = () => {
  const { files, folders, loading, viewMode, selectedItems, setSelectedItems } = useDrive();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasContent = folders.length > 0 || files.length > 0;

  const handleSelectAll = () => {
    if (selectedItems.length === files.length + folders.length) {
      setSelectedItems([]);
    } else {
      const allIds = [...folders.map(f => f.id), ...files.map(f => f.id)];
      setSelectedItems(allIds);
    }
  };

  const isAllSelected = selectedItems.length === files.length + folders.length && hasContent;

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
    <div>
      {/* Selection Header */}
      {hasContent && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {selectedItems.length > 0 
                  ? `${selectedItems.length} selected`
                  : 'Select all'
                }
              </span>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {folders.length + files.length} items
            </span>
          </div>
        </div>
      )}

      {/* Content Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        : "space-y-1"
      }>
        {folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} viewMode={viewMode} />
        ))}
        {files.map((file) => (
          <FileItem key={file.id} file={file} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
};

export default FileGrid;