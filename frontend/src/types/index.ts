export interface User {
  id: string;
  email: string;
  created_at: string;
}

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
  is_starred?: boolean;
  is_trashed?: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_starred?: boolean;
  is_trashed?: boolean;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export type ViewMode = 'grid' | 'list';

export type SortBy = 'name' | 'modified' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface ShareSettings {
  isPublic: boolean;
  canEdit: boolean;
  canComment: boolean;
  expiresAt?: string;
}