import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  File as FileIcon,
  FileSpreadsheet,
  Presentation,
  Code
} from 'lucide-react';

export const getFileIcon = (mimeType: string, fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // Images
  if (mimeType.startsWith('image/')) return Image;
  
  // Videos
  if (mimeType.startsWith('video/')) return Video;
  
  // Audio
  if (mimeType.startsWith('audio/')) return Music;
  
  // Archives
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || 
      ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return Archive;
  }
  
  // Documents
  if (mimeType.includes('pdf') || extension === 'pdf') return FileText;
  if (mimeType.includes('word') || ['doc', 'docx'].includes(extension || '')) return FileText;
  if (mimeType.includes('text') || ['txt', 'md', 'rtf'].includes(extension || '')) return FileText;
  
  // Spreadsheets
  if (mimeType.includes('sheet') || ['xls', 'xlsx', 'csv'].includes(extension || '')) return FileSpreadsheet;
  
  // Presentations
  if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(extension || '')) return Presentation;
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'].includes(extension || '')) {
    return Code;
  }
  
  return FileIcon;
};

export const getFileTypeColor = (mimeType: string, fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'text-purple-500';
  if (mimeType.startsWith('video/')) return 'text-pink-500';
  if (mimeType.startsWith('audio/')) return 'text-yellow-500';
  if (mimeType.includes('pdf') || extension === 'pdf') return 'text-red-500';
  if (mimeType.includes('word') || ['doc', 'docx'].includes(extension || '')) return 'text-blue-500';
  if (mimeType.includes('sheet') || ['xls', 'xlsx'].includes(extension || '')) return 'text-green-500';
  if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(extension || '')) return 'text-orange-500';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'text-gray-500';
  
  return 'text-gray-600';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

export const canPreview = (mimeType: string): boolean => {
  return isImageFile(mimeType) || isVideoFile(mimeType) || 
         mimeType === 'application/pdf' || 
         mimeType.startsWith('text/');
};