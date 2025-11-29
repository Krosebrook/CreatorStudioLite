import React, { useState, useEffect } from 'react';
import { cn } from '../design-system/utils/cn';
import { ContentEditor, ContentData } from './ContentEditor';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  Clock,
  Zap,
  BarChart3,
  Lightbulb,
  Sparkles,
  Rocket,
  Camera,
  Edit3,
  Copy,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
  Eye,
  Heart,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'social' | 'video' | 'blog' | 'email' | 'ad';
  platforms: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  viralScore: number;
  template: Partial<ContentData>;
}

interface ContentDraft {
  id: string;
  title: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  lastModified: Date;
  scheduledDate?: Date;
  performance?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    revenue: number;
  };
  thumbnail?: string;
}

const contentTemplates: ContentTemplate[] = [
  {
    id: 'viral-hook',
    name: 'Viral Hook Post',
    description: 'Attention-grabbing content designed to go viral',
    icon: <Zap className="w-5 h-5" />,
    category: 'social',
    platforms: ['instagram', 'tiktok', 'twitter'],
    estimatedTime: '15 min',
    difficulty: 'beginner',
    viralScore: 85,
    template: {
      title: '🔥 This Will Change Everything You Know About...',
      description: 'POV: You discover the one thing that changes everything 🤯\n\nI\'ve been keeping this secret for too long...\n\nComment "YES" if you want the full breakdown! 👇',
      hashtags: ['viral', 'trending', 'fyp', 'mindblown', 'secret'],
      callToAction: 'Comment YES for the full guide!'
    }
  },
  {
    id: 'tutorial',
    name: 'Step-by-Step Tutorial',
    description: 'Educational content that teaches something valuable',
    icon: <Lightbulb className="w-5 h-5" />,
    category: 'video',
    platforms: ['youtube', 'instagram', 'tiktok'],
    estimatedTime: '30 min',
    difficulty: 'intermediate',
    viralScore: 70,
    template: {
      title: 'How to [Skill] in 5 Simple Steps',
      description: 'Master [skill] with this proven method that\'s helped thousands of people...\n\n✅ Step 1: [Action]\n✅ Step 2: [Action]\n✅ Step 3: [Action]\n\nSave this post for later! 📌',
      hashtags: ['tutorial', 'howto', 'learn', 'education', 'tips'],
      callToAction: 'Save this post and try it yourself!'
    }
  },
  {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    description: 'Authentic content showing your process',
    icon: <Camera className="w-5 h-5" />,
    category: 'social',
    platforms: ['instagram', 'tiktok', 'youtube'],
    estimatedTime: '10 min',
    difficulty: 'beginner',
    viralScore: 60,
    template: {
      title: 'Behind the Scenes: Creating [Content]',
      description: 'You asked for it, so here\'s exactly how I create my content! 🎬\n\nThe process is more chaotic than you think... 😅\n\nWhat would you like to see behind the scenes next?',
      hashtags: ['bts', 'behindthescenes', 'process', 'authentic', 'creator'],
      callToAction: 'What BTS content do you want to see next?'
    }
  },
  {
    id: 'transformation',
    name: 'Before & After',
    description: 'Transformation content that shows progress',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'social',
    platforms: ['instagram', 'tiktok', 'youtube'],
    estimatedTime: '20 min',
    difficulty: 'intermediate',
    viralScore: 80,
    template: {
      title: 'My [Time Period] Transformation',
      description: 'I can\'t believe this is the same person! 🤯\n\nThe journey wasn\'t easy, but these 3 things made all the difference:\n\n1. [Key factor]\n2. [Key factor]\n3. [Key factor]\n\nYour transformation starts today! 💪',
      hashtags: ['transformation', 'beforeandafter', 'progress', 'motivation', 'journey'],
      callToAction: 'Share your transformation in the comments!'
    }
  },
  {
    id: 'trending-topic',
    name: 'Trending Topic Response',
    description: 'Jump on trending topics with your unique perspective',
    icon: <Rocket className="w-5 h-5" />,
    category: 'social',
    platforms: ['twitter', 'instagram', 'tiktok'],
    estimatedTime: '10 min',
    difficulty: 'advanced',
    viralScore: 90,
    template: {
      title: 'My Take on [Trending Topic]',
      description: 'Everyone\'s talking about [topic], but here\'s what they\'re missing...\n\n🧵 Thread:\n\n1/ The real issue is...\n2/ What this means for you...\n3/ How to take advantage...',
      hashtags: ['trending', 'hottake', 'opinion', 'discussion'],
      callToAction: 'What\'s your take? Let me know below!'
    }
  }
];

export const ContentCreationHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'templates' | 'drafts' | 'editor' | 'analytics'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [editingContent, setEditingContent] = useState<ContentData | null>(null);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'performance' | 'scheduled'>('recent');

  // Load drafts on component mount
  useEffect(() => {
    // Simulate loading drafts from API
    const mockDrafts: ContentDraft[] = [
      {
        id: '1',
        title: 'Summer Fashion Trends 2024',
        platforms: ['instagram', 'tiktok'],
        status: 'published',
        lastModified: new Date(Date.now() - 86400000), // 1 day ago
        performance: { views: 12500, likes: 890, comments: 45, shares: 23, revenue: 125 },
        thumbnail: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: '2',
        title: 'Quick Makeup Tutorial',
        platforms: ['youtube', 'instagram'],
        status: 'scheduled',
        lastModified: new Date(Date.now() - 3600000), // 1 hour ago
        scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
        thumbnail: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: '3',
        title: 'Behind the Scenes: Content Creation',
        platforms: ['tiktok'],
        status: 'draft',
        lastModified: new Date(Date.now() - 1800000), // 30 minutes ago
        thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ];
    setDrafts(mockDrafts);
  }, []);

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setEditingContent({
      id: `draft-${Date.now()}`,
      ...template.template,
      platforms: template.platforms,
      status: 'draft',
    } as ContentData);
    setActiveView('editor');
  };

  const handleCreateFromScratch = () => {
    setSelectedTemplate(null);
    setEditingContent({
      id: `draft-${Date.now()}`,
      title: '',
      description: '',
      media: [],
      platforms: [],
      hashtags: [],
      mentions: [],
      status: 'draft',
    });
    setActiveView('editor');
  };

  const handleSaveContent = (content: ContentData) => {
    const draft: ContentDraft = {
      id: content.id || `draft-${Date.now()}`,
      title: content.title,
      platforms: content.platforms,
      status: 'draft',
      lastModified: new Date(),
    };
    
    setDrafts(prev => {
      const existing = prev.find(d => d.id === draft.id);
      if (existing) {
        return prev.map(d => d.id === draft.id ? { ...d, ...draft } : d);
      }
      return [draft, ...prev];
    });
  };

  const handlePublishContent = (content: ContentData) => {
    console.log('Publishing content:', content);
    // Handle publish logic
    handleSaveContent({ ...content, status: 'published' });
    setActiveView('drafts');
  };

  const handleScheduleContent = (content: ContentData, date: Date) => {
    console.log('Scheduling content:', content, 'for', date);
    // Handle schedule logic
    handleSaveContent({ ...content, status: 'scheduled' });
    setActiveView('drafts');
  };

  const handlePreviewContent = (content: ContentData, platform: string) => {
    console.log('Previewing content for', platform, ':', content);
    // Handle preview logic
  };

  const filteredTemplates = contentTemplates.filter(template => {
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedDrafts = [...drafts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.lastModified.getTime() - a.lastModified.getTime();
      case 'performance': {
        const aPerf = a.performance ? a.performance.views : 0;
        const bPerf = b.performance ? b.performance.views : 0;
        return bPerf - aPerf;
      }
      case 'scheduled':
        if (!a.scheduledDate && !b.scheduledDate) return 0;
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: ContentDraft['status']) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="w-4 h-4 text-neutral-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-warning-500" />;
      case 'published':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-error-500" />;
    }
  };

  const getStatusColor = (status: ContentDraft['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-neutral-100 text-neutral-700';
      case 'scheduled':
        return 'bg-warning-100 text-warning-700';
      case 'published':
        return 'bg-success-100 text-success-700';
      case 'failed':
        return 'bg-error-100 text-error-700';
    }
  };

  if (activeView === 'editor' && editingContent) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="border-b border-neutral-200 bg-white px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setActiveView('templates')}
            >
              ← Back to Hub
            </Button>
            <div className="text-sm text-neutral-600">
              {selectedTemplate ? `Template: ${selectedTemplate.name}` : 'Custom Content'}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <ContentEditor
            initialContent={editingContent}
            onSave={handleSaveContent}
            onPublish={handlePublishContent}
            onSchedule={handleScheduleContent}
            onPreview={handlePreviewContent}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Content Creation Hub</h1>
              <p className="text-neutral-600 mt-1">Create, manage, and optimize your content across all platforms</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                leftIcon={<BarChart3 className="w-4 h-4" />}
                onClick={() => setActiveView('analytics')}
              >
                Analytics
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleCreateFromScratch}
              >
                Create Content
              </Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-6 mt-6">
            {[
              { id: 'templates', label: 'Templates', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'drafts', label: 'My Content', icon: <FileText className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors',
                  activeView === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'templates' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={handleCreateFromScratch}
              >
                <div className="p-6 text-center">
                  <Plus className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-neutral-900">Start from Scratch</h3>
                  <p className="text-sm text-neutral-600 mt-1">Create custom content</p>
                </div>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="p-6 text-center">
                  <Camera className="w-8 h-8 text-success-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-neutral-900">Quick Capture</h3>
                  <p className="text-sm text-neutral-600 mt-1">Photo/video content</p>
                </div>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="p-6 text-center">
                  <Zap className="w-8 h-8 text-warning-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-neutral-900">AI Generate</h3>
                  <p className="text-sm text-neutral-600 mt-1">AI-powered content</p>
                </div>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="p-6 text-center">
                  <Copy className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-neutral-900">Duplicate Best</h3>
                  <p className="text-sm text-neutral-600 mt-1">Copy top performers</p>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="social">Social Media</option>
                  <option value="video">Video Content</option>
                  <option value="blog">Blog Posts</option>
                  <option value="email">Email</option>
                  <option value="ad">Advertisements</option>
                </select>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">{template.name}</h3>
                          <p className="text-sm text-neutral-600 capitalize">{template.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-warning-500" />
                        <span className="text-sm font-medium text-neutral-700">{template.viralScore}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                      <span>⏱️ {template.estimatedTime}</span>
                      <span className={cn(
                        'px-2 py-1 rounded-full',
                        template.difficulty === 'beginner' && 'bg-success-100 text-success-700',
                        template.difficulty === 'intermediate' && 'bg-warning-100 text-warning-700',
                        template.difficulty === 'advanced' && 'bg-error-100 text-error-700'
                      )}>
                        {template.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.platforms.map(platform => (
                        <span
                          key={platform}
                          className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'drafts' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="performance">Best Performance</option>
                  <option value="scheduled">Scheduled First</option>
                </select>
                
                <div className="flex items-center space-x-2 bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleCreateFromScratch}
              >
                New Content
              </Button>
            </div>

            {/* Content Grid/List */}
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {sortedDrafts.map(draft => (
                <Card
                  key={draft.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    // Load draft for editing
                    setEditingContent({
                      id: draft.id,
                      title: draft.title,
                      description: '',
                      media: [],
                      platforms: draft.platforms,
                      hashtags: [],
                      mentions: [],
                      status: draft.status,
                    });
                    setActiveView('editor');
                  }}
                >
                  {viewMode === 'grid' ? (
                    <div>
                      {draft.thumbnail && (
                        <div className="aspect-video bg-neutral-200 rounded-t-lg overflow-hidden">
                          <img
                            src={draft.thumbnail}
                            alt={draft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900 truncate flex-1">
                            {draft.title}
                          </h3>
                          <button className="ml-2 p-1 hover:bg-neutral-100 rounded">
                            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          {getStatusIcon(draft.status)}
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium capitalize',
                            getStatusColor(draft.status)
                          )}>
                            {draft.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {draft.platforms.map(platform => (
                            <span
                              key={platform}
                              className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                        
                        {draft.performance && (
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{draft.performance.views.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{draft.performance.likes}</span>
                              </span>
                            </div>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${draft.performance.revenue}</span>
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-neutral-500 mt-2">
                          {draft.scheduledDate ? (
                            <span>Scheduled: {draft.scheduledDate.toLocaleDateString()}</span>
                          ) : (
                            <span>Modified: {draft.lastModified.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex items-center space-x-4">
                      {draft.thumbnail && (
                        <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={draft.thumbnail}
                            alt={draft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-neutral-900 truncate">
                            {draft.title}
                          </h3>
                          <button className="p-1 hover:bg-neutral-100 rounded">
                            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(draft.status)}
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-full font-medium capitalize',
                              getStatusColor(draft.status)
                            )}>
                              {draft.status}
                            </span>
                          </div>
                          
                          <div className="flex space-x-1">
                            {draft.platforms.map(platform => (
                              <span
                                key={platform}
                                className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                          
                          {draft.performance && (
                            <div className="flex items-center space-x-3 text-xs text-neutral-500">
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{draft.performance.views.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{draft.performance.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${draft.performance.revenue}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Content Analytics</h3>
              <p className="text-neutral-600">Analytics dashboard coming soon...</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};