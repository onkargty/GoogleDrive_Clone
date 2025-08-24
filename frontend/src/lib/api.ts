import supabase from './supabase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

class ApiClient {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // File operations
  async uploadFile(file: File, folderId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  async getFiles(folderId?: string) {
    const query = folderId ? `?folderId=${folderId}` : '';
    return this.request(`/files${query}`);
  }

  async deleteFile(fileId: string) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async downloadFile(fileId: string) {
    return this.request(`/files/${fileId}/download`);
  }

  // Folder operations
  async createFolder(name: string, parentId?: string) {
    return this.request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
  }

  async getFolders(parentId?: string) {
    const query = parentId ? `?parentId=${parentId}` : '';
    return this.request(`/folders${query}`);
  }

  async deleteFolder(folderId: string) {
    return this.request(`/folders/${folderId}`, {
      method: 'DELETE',
    });
  }

  async renameFolder(folderId: string, name: string) {
    return this.request(`/folders/${folderId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;