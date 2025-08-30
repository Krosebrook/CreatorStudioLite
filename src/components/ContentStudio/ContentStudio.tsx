import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../design-system/utils/cn';
import { DashboardLayout } from '../Dashboard/DashboardLayout';
import { MediaUpload, MediaFile } from '../MediaUpload';
import { ContentEditor, ContentData } from '../ContentEditor';
import { CameraCapture } from './CameraCapture';
import { AIContentGenerator } from './AIContentGenerator';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { TextArea } from '../../design-system/components/TextArea';
import { Camera, Video, Image, FileText, Sparkles, Save, Send, Clock, Eye, Wand2, Upload, Download, Share, Copy, MoreHorizontal, Settings, Layers, Filter, Crop, RotateCw, FlipHorizontal, Palette, Type, Music, Volume2, Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Grid3X3, Layout, Smartphone, Monitor, Tablet, Globe, Instagram, Youtube, Twitter, Linkedin, Facebook, BookText as TikTok, Plus, Minus, X, Check, AlertCircle, CheckCircle, RefreshCw, Zap, Target, Users, BarChart3, TrendingUp, DollarSign, Hash, AtSign, MapPin, Calendar, Star, Heart, MessageCircle, Bookmark, Flag, Shield, Lock, Unlock, Link, ExternalLink, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface StudioMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}

interface ContentProject {
  id: string;
  title: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'carousel';
  platforms: string[];
  media: MediaFile[];
  content: Partial<ContentData>;
  status: 'draft' | 'editing' | 'ready' | 'scheduled' | 'published';
  lastModified: Date;
  collaborators?: string[];
  version: number;
  thumbnail?: string;
}

const studioModes: StudioMode[] = [
  {
    id: 'quick-create',
    name: 'Quick Create',
    icon: <Zap className="w-5 h-5" />,
    description: 'Fast content creation for immediate publishing',
    features: ['One-tap capture', 'Auto-optimization', 'Instant publish']
  },
  {
    id: 'professional',
    name: 'Professional Studio',
    icon: <Camera className="w-5 h-5" />,
    description: 'Advanced editing tools for high-quality content',
    features: ['Advanced editing', 'Multiple formats', 'Collaboration tools']
  },
  {
    id: 'ai-powered',
    name: 'AI-Powered',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Let AI handle content creation and optimization',
    features: ['AI generation', 'Auto-optimization', 'Trend analysis']
  },
  {
    id: 'batch-create',
    name: 'Batch Creator',
    icon: <Layers className="w-5 h-5" />,
    description: 'Create multiple pieces of content efficiently',
    features: ['Bulk operations', 'Template system', 'Scheduled publishing']
  }
];

export const ContentStudio: React.FC = () => {
  const [activeMode, setActiveMode] = useState<string>('quick-create');
  const [currentProject, setCurrentProject] = useState<ContentProject | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load existing projects
    const mockProjects: ContentProject[] = [
      {
        id: '1',
        title: 'Summer Fashion Trends',
        type: 'reel',
        platforms: ['instagram', 'tiktok'],
        media: [],
        content: {
          title: 'Summer Fashion Trends 2024',
          description: 'Check out these amazing summer trends...',
          hashtags: ['fashion', 'summer', 'trends', 'style'],
          platforms: ['instagram', 'tiktok']
        },
        status: 'draft',
        lastModified: new Date(Date.now() - 3600000),
        version: 1,
        thumbnail: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: '2',
        title: 'Quick Makeup Tutorial',
        type: 'video',
        platforms: ['youtube', 'instagram'],
        media: [],
        content: {
          title: 'Quick Makeup Tutorial',
          description: 'Learn this 5-minute makeup routine...',
          hashtags: ['makeup', 'tutorial', 'beauty', 'quick'],
          platforms: ['youtube', 'instagram']
        },
        status: 'editing',
        lastModified: new Date(Date.now() - 1800000),
        version: 3,
        thumbnail: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ];
    setProjects(mockProjects);
  }, []);

  const createNewProject = (mode: string) => {
    const newProject: ContentProject = {
      id: `project-${Date.now()}`,
      title: 'Untitled Project',
      type: 'post',
      platforms: [selectedPlatform],
      media: [],
      content: {
        title: '',
        description: '',
        hashtags: [],
        mentions: [],
        platforms: [selectedPlatform],
        status: 'draft'
      },
      status: 'draft',
      lastModified: new Date(),
      version: 1
    };

    setCurrentProject(newProject);
    setProjects(prev => [newProject, ...prev]);
    setIsEditing(true);

    // Auto-open appropriate tool based on mode
    if (mode === 'quick-create') {
      setShowCamera(true);
    } else if (mode === 'ai-powered') {
      setShowAIGenerator(true);
    }
  };

  const handleMediaCapture = (media: any) => {
    if (currentProject) {
      const mediaFile: MediaFile = {
        id: media.id,
        file: new File([media.blob], `capture-${Date.now()}.${media.type === 'photo' ? 'jpg' : 'mp4'}`),
        type: media.type === 'photo' ? 'image' : 'video',
        url: media.url,
        size: media.blob.size,
        status: 'ready',
        dimensions: {
          width: media.metadata.width,
          height: media.metadata.height
        }
      };

      setCurrentProject(prev => prev ? {
        ...prev,
        media: [...prev.media, mediaFile],
        lastModified: new Date()
      } : null);
    }
    setShowCamera(false);
  };

  const handleAIContentGenerated = (content: any) => {
    if (currentProject) {
      setCurrentProject(prev => prev ? {
        ...prev,
        content: {
          ...prev.content,
          [content.type]: content.content,
          aiGenerated: true
        },
        lastModified: new Date()
      } : null);
    }
  };

  const handleProjectSave = (projectData: ContentData) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        content: projectData,
        lastModified: new Date(),
        version: currentProject.version + 1
      };
      
      setCurrentProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    }
  };

  const handleProjectPublish = (projectData: ContentData) => {
    if (currentProject) {
      const publishedProject = {
        ...currentProject,
        content: projectData,
        status: 'published' as const,
        lastModified: new Date()
      };
      
      setProjects(prev => prev.map(p => p.id === publishedProject.id ? publishedProject : p));
      setCurrentProject(null);
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: ContentProject['status']) => {
    switch (status) {
      case 'draft': return 'bg-neutral-100 text-neutral-700';
      case 'editing': return 'bg-warning-100 text-warning-700';
      case 'ready': return 'bg-success-100 text-success-700';
      case 'scheduled': return 'bg-primary-100 text-primary-700';
      case 'published': return 'bg-success-100 text-success-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'tiktok': return <div className="w-4 h-4 bg-black rounded-sm" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-500" />;
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
      default: return <Globe className="w-4 h-4 text-neutral-500" />;
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleMediaCapture}
        onClose={() => setShowCamera(false)}
        mode="both"
        maxDuration={60}
      />
    );
  }

  if (isEditing && currentProject) {
    return (
      <DashboardLayout currentPage="create">
        <div className="space-y-6">
          {/* Editor Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentProject(null);
                }}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Studio
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{currentProject.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(currentProject.status)
                  )}>
                    {currentProject.status}
                  </span>
                  <span>•</span>
                  <span>Version {currentProject.version}</span>
                  <span>•</span>
                  <span>Modified {currentProject.lastModified.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Preview Mode Selector */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    previewMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
                  )}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    previewMode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
                  )}
                  title="Tablet Preview"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    previewMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
                  )}
                  title="Desktop Preview"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              <Button variant="secondary" leftIcon={<Eye className="w-4 h-4" />}>
                Preview
              </Button>
              <Button variant="primary" leftIcon={<Send className="w-4 h-4" />}>
                Publish
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <ContentEditor
            initialContent={currentProject.content}
            onSave={handleProjectSave}
            onPublish={handleProjectPublish}
            onSchedule={(content, date) => {
              console.log('Scheduling:', content, date);
            }}
            onPreview={(content, platform) => {
              console.log('Previewing:', content, platform);
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="create">
      <div className="space-y-6">
        {/* Studio Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Content Creation Studio</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Create, edit, and publish amazing content across all your platforms with AI-powered tools
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {studioModes.map(mode => (
            <Card
              key={mode.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                activeMode === mode.id && 'ring-2 ring-primary-500 bg-primary-50'
              )}
              onClick={() => {
                setActiveMode(mode.id);
                createNewProject(mode.id);
              }}
            >
              <div className="p-4 text-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-600">
                  {mode.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">{mode.name}</h3>
                <p className="text-xs text-neutral-600 mb-2">{mode.description}</p>
                <div className="space-y-0.5">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-center space-x-1 text-xs text-neutral-500">
                      <Check className="w-3 h-3 text-success-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Button
            variant="primary"
            onClick={() => setShowCamera(true)}
            leftIcon={<Camera className="w-5 h-5" />}
            className="h-14"
          >
            Capture
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setShowAIGenerator(true)}
            leftIcon={<Sparkles className="w-5 h-5" />}
            className="h-14"
          >
            AI Generate
          </Button>
          
          <Button
            variant="secondary"
            leftIcon={<Upload className="w-5 h-5" />}
            className="h-14"
          >
            Upload
          </Button>
          
          <Button
            variant="secondary"
            leftIcon={<FileText className="w-5 h-5" />}
            className="h-14"
          >
            Text
          </Button>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Recent Projects</h2>
              <Button variant="ghost" leftIcon={<Plus className="w-4 h-4" />}>
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {projects.map(project => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => {
                    setCurrentProject(project);
                    setIsEditing(true);
                  }}
                >
                  <div className="aspect-video bg-neutral-200 rounded-t-lg overflow-hidden">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-neutral-900 truncate flex-1">
                        {project.title}
                      </h3>
                      <button className="ml-1 p-0.5 hover:bg-neutral-100 rounded">
                        <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium capitalize',
                        getStatusColor(project.status)
                      )}>
                        {project.status}
                      </span>
                      <span className="text-xs text-neutral-500 capitalize">
                        {project.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {project.platforms.map(platform => (
                          <div key={platform} className="w-5 h-5 flex items-center justify-center">
                            {getPlatformIcon(platform)}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500">
                        v{project.version}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Platform Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { platform: 'Instagram', followers: '125K', engagement: '8.7%', icon: <Instagram className="w-5 h-5 text-pink-500" /> },
            { platform: 'TikTok', followers: '89K', engagement: '12.3%', icon: <div className="w-5 h-5 bg-black rounded-sm" /> },
            { platform: 'YouTube', followers: '45K', engagement: '6.2%', icon: <Youtube className="w-5 h-5 text-red-500" /> },
            { platform: 'Twitter', followers: '23K', engagement: '4.1%', icon: <Twitter className="w-5 h-5 text-blue-500" /> }
          ].map((stat, index) => (
            <Card key={index} className="p-3 text-center hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-1">
                {stat.icon}
              </div>
              <p className="text-sm font-semibold text-neutral-900">{stat.platform}</p>
              <p className="text-sm text-neutral-600">{stat.followers} followers</p>
              <p className="text-xs text-success-600">{stat.engagement} engagement</p>
            </Card>
          ))}
        </div>

        {/* AI Generator Modal */}
        {showAIGenerator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-neutral-900">AI Content Generator</h3>
                  <button
                    onClick={() => setShowAIGenerator(false)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <AIContentGenerator
                  onContentGenerated={handleAIContentGenerated}
                  onContentApplied={(content) => {
                    handleAIContentGenerated(content);
                    setShowAIGenerator(false);
                  }}
                  platforms={[selectedPlatform]}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};