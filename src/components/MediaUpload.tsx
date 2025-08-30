import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../design-system/utils/cn';
import { Upload, Camera, Video, Image, X, RotateCcw, Crop, Palette, Wand2, Download, Share2, Eye, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';

export interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  size: number;
  uploadProgress?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  metadata?: {
    exif?: any;
    colorPalette?: string[];
    dominantColor?: string;
    faces?: number;
    objects?: string[];
  };
  platforms?: {
    instagram?: { cropped: string; optimized: boolean };
    tiktok?: { cropped: string; optimized: boolean };
    youtube?: { thumbnail: string; optimized: boolean };
  };
}

export interface MediaUploadProps {
  onFilesAdded: (files: MediaFile[]) => void;
  onFileRemoved: (id: string) => void;
  onFileUpdated: (id: string, updates: Partial<MediaFile>) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  autoOptimize?: boolean;
  platforms?: string[];
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onFilesAdded,
  onFileRemoved,
  onFileUpdated,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*'],
  maxFileSize = 100,
  autoOptimize = true,
  platforms = ['instagram', 'tiktok', 'youtube'],
  className,
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  // File processing with AI analysis
  const processFiles = async (fileList: File[]) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsProcessing(true);
    const newFiles: MediaFile[] = [];

    for (const file of fileList) {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size: ${maxFileSize}MB`);
        continue;
      }

      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
        url: URL.createObjectURL(file),
        size: file.size,
        status: 'uploading',
        uploadProgress: 0,
      };

      newFiles.push(mediaFile);

      // Simulate upload progress
      simulateUpload(mediaFile);

      // Extract metadata and optimize
      if (autoOptimize) {
        await extractMetadata(mediaFile);
        await optimizeForPlatforms(mediaFile);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    onFilesAdded(newFiles);
    setIsProcessing(false);
  };

  // Simulate upload with progress
  const simulateUpload = (file: MediaFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        updateFileStatus(file.id, 'processing');
        
        // Simulate processing time
        setTimeout(() => {
          updateFileStatus(file.id, 'ready');
        }, 1000 + Math.random() * 2000);
      }
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, uploadProgress: progress } : f
      ));
    }, 200);
  };

  // Extract metadata using AI analysis
  const extractMetadata = async (file: MediaFile) => {
    try {
      if (file.type === 'image') {
        const img = new Image();
        img.onload = () => {
          const metadata = {
            dimensions: { width: img.width, height: img.height },
            // Simulate AI analysis results
            colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            dominantColor: '#FF6B6B',
            faces: Math.floor(Math.random() * 3),
            objects: ['person', 'background', 'clothing'].slice(0, Math.floor(Math.random() * 3) + 1),
          };
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, metadata, dimensions: metadata.dimensions } : f
          ));
        };
        img.src = file.url;
      } else if (file.type === 'video') {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const metadata = {
            dimensions: { width: video.videoWidth, height: video.videoHeight },
            duration: video.duration,
          };
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, metadata, dimensions: metadata.dimensions, duration: metadata.duration } : f
          ));
        };
        video.src = file.url;
      }
    } catch (error) {
      console.error('Error extracting metadata:', error);
    }
  };

  // Auto-optimize for different platforms
  const optimizeForPlatforms = async (file: MediaFile) => {
    const platforms: any = {};
    
    // Simulate platform optimization
    for (const platform of ['instagram', 'tiktok', 'youtube']) {
      platforms[platform] = {
        cropped: file.url, // In real app, this would be optimized versions
        optimized: true,
      };
    }
    
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, platforms } : f
    ));
  };

  const updateFileStatus = (id: string, status: MediaFile['status']) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status } : f
    ));
  };

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.url);
      setFiles(prev => prev.filter(f => f.id !== id));
      onFileRemoved(id);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-fast',
          isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-2">
            <Upload className="w-8 h-8 text-neutral-400" />
            <Camera className="w-8 h-8 text-neutral-400" />
            <Video className="w-8 h-8 text-neutral-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Upload your content
            </h3>
            <p className="text-neutral-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button onClick={handleFileSelect} leftIcon={<Upload className="w-4 h-4" />}>
                Browse Files
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleCameraCapture}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Take Photo
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500">
            Supports images and videos up to {maxFileSize}MB • Max {maxFiles} files
          </p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))}
        className="hidden"
      />

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <MediaPreviewCard
              key={file.id}
              file={file}
              onRemove={() => removeFile(file.id)}
              onUpdate={(updates) => {
                setFiles(prev => prev.map(f => 
                  f.id === file.id ? { ...f, ...updates } : f
                ));
                onFileUpdated(file.id, updates);
              }}
            />
          ))}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          <span className="text-sm text-neutral-600">Processing files...</span>
        </div>
      )}
    </div>
  );
};

// Media Preview Card Component
interface MediaPreviewCardProps {
  file: MediaFile;
  onRemove: () => void;
  onUpdate: (updates: Partial<MediaFile>) => void;
}

const MediaPreviewCard: React.FC<MediaPreviewCardProps> = ({ file, onRemove, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-primary-500" />;
      case 'processing':
        return <Wand2 className="w-4 h-4 text-warning-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="relative group overflow-hidden">
      {/* Media Preview */}
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        {file.type === 'image' ? (
          <img
            src={file.url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={file.url}
            className="w-full h-full object-cover"
            muted
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          />
        )}
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Crop className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Upload Progress */}
        {file.status === 'uploading' && file.uploadProgress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50">
            <div 
              className="h-1 bg-primary-500 transition-all duration-300"
              style={{ width: `${file.uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-xs font-medium text-neutral-700 capitalize">
              {file.status}
            </span>
          </div>
          <span className="text-xs text-neutral-500">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* Metadata */}
        {file.dimensions && (
          <div className="text-xs text-neutral-500">
            {file.dimensions.width} × {file.dimensions.height}
            {file.duration && ` • ${Math.round(file.duration)}s`}
          </div>
        )}

        {/* Platform Optimization Status */}
        {file.platforms && (
          <div className="flex space-x-1">
            {Object.entries(file.platforms).map(([platform, data]) => (
              <div
                key={platform}
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  data.optimized 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-warning-100 text-warning-700'
                )}
              >
                {platform}
              </div>
            ))}
          </div>
        )}

        {/* Color Palette Preview */}
        {file.metadata?.colorPalette && (
          <div className="flex space-x-1">
            {file.metadata.colorPalette.slice(0, 5).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-neutral-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};