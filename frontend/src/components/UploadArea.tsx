import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDrive } from '../contexts/DriveContext';
import { Upload, File } from 'lucide-react';

const UploadArea: React.FC = () => {
  const { uploadFile, loading } = useDrive();
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        await uploadFile(file);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);
      } catch (error) {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  }, [uploadFile]);

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
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
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
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{fileName}</span>
                </div>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadArea;