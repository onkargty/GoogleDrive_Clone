import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDrive } from '../contexts/DriveContext';
import UploadArea from './UploadArea';
import FileGrid from './FileGrid';
import Breadcrumbs from './Breadcrumbs';
import Toolbar from './Toolbar';
import CreateFolderModal from './CreateFolderModal';

const DriveContent: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { navigateToFolder, createFolder } = useDrive();
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  React.useEffect(() => {
    navigateToFolder(folderId || null);
  }, [folderId, navigateToFolder]);

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, folderId);
    setShowCreateFolder(false);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <div className="border-b border-gray-200 px-6 py-3">
          <Breadcrumbs />
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 px-6 py-3">
          <Toolbar onCreateFolder={() => setShowCreateFolder(true)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <UploadArea />
          <FileGrid />
        </div>
      </div>

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default DriveContent;