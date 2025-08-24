import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../lib/api';

interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
  folder_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface DriveFolder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface DriveContextType {
  files: DriveFile[];
  folders: DriveFolder[];
  currentFolderId: string | null;
  loading: boolean;
  error: string | null;
  uploadFile: (file: File, folderId?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  navigateToFolder: (folderId: string | null) => void;
  refreshData: () => Promise<void>;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const useDrive = () => {
  const context = useContext(DriveContext);
  if (context === undefined) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
};

export const DriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [filesResponse, foldersResponse] = await Promise.all([
        apiClient.getFiles(currentFolderId || undefined),
        apiClient.getFolders(currentFolderId || undefined),
      ]);

      setFiles(filesResponse.files || []);
      setFolders(foldersResponse.folders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  const uploadFile = async (file: File, folderId?: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.uploadFile(file, folderId || currentFolderId || undefined);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string, parentId?: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.createFolder(name, parentId || currentFolderId || undefined);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteFile(fileId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteFolder(folderId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const renameFolder = async (folderId: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.renameFolder(folderId, name);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const response = await apiClient.downloadFile(fileId);
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
      throw err;
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const value = {
    files,
    folders,
    currentFolderId,
    loading,
    error,
    uploadFile,
    createFolder,
    deleteFile,
    deleteFolder,
    renameFolder,
    downloadFile,
    navigateToFolder,
    refreshData,
  };

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};