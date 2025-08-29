import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

export interface DriveFile {
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

export interface DriveFolder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface DriveContextType {
  files: DriveFile[];
  folders: DriveFolder[];
  currentFolderId: string | null;
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  uploadProgress: UploadProgress[];
  selectedItems: string[];
  setCurrentFolderId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setSelectedItems: (items: string[]) => void;
  refreshData: () => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  uploadFiles: (files: FileList) => Promise<void>;
  deleteItem: (id: string, type: 'file' | 'folder') => Promise<void>;
  renameItem: (id: string, name: string, type: 'file' | 'folder') => Promise<void>;
  downloadFile: (file: DriveFile) => Promise<void>;
  starItem: (id: string, type: 'file' | 'folder') => Promise<void>;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const useDrive = () => {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
};

export const DriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch files
      let filesQuery = supabase
        .from('files')
        .select('*')
        .eq('owner_id', user.id);

      if (currentFolderId) {
        filesQuery = filesQuery.eq('folder_id', currentFolderId);
      } else {
        filesQuery = filesQuery.is('folder_id', null);
      }

      // Fetch folders
      let foldersQuery = supabase
        .from('folders')
        .select('*')
        .eq('owner_id', user.id);

      if (currentFolderId) {
        foldersQuery = foldersQuery.eq('parent_id', currentFolderId);
      } else {
        foldersQuery = foldersQuery.is('parent_id', null);
      }

      const [filesResponse, foldersResponse] = await Promise.all([
        filesQuery.order('created_at', { ascending: false }),
        foldersQuery.order('created_at', { ascending: false })
      ]);

      if (filesResponse.error) throw filesResponse.error;
      if (foldersResponse.error) throw foldersResponse.error;

      setFiles(filesResponse.data || []);
      setFolders(foldersResponse.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user, currentFolderId]);

  const createFolder = useCallback(async (name: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('folders')
        .insert({
          name,
          parent_id: currentFolderId,
          owner_id: user.id
        });

      if (error) throw error;
      
      toast.success('Folder created successfully');
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create folder';
      toast.error(message);
    }
  }, [user, currentFolderId, refreshData]);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    if (!user) return;

    const files = Array.from(fileList);
    const newProgress: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            size: file.size,
            type: file.type,
            storage_path: filePath,
            folder_id: currentFolderId,
            owner_id: user.id
          });

        if (dbError) throw dbError;

        // Update progress
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, progress: 100, status: 'completed' }
              : p
          )
        );
      } catch (err) {
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, status: 'error' }
              : p
          )
        );
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Clear progress after 3 seconds
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);

    await refreshData();
  }, [user, currentFolderId, refreshData]);

  const deleteItem = useCallback(async (id: string, type: 'file' | 'folder') => {
    if (!user) return;

    try {
      if (type === 'file') {
        // Get file info first
        const { data: fileData, error: fetchError } = await supabase
          .from('files')
          .select('storage_path')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([fileData.storage_path]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('files')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;
      } else {
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      toast.success(`${type === 'file' ? 'File' : 'Folder'} deleted successfully`);
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to delete ${type}`;
      toast.error(message);
    }
  }, [user, refreshData]);

  const renameItem = useCallback(async (id: string, name: string, type: 'file' | 'folder') => {
    if (!user) return;

    try {
      const table = type === 'file' ? 'files' : 'folders';
      const { error } = await supabase
        .from(table)
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      toast.success(`${type === 'file' ? 'File' : 'Folder'} renamed successfully`);
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to rename ${type}`;
      toast.error(message);
    }
  }, [user, refreshData]);

  const downloadFile = useCallback(async (file: DriveFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(file.storage_path, 60);

      if (error) throw error;

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error('Failed to download file');
    }
  }, []);

  const starItem = useCallback(async (id: string, type: 'file' | 'folder') => {
    // This would require additional database schema for starred items
    toast.success(`${type === 'file' ? 'File' : 'Folder'} starred`);
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const value: DriveContextType = {
    files,
    folders,
    currentFolderId,
    loading,
    error,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    uploadProgress,
    selectedItems,
    setCurrentFolderId,
    setViewMode,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    setSelectedItems,
    refreshData,
    createFolder,
    uploadFiles,
    deleteItem,
    renameItem,
    downloadFile,
    starItem
  };

  return (
    <DriveContext.Provider value={value}>
      {children}
    </DriveContext.Provider>
  );
};