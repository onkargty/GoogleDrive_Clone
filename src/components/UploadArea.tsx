import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDrive } from '../contexts/DriveContext';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

const UploadArea: React.FC = () => {
  const { uploadFiles, loading } = useDrive();
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'completed' | 'error' }>({});

  // Listen for file selection from header
  React.useEffect(() => {
    const handleFilesSelected = (event: CustomEvent) => {
      const files = event.detail as File[];
      onDrop(files);
    };

    window.addEventListener('filesSelected', handleFilesSelected as EventListener);
    return () => {
      window.removeEventListener('filesSelected', handleFilesSelected as EventListener);
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0;
            if (current < 90) {
              return { ...prev, [file.name]: current + 10 };
            }
            return prev;
          });
        }, 100);

        await uploadFiles([file]);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setUploadStatus(prev => ({ ...prev, [file.name]: 'completed' }));
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
          setUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[file.name];
            return newStatus;
          });
        }, 2000);
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: loading,
  });

  const hasUploads = Object.keys(uploadProgress).length > 0;

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop files here' : 'Upload files'}
        </p>
        <p className="text-sm text-gray-500">
          Drag and drop files here, or click to select files
        </p>
      </div>

      {hasUploads && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => {
            const status = uploadStatus[fileName];
            const StatusIcon = status === 'completed' ? CheckCircle :
                             status === 'error' ? AlertCircle : File;
            const statusColor = status === 'completed' ? 'text-green-600' :
                              status === 'error' ? 'text-red-600' : 'text-blue-600';

            return (
              <div key={fileName} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <StatusIcon className={`h-4 w-4 mr-2 ${statusColor}`} />
                    <span className="text-sm font-medium text-gray-900">{fileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {status === 'completed' ? 'Completed' : 
                       status === 'error' ? 'Failed' : `${progress}%`}
                    </span>
                    {status === 'error' && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {status !== 'completed' && status !== 'error' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status === 'error' ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UploadArea;