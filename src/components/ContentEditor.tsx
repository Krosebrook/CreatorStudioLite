import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../design-system/utils/cn';
import { Input } from '../design-system/components/Input';
import { TextArea } from '../design-system/components/TextArea';
import { Select } from '../design-system/components/Select';
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';
import { MediaUpload, MediaFile } from './MediaUpload';
import { 
  Save, 
  Send, 
  Clock, 
  Eye, 
  Wand2, 
  Hash, 
  AtSign, 
  MapPin, 
  Users, 
  Target,
  TrendingUp,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  BarChart3,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export interface ContentData {
  id?: string;
  title: string;
  description: string;
  media: MediaFile[];
  platforms: string[];
  hashtags: string[];
  mentions: string[];
  location?: string;
  audience?: string;
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
  aiGenerated?: boolean;
  brandVoice?: string;
  callToAction?: string;
  targetMetrics?: {
    expectedViews?: number;
    expectedEngagement?: number;
    expectedRevenue?: number;
  };
}

export interface ContentEditorProps {
  initialContent?: Partial<ContentData>;
  onSave: (content: ContentData) => void;
  onPublish: (content: ContentData) => void;
  onSchedule: (content: ContentData, date: Date) => void;
  onPreview: (content: ContentData, platform: string) => void;
  className?: string;
}

const platformOptions = [
  { 
    value: 'instagram', 
    label: 'Instagram', 
    icon: '📷', 
    color: '#E4405F',
    description: 'Stories, Posts, Reels',
    limits: { title: 100, description: 2200, hashtags: 30 }
  },
  { 
    value: 'tiktok', 
    label: 'TikTok', 
    icon: '🎵', 
    color: '#000000',
    description: 'Short-form videos',
    limits: { title: 80, description: 300, hashtags: 20 }
  },
  { 
    value: 'youtube', 
    label: 'YouTube', 
    icon: '📺', 
    color: '#FF0000',
    description: 'Long-form content',
    limits: { title: 100, description: 5000, hashtags: 15 }
  },
  { 
    value: 'twitter', 
    label: 'Twitter', 
    icon: '🐦', 
    color: '#1DA1F2',
    description: 'Tweets & Threads',
    limits: { title: 280, description: 280, hashtags: 10 }
  },
  { 
    value: 'linkedin', 
    label: 'LinkedIn', 
    icon: '💼', 
    color: '#0077B5',
    description: 'Professional content',
    limits: { title: 150, description: 3000, hashtags: 5 }
  },
];

const audienceOptions = [
  { value: 'general', label: 'General Audience', description: 'Broad appeal content' },
  { value: 'niche', label: 'Niche Community', description: 'Specialized audience' },
  { value: 'followers', label: 'Existing Followers', description: 'Your current audience' },
  { value: 'new', label: 'New Audience', description: 'Discovery-focused' },
];

const brandVoiceOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
  { value: 'casual', label: 'Casual', description: 'Friendly and approachable' },
  { value: 'humorous', label: 'Humorous', description: 'Fun and entertaining' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
  { value: 'educational', label: 'Educational', description: 'Informative and helpful' },
];

export const ContentEditor: React.FC<ContentEditorProps> = ({
  initialContent = {},
  onSave,
  onPublish,
  onSchedule,
  onPreview,
  className,
}) => {
  const [content, setContent] = useState<ContentData>({
    title: '',
    description: '',
    media: [],
    platforms: [],
    hashtags: [],
    mentions: [],
    status: 'draft',
    ...initialContent,
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [contentScore, setContentScore] = useState<number>(0);
  const [viralPrediction, setViralPrediction] = useState<number>(0);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (content.title || content.description || content.media.length > 0) {
        setAutoSaveStatus('saving');
        // Simulate auto-save
        setTimeout(() => {
          onSave(content);
          setAutoSaveStatus('saved');
        }, 1000);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, onSave]);

  // Content scoring and viral prediction
  useEffect(() => {
    calculateContentScore();
    predictViralPotential();
  }, [content]);

  const calculateContentScore = () => {
    let score = 0;
    
    // Title quality (0-25 points)
    if (content.title.length > 10) score += 10;
    if (content.title.length > 30) score += 10;
    if (/[!?]/.test(content.title)) score += 5;
    
    // Description quality (0-25 points)
    if (content.description.length > 50) score += 10;
    if (content.description.length > 200) score += 10;
    if (content.callToAction) score += 5;
    
    // Media presence (0-20 points)
    if (content.media.length > 0) score += 10;
    if (content.media.length > 1) score += 5;
    if (content.media.some(m => m.type === 'video')) score += 5;
    
    // Platform optimization (0-15 points)
    if (content.platforms.length > 0) score += 5;
    if (content.platforms.length > 2) score += 5;
    if (content.hashtags.length > 3) score += 5;
    
    // Engagement factors (0-15 points)
    if (content.hashtags.length > 0) score += 5;
    if (content.mentions.length > 0) score += 5;
    if (content.location) score += 5;
    
    setContentScore(Math.min(score, 100));
  };

  const predictViralPotential = () => {
    let potential = 0;
    
    // Trending elements
    const trendingHashtags = ['viral', 'trending', 'fyp', 'explore'];
    const hasTrendingTags = content.hashtags.some(tag => 
      trendingHashtags.some(trending => tag.toLowerCase().includes(trending))
    );
    if (hasTrendingTags) potential += 20;
    
    // Video content bonus
    if (content.media.some(m => m.type === 'video')) potential += 25;
    
    // Multi-platform strategy
    if (content.platforms.length > 2) potential += 15;
    
    // Engagement hooks
    if (content.title.includes('?') || content.description.includes('?')) potential += 10;
    if (content.callToAction) potential += 10;
    
    // Optimal posting elements
    if (content.hashtags.length >= 5 && content.hashtags.length <= 15) potential += 10;
    if (content.description.length >= 100) potential += 10;
    
    setViralPrediction(Math.min(potential, 100));
  };

  const handleAIGenerate = async (prompt: string, type: 'title' | 'description' | 'hashtags') => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = {
      title: [
        "🔥 This Will Change Everything You Know About...",
        "The Secret That Influencers Don't Want You to Know",
        "I Tried This For 30 Days - Here's What Happened",
        "Why Everyone Is Talking About This Trend",
        "The Mistake 99% of People Make (And How to Fix It)"
      ],
      description: [
        "Ready to transform your life? This simple technique has helped thousands of people achieve their goals faster than ever before. The best part? It only takes 5 minutes a day! 💪\n\nSwipe to see the step-by-step process that's been proven to work. Your future self will thank you! ✨\n\n#transformation #goals #success #motivation #lifestyle",
        "POV: You discover the one thing that changes everything 🤯\n\nI've been keeping this secret for too long, and it's time to share it with you. This method has completely revolutionized how I approach my daily routine.\n\nComment 'YES' if you want the full breakdown! 👇\n\n#lifehack #productivity #mindset #growth #viral"
      ],
      hashtags: [
        ["viral", "trending", "fyp", "explore", "motivation", "lifestyle", "success", "goals", "transformation", "mindset"],
        ["content", "creator", "influence", "brand", "marketing", "social", "engagement", "growth", "community", "authentic"]
      ]
    };
    
    setAiSuggestions(suggestions[type]);
    setIsGeneratingAI(false);
  };

  const applySuggestion = (suggestion: string, type: 'title' | 'description' | 'hashtags') => {
    if (type === 'hashtags') {
      const hashtagArray = suggestion.split(',').map(tag => tag.trim());
      setContent(prev => ({ ...prev, hashtags: hashtagArray }));
    } else {
      setContent(prev => ({ ...prev, [type]: suggestion }));
    }
    setAiSuggestions([]);
  };

  const getCharacterLimit = (field: 'title' | 'description') => {
    if (content.platforms.length === 0) return undefined;
    
    const limits = content.platforms.map(platform => {
      const platformData = platformOptions.find(p => p.value === platform);
      return platformData?.limits[field] || Infinity;
    });
    
    return Math.min(...limits);
  };

  const getPlatformRequirements = (field: 'title' | 'description') => {
    return content.platforms.map(platform => {
      const platformData = platformOptions.find(p => p.value === platform);
      return {
        platform: platformData?.label || platform,
        maxLength: platformData?.limits[field],
        required: true,
      };
    }).filter(req => req.maxLength);
  };

  const handleSchedule = () => {
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + 1); // Default to 1 hour from now
    onSchedule(content, scheduledDate);
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <RefreshCw className="w-3 h-3 animate-spin text-warning-500" />;
      case 'saved':
        return <CheckCircle2 className="w-3 h-3 text-success-500" />;
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-error-500" />;
    }
  };

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Header with Auto-save Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Content Creator</h1>
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            {getAutoSaveIcon()}
            <span>
              {autoSaveStatus === 'saving' && 'Saving...'}
              {autoSaveStatus === 'saved' && 'All changes saved'}
              {autoSaveStatus === 'error' && 'Error saving changes'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
            Advanced {showAdvanced ? '▼' : '▶'}
          </Button>
          <Button variant="secondary" leftIcon={<Eye className="w-4 h-4" />}>
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Upload */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Media Content</h3>
            <MediaUpload
              onFilesAdded={(files) => setContent(prev => ({ ...prev, media: [...prev.media, ...files] }))}
              onFileRemoved={(id) => setContent(prev => ({ ...prev, media: prev.media.filter(m => m.id !== id) }))}
              onFileUpdated={(id, updates) => setContent(prev => ({
                ...prev,
                media: prev.media.map(m => m.id === id ? { ...m, ...updates } : m)
              }))}
              platforms={content.platforms}
              autoOptimize
            />
          </Card>

          {/* Content Details */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Content Details</h3>
            <div className="space-y-4">
              {/* Title with AI Generation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">Title</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAIGenerate(content.description, 'title')}
                    loading={isGeneratingAI}
                    leftIcon={<Sparkles className="w-3 h-3" />}
                  >
                    AI Generate
                  </Button>
                </div>
                <Input
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your content title..."
                  characterLimit={getCharacterLimit('title')}
                  showCharacterCount
                  platformRequirements={getPlatformRequirements('title')}
                />
                
                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-600">AI Suggestions:</p>
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 bg-primary-50 rounded-md cursor-pointer hover:bg-primary-100 transition-colors"
                        onClick={() => applySuggestion(suggestion, 'title')}
                      >
                        <p className="text-sm text-primary-800">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description with AI Enhancement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">Description</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAIGenerate(content.title, 'description')}
                    loading={isGeneratingAI}
                    leftIcon={<Sparkles className="w-3 h-3" />}
                  >
                    AI Enhance
                  </Button>
                </div>
                <TextArea
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write your content description..."
                  characterLimit={getCharacterLimit('description')}
                  showCharacterCount
                  platformRequirements={getPlatformRequirements('description')}
                  hashtagSuggestions={['trending', 'viral', 'creator', 'content', 'lifestyle', 'motivation']}
                  mentionSuggestions={['brand', 'partner', 'collaborator']}
                  autoResize
                  aiSuggestions
                  onAIGenerate={(prompt) => handleAIGenerate(prompt, 'description')}
                />
              </div>

              {/* Platform Selection */}
              <Select
                label="Publishing Platforms"
                multiple
                value={content.platforms}
                onChange={(platforms) => setContent(prev => ({ ...prev, platforms: platforms as string[] }))}
                options={platformOptions}
                placeholder="Select platforms to publish..."
                description="Choose where you want to publish this content"
              />

              {/* Hashtags with AI Generation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">Hashtags</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAIGenerate(content.title + ' ' + content.description, 'hashtags')}
                    loading={isGeneratingAI}
                    leftIcon={<Hash className="w-3 h-3" />}
                  >
                    Generate Tags
                  </Button>
                </div>
                <Input
                  value={content.hashtags.join(' #')}
                  onChange={(e) => {
                    const hashtags = e.target.value.split('#').map(tag => tag.trim()).filter(Boolean);
                    setContent(prev => ({ ...prev, hashtags }));
                  }}
                  placeholder="#hashtag1 #hashtag2 #hashtag3"
                  leftIcon={<Hash className="w-4 h-4" />}
                  description="Separate hashtags with spaces. Optimal: 5-15 hashtags"
                />
              </div>
            </div>
          </Card>

          {/* Advanced Options */}
          {showAdvanced && (
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Advanced Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Target Audience"
                  value={content.audience}
                  onChange={(audience) => setContent(prev => ({ ...prev, audience: audience as string }))}
                  options={audienceOptions}
                  placeholder="Select target audience..."
                />
                
                <Select
                  label="Brand Voice"
                  value={content.brandVoice}
                  onChange={(voice) => setContent(prev => ({ ...prev, brandVoice: voice as string }))}
                  options={brandVoiceOptions}
                  placeholder="Select brand voice..."
                />
                
                <Input
                  label="Location"
                  value={content.location || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Add location..."
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
                
                <Input
                  label="Call to Action"
                  value={content.callToAction || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, callToAction: e.target.value }))}
                  placeholder="e.g., Comment below, Link in bio..."
                  leftIcon={<Target className="w-4 h-4" />}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Content Score */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Content Score</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Overall Score</span>
                <span className="text-2xl font-bold text-primary-600">{contentScore}/100</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${contentScore}%` }}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Viral Potential</span>
                  <span className={cn(
                    'font-medium',
                    viralPrediction > 70 ? 'text-success-600' :
                    viralPrediction > 40 ? 'text-warning-600' : 'text-error-600'
                  )}>
                    {viralPrediction}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1">
                  <div 
                    className={cn(
                      'h-1 rounded-full transition-all duration-500',
                      viralPrediction > 70 ? 'bg-success-500' :
                      viralPrediction > 40 ? 'bg-warning-500' : 'bg-error-500'
                    )}
                    style={{ width: `${viralPrediction}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                fullWidth
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => onPublish(content)}
                disabled={!content.title || !content.platforms.length}
              >
                Publish Now
              </Button>
              
              <Button
                fullWidth
                variant="secondary"
                leftIcon={<Clock className="w-4 h-4" />}
                onClick={handleSchedule}
                disabled={!content.title || !content.platforms.length}
              >
                Schedule Post
              </Button>
              
              <Button
                fullWidth
                variant="ghost"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={() => onSave(content)}
              >
                Save Draft
              </Button>
            </div>
          </Card>

          {/* Platform Preview */}
          {content.platforms.length > 0 && (
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Platform Preview</h3>
              <div className="space-y-2">
                {content.platforms.map(platform => {
                  const platformData = platformOptions.find(p => p.value === platform);
                  return (
                    <button
                      key={platform}
                      className="w-full p-3 text-left border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      onClick={() => onPreview(content, platform)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{platformData?.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{platformData?.label}</p>
                          <p className="text-xs text-neutral-500">{platformData?.description}</p>
                        </div>
                        <Eye className="w-4 h-4 text-neutral-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Performance Predictions */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Predictions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Expected Views</span>
                </div>
                <span className="font-medium text-neutral-900">
                  {Math.round(contentScore * 100 + Math.random() * 1000).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Engagement Rate</span>
                </div>
                <span className="font-medium text-neutral-900">
                  {(contentScore / 10 + Math.random() * 3).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Revenue Potential</span>
                </div>
                <span className="font-medium text-neutral-900">
                  ${Math.round(contentScore * 2 + Math.random() * 50)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};