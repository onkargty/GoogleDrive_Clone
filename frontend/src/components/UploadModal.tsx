import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDrive } from '../contexts/DriveContext';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { uploadFiles, currentFolderId } = useDrive();
  const [uploadQueue, setUploadQueue] = useState<Array<{
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error?: string;
  }>>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0
    }));
    setUploadQueue(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const handleUpload = async () => {
    const pendingFiles = uploadQueue.filter(item => item.status === 'pending');
    
    for (const item of pendingFiles) {
      try {
        setUploadQueue(prev => prev.map(q => 
          q.file === item.file 
            ? { ...q, status: 'uploading', progress: 50 }
            : q
        ));

        await uploadFiles([item.file], currentFolderId || undefined);

        setUploadQueue(prev => prev.map(q => 
          q.file === item.file 
            ? { ...q, status: 'completed', progress: 100 }
            : q
        ));
      } catch (error) {
        setUploadQueue(prev => prev.map(q => 
          q.file === item.file 
            ? { 
                ...q, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : q
        ));
      }
    }
  };

  const removeFile = (fileToRemove: File) => {
    setUploadQueue(prev => prev.filter(item => item.file !== fileToRemove));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const handleClose = () => {
    setUploadQueue([]);
    onClose();
  };

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasFiles = uploadQueue.length > 0;
  const hasPending = uploadQueue.some(item => item.status === 'pending');
  const hasCompleted = uploadQueue.some(item => item.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Upload Files</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!hasFiles ? (
            <div
              {...getRootProps()}
              className={`flex-1 m-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop files here' : 'Choose files to upload'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop files here, or click to select files
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {uploadQueue.map((item, index) => {
                  const StatusIcon = item.status === 'completed' ? CheckCircle :
                                   item.status === 'error' ? AlertCircle : File;
                  const statusColor = item.status === 'completed' ? 'text-green-600' :
                                    item.status === 'error' ? 'text-red-600' : 'text-gray-600';

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center flex-1 min-w-0">
                        <StatusIcon className={`h-5 w-5 mr-3 ${statusColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(item.file.size)}
                            {item.error && ` • ${item.error}`}
                          </p>
                          {item.status === 'uploading' && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                              <div
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => removeFile(item.file)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                {...getRootProps()}
                className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-gray-600">
                  {isDragActive ? 'Drop more files here' : 'Add more files'}
                </p>
              </div>
            </div>
          )}
        </div>

        {hasFiles && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {hasCompleted && (
                <button
                  onClick={clearCompleted}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear completed
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {hasPending && (
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Upload {uploadQueue.filter(item => item.status === 'pending').length} files
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;