import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDrive } from '../contexts/DriveContext';
import { HardDrive as Drive, LogOut, FolderPlus, User } from 'lucide-react';
import CreateFolderModal from './CreateFolderModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { createFolder } = useDrive();
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const handleCreateFolder = async (name: string) => {
    await createFolder(name);
    setShowCreateFolder(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Drive className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Drive Clone
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </button>

              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{user?.email}</span>
                </div>
                
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
};

export default Header;