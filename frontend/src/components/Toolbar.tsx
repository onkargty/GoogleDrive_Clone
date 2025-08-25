import React, { useState } from 'react';
import { useDrive } from '../contexts/DriveContext';
import { 
  FolderPlus, 
  Upload, 
  Download, 
  Trash2, 
  Star,
  Move,
  Copy,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface ToolbarProps {
  onCreateFolder: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onCreateFolder }) => {
  const { 
    selectedItems, 
    sortBy, 
    sortOrder, 
    setSortBy, 
    setSortOrder,
    deleteItems,
    moveToTrash,
    toggleStar
  } = useDrive();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const hasSelection = selectedItems.length > 0;

  const handleBulkAction = async (action: string) => {
    if (!hasSelection) return;

    switch (action) {
      case 'star':
        for (const itemId of selectedItems) {
          await toggleStar(itemId, 'file'); // Assuming files for now
        }
        break;
      case 'trash':
        await moveToTrash(selectedItems, 'file');
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to permanently delete these items?')) {
          await deleteItems(selectedItems, 'file');
        }
        break;
    }
    setShowMoreMenu(false);
  };

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'modified', label: 'Last modified' },
    { key: 'size', label: 'Size' },
    { key: 'type', label: 'Type' }
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Create Actions */}
        <button
          onClick={onCreateFolder}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New folder
        </button>

        {/* Selection Actions */}
        {hasSelection && (
          <div className="flex items-center space-x-2 pl-4 border-l border-gray-300">
            <span className="text-sm text-gray-600">
              {selectedItems.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('star')}
              className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add to starred"
            >
              <Star className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleBulkAction('trash')}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Move to trash"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMoreMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => handleBulkAction('download')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => handleBulkAction('move')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Move className="h-4 w-4 mr-2" />
                    Move
                  </button>
                  <button
                    onClick={() => handleBulkAction('copy')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Make a copy
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete forever
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sort and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-2" />
            ) : (
              <SortDesc className="h-4 w-4 mr-2" />
            )}
            Sort
          </button>
          {showSortMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setSortBy(option.key as any);
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === option.key ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                  {sortBy === option.key && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="ml-2"
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;