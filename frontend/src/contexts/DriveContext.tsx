import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DriveFile, DriveFolder, BreadcrumbItem, UploadProgress, ViewMode, SortBy, SortOrder } from '../types';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface DriveContextType {
  files: DriveFile[];
  folders: DriveFolder[];
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  uploadProgress: UploadProgress[];
  selectedItems: string[];
  
  // Actions
  uploadFiles: (files: File[], folderId?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteItems: (itemIds: string[], itemType: 'file' | 'folder') => Promise<void>;
  renameItem: (itemId: string, newName: string, itemType: 'file' | 'folder') => Promise<void>;
  moveItems: (itemIds: string[], targetFolderId: string | null, itemType: 'file' | 'folder') => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  toggleStar: (itemId: string, itemType: 'file' | 'folder') => Promise<void>;
  moveToTrash: (itemIds: string[], itemType: 'file' | 'folder') => Promise<void>;
  restoreFromTrash: (itemIds: string[], itemType: 'file' | 'folder') => Promise<void>;
  
  // Navigation
  navigateToFolder: (folderId: string | null) => void;
  navigateToBreadcrumb: (index: number) => void;
  
  // UI State
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setSelectedItems: (items: string[]) => void;
  
  // Data refresh
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
  const { user } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'My Drive' }]);
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
        .eq('owner_id', user.id)
        .eq('is_trashed', false);

      if (currentFolderId) {
        filesQuery = filesQuery.eq('folder_id', currentFolderId);
      } else {
        filesQuery = filesQuery.is('folder_id', null);
      }

      // Fetch folders
      let foldersQuery = supabase
        .from('folders')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_trashed', false);

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

  const buildBreadcrumbs = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setBreadcrumbs([{ id: null, name: 'My Drive' }]);
      return;
    }

    const breadcrumbItems: BreadcrumbItem[] = [{ id: null, name: 'My Drive' }];
    let currentId = folderId;

    while (currentId) {
      const { data: folder } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('id', currentId)
        .single();

      if (folder) {
        breadcrumbItems.push({ id: folder.id, name: folder.name });
        currentId = folder.parent_id;
      } else {
        break;
      }
    }

    setBreadcrumbs(breadcrumbItems.reverse());
  }, []);

  const uploadFiles = async (files: File[], folderId?: string) => {
    if (!user) return;

    const targetFolderId = folderId || currentFolderId;

    for (const file of files) {
      const progressId = uuidv4();
      setUploadProgress(prev => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            size: file.size,
            type: file.type,
            storage_path: filePath,
            folder_id: targetFolderId,
            owner_id: user.id
          });

        if (dbError) throw dbError;

        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name 
            ? { ...p, progress: 100, status: 'completed' as const }
            : p
        ));

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name 
            ? { ...p, status: 'error' as const }
            : p
        ));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Clear upload progress after delay
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);

    await refreshData();
  };

  const createFolder = async (name: string, parentId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('folders')
        .insert({
          name: name.trim(),
          parent_id: parentId || currentFolderId,
          owner_id: user.id
        });

      if (error) throw error;

      toast.success('Folder created successfully');
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create folder';
      toast.error(message);
      throw error;
    }
  };

  const deleteItems = async (itemIds: string[], itemType: 'file' | 'folder') => {
    if (!user) return;

    try {
      if (itemType === 'file') {
        // Get file info for storage cleanup
        const { data: files } = await supabase
          .from('files')
          .select('storage_path')
          .in('id', itemIds)
          .eq('owner_id', user.id);

        if (files) {
          // Delete from storage
          const paths = files.map(f => f.storage_path);
          await supabase.storage.from('files').remove(paths);
        }

        // Delete from database
        const { error } = await supabase
          .from('files')
          .delete()
          .in('id', itemIds)
          .eq('owner_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('folders')
          .delete()
          .in('id', itemIds)
          .eq('owner_id', user.id);

        if (error) throw error;
      }

      toast.success(`${itemType === 'file' ? 'File' : 'Folder'}${itemIds.length > 1 ? 's' : ''} deleted successfully`);
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete items';
      toast.error(message);
      throw error;
    }
  };

  const renameItem = async (itemId: string, newName: string, itemType: 'file' | 'folder') => {
    if (!user) return;

    try {
      const table = itemType === 'file' ? 'files' : 'folders';
      const { error } = await supabase
        .from(table)
        .update({ name: newName.trim(), updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success(`${itemType === 'file' ? 'File' : 'Folder'} renamed successfully`);
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to rename item';
      toast.error(message);
      throw error;
    }
  };

  const moveItems = async (itemIds: string[], targetFolderId: string | null, itemType: 'file' | 'folder') => {
    if (!user) return;

    try {
      const table = itemType === 'file' ? 'files' : 'folders';
      const column = itemType === 'file' ? 'folder_id' : 'parent_id';
      
      const { error } = await supabase
        .from(table)
        .update({ [column]: targetFolderId, updated_at: new Date().toISOString() })
        .in('id', itemIds)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success(`${itemType === 'file' ? 'File' : 'Folder'}${itemIds.length > 1 ? 's' : ''} moved successfully`);
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move items';
      toast.error(message);
      throw error;
    }
  };

  const downloadFile = async (fileId: string) => {
    if (!user) return;

    try {
      const { data: file } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('owner_id', user.id)
        .single();

      if (!file) throw new Error('File not found');

      const { data: signedUrl } = await supabase.storage
        .from('files')
        .createSignedUrl(file.storage_path, 3600);

      if (!signedUrl) throw new Error('Failed to generate download URL');

      const link = document.createElement('a');
      link.href = signedUrl.signedUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download file';
      toast.error(message);
      throw error;
    }
  };

  const toggleStar = async (itemId: string, itemType: 'file' | 'folder') => {
    if (!user) return;

    try {
      const table = itemType === 'file' ? 'files' : 'folders';
      
      // Get current starred status
      const { data: item } = await supabase
        .from(table)
        .select('is_starred')
        .eq('id', itemId)
        .eq('owner_id', user.id)
        .single();

      if (!item) throw new Error('Item not found');

      const { error } = await supabase
        .from(table)
        .update({ 
          is_starred: !item.is_starred,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success(item.is_starred ? 'Removed from starred' : 'Added to starred');
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update starred status';
      toast.error(message);
      throw error;
    }
  };

  const moveToTrash = async (itemIds: string[], itemType: 'file' | 'folder') => {
    if (!user) return;

    try {
      const table = itemType === 'file' ? 'files' : 'folders';
      const { error } = await supabase
        .from(table)
        .update({ 
          is_trashed: true,
          updated_at: new Date().toISOString()
        })
        .in('id', itemIds)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success(`${itemType === 'file' ? 'File' : 'Folder'}${itemIds.length > 1 ? 's' : ''} moved to trash`);
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move to trash';
      toast.error(message);
      throw error;
    }
  };

  const restoreFromTrash = async (itemIds: string[], itemType: 'file' | 'folder') => {
    if (!user) return;

    try {
      const table = itemType === 'file' ? 'files' : 'folders';
      const { error } = await supabase
        .from(table)
        .update({ 
          is_trashed: false,
          updated_at: new Date().toISOString()
        })
        .in('id', itemIds)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success(`${itemType === 'file' ? 'File' : 'Folder'}${itemIds.length > 1 ? 's' : ''} restored from trash`);
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore from trash';
      toast.error(message);
      throw error;
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedItems([]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const targetBreadcrumb = breadcrumbs[index];
    if (targetBreadcrumb) {
      navigateToFolder(targetBreadcrumb.id);
    }
  };

  // Update breadcrumbs when folder changes
  useEffect(() => {
    buildBreadcrumbs(currentFolderId);
  }, [currentFolderId, buildBreadcrumbs]);

  // Refresh data when folder changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = {
    files,
    folders,
    currentFolderId,
    breadcrumbs,
    loading,
    error,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    uploadProgress,
    selectedItems,
    
    uploadFiles,
    createFolder,
    deleteItems,
    renameItem,
    moveItems,
    downloadFile,
    toggleStar,
    moveToTrash,
    restoreFromTrash,
    
    navigateToFolder,
    navigateToBreadcrumb,
    
    setViewMode,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    setSelectedItems,
    
    refreshData,
  };

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};