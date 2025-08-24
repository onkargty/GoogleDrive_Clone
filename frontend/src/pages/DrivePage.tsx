import React, { useEffect } from 'react';
import { useDrive } from '../contexts/DriveContext';
import Header from '../components/Header';
import FileGrid from '../components/FileGrid';
import UploadArea from '../components/UploadArea';

const DrivePage: React.FC = () => {
  const { refreshData, error } = useDrive();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <UploadArea />
        <FileGrid />
      </main>
    </div>
  );
};

export default DrivePage;