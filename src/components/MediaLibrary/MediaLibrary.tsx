import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../Dashboard/DashboardLayout';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Upload, Search, Filter, Grid, List, Image as ImageIcon, Video, FileText, Trash2, Download, Eye } from 'lucide-react';
import { cn } from '../../design-system/utils/cn';
import { storageService } from '../../services/media/StorageService';
import { useAuth } from '../../contexts/AuthContext';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  createdAt: Date;
  tags?: string[];
}

export const MediaLibrary: React.FC = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [filterType]);

  const loadMedia = async () => {
    if (!user) return;

    const workspaceId = 'default-workspace';
    const { media: fetchedMedia, error } = await storageService.getWorkspaceMedia(
      workspaceId,
      {
        type: filterType === 'all' ? undefined : filterType,
        limit: 50
      }
    );

    if (!error) {
      setMedia(fetchedMedia.map((m: any) => ({
        id: m.id,
        filename: m.filename,
        url: m.url,
        mimeType: m.mime_type,
        sizeBytes: m.size_bytes,
        width: m.width,
        height: m.height,
        uploadedBy: m.uploaded_by,
        createdAt: new Date(m.created_at),
        tags: m.metadata?.tags
      })));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);

    const workspaceId = 'default-workspace';
    const results = await storageService.uploadMultiple(
      Array.from(files),
      {
        workspaceId,
        userId: user.id,
        folder: 'uploads'
      }
    );

    setIsUploading(false);
    loadMedia();
  };

  const handleDelete = async (mediaId: string) => {
    const mediaItem = media.find(m => m.id === mediaId);
    if (!mediaItem) return;

    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const toggleSelection = (mediaId: string) => {
    setSelectedMedia(prev => {
      const next = new Set(prev);
      if (next.has(mediaId)) {
        next.delete(mediaId);
      } else {
        next.add(mediaId);
      }
      return next;
    });
  };

  const filteredMedia = media.filter(m => {
    if (searchQuery && !m.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout currentPage="media">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Media Library</h1>
            <p className="text-neutral-600 mt-1">
              {media.length} files • {selectedMedia.size} selected
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*"
              />
              <Button
                as="span"
                variant="primary"
                leftIcon={<Upload className="w-4 h-4" />}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </label>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'image' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('image')}
              leftIcon={<ImageIcon className="w-4 h-4" />}
            >
              Images
            </Button>
            <Button
              variant={filterType === 'video' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('video')}
              leftIcon={<Video className="w-4 h-4" />}
            >
              Videos
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedMedia.size > 0 && (
          <Card className="p-4 bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-900">
                {selectedMedia.size} file{selectedMedia.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelectedMedia(new Set())}>
                  Clear
                </Button>
                <Button size="sm" variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                  Download
                </Button>
                <Button size="sm" variant="ghost" leftIcon={<Trash2 className="w-4 h-4" />}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map(item => (
              <Card
                key={item.id}
                className={cn(
                  'relative cursor-pointer hover:shadow-md transition-all overflow-hidden group',
                  selectedMedia.has(item.id) && 'ring-2 ring-primary-500'
                )}
                onClick={() => toggleSelection(item.id)}
              >
                <div className="aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : item.mimeType.startsWith('video/') ? (
                    <div className="relative w-full h-full bg-neutral-200 flex items-center justify-center">
                      <Video className="w-12 h-12 text-neutral-400" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <FileText className="w-12 h-12 text-neutral-400" />
                  )}
                </div>

                <div className="p-2">
                  <p className="text-xs font-medium text-neutral-900 truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(item.sizeBytes)}
                  </p>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-error-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-error-600" />
                  </button>
                </div>

                {selectedMedia.has(item.id) && (
                  <div className="absolute top-2 left-2">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map(item => (
              <Card
                key={item.id}
                className={cn(
                  'p-4 cursor-pointer hover:shadow-md transition-all',
                  selectedMedia.has(item.id) && 'ring-2 ring-primary-500'
                )}
                onClick={() => toggleSelection(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded flex items-center justify-center flex-shrink-0">
                    {getMediaIcon(item.mimeType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{item.filename}</p>
                    <p className="text-sm text-neutral-500">
                      {formatFileSize(item.sizeBytes)} • {item.width}x{item.height} • {item.createdAt.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" leftIcon={<Download className="w-4 h-4" />}>
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredMedia.length === 0 && (
          <Card className="p-12 text-center">
            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No files yet</h3>
            <p className="text-neutral-600 mb-4">
              Upload images and videos to get started
            </p>
            <label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*"
              />
              <Button
                as="span"
                variant="primary"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Files
              </Button>
            </label>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
