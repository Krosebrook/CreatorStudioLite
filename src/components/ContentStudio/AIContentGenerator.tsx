import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../design-system/utils/cn';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Input } from '../../design-system/components/Input';
import { TextArea } from '../../design-system/components/TextArea';
import { 
  Sparkles, 
  Wand2, 
  Copy, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  Target,
  Users,
  Hash,
  AtSign,
  MapPin,
  Clock,
  Zap,
  Brain,
  Lightbulb,
  Rocket,
  Star,
  Award,
  Globe,
  Smartphone,
  Monitor,
  Camera,
  Video,
  Mic,
  FileText,
  Image,
  Calendar,
  BarChart3,
  DollarSign,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Play,
  Pause,
  Volume2,
  Settings,
  Filter,
  Sliders,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Upload,
  Link,
  ExternalLink
} from 'lucide-react';

interface AIPrompt {
  id: string;
  title: string;
  description: string;
  category: 'viral' | 'educational' | 'entertainment' | 'promotional' | 'personal';
  template: string;
  variables: string[];
  platforms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  viralScore: number;
  estimatedTime: string;
}

interface GeneratedContent {
  id: string;
  type: 'title' | 'description' | 'hashtags' | 'script' | 'captions';
  content: string;
  confidence: number;
  platform: string;
  variations: string[];
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadTime: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    tone: string;
    keywords: string[];
  };
}

interface AISettings {
  creativity: number; // 0-100
  tone: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational';
  audience: 'general' | 'niche' | 'followers' | 'new';
  platform: string[];
  contentType: 'post' | 'story' | 'reel' | 'video' | 'thread';
  brandVoice: string;
  includeEmojis: boolean;
  includeHashtags: boolean;
  includeCTA: boolean;
}

const aiPrompts: AIPrompt[] = [
  {
    id: 'viral-hook',
    title: 'Viral Hook Generator',
    description: 'Create attention-grabbing opening lines that stop the scroll',
    category: 'viral',
    template: 'Create a viral hook about {topic} that makes people stop scrolling and want to know more',
    variables: ['topic'],
    platforms: ['tiktok', 'instagram', 'twitter'],
    difficulty: 'beginner',
    viralScore: 95,
    estimatedTime: '2 min'
  },
  {
    id: 'tutorial-script',
    title: 'Tutorial Script Writer',
    description: 'Generate step-by-step tutorial scripts with clear instructions',
    category: 'educational',
    template: 'Write a tutorial script for {skill} targeting {audience} with {steps} steps',
    variables: ['skill', 'audience', 'steps'],
    platforms: ['youtube', 'instagram', 'tiktok'],
    difficulty: 'intermediate',
    viralScore: 75,
    estimatedTime: '5 min'
  },
  {
    id: 'story-caption',
    title: 'Story Caption Creator',
    description: 'Generate engaging captions that tell compelling stories',
    category: 'personal',
    template: 'Create a story caption about {experience} that connects with {audience}',
    variables: ['experience', 'audience'],
    platforms: ['instagram', 'facebook', 'linkedin'],
    difficulty: 'beginner',
    viralScore: 65,
    estimatedTime: '3 min'
  },
  {
    id: 'product-promo',
    title: 'Product Promotion',
    description: 'Create compelling product promotions that convert',
    category: 'promotional',
    template: 'Write a promotional post for {product} highlighting {benefits} for {target_audience}',
    variables: ['product', 'benefits', 'target_audience'],
    platforms: ['instagram', 'facebook', 'twitter'],
    difficulty: 'advanced',
    viralScore: 80,
    estimatedTime: '4 min'
  },
  {
    id: 'trending-response',
    title: 'Trending Topic Response',
    description: 'Jump on trending topics with your unique perspective',
    category: 'viral',
    template: 'Create content responding to the trending topic {trend} with a unique {angle}',
    variables: ['trend', 'angle'],
    platforms: ['twitter', 'tiktok', 'instagram'],
    difficulty: 'advanced',
    viralScore: 90,
    estimatedTime: '3 min'
  }
];

export interface AIContentGeneratorProps {
  onContentGenerated: (content: GeneratedContent) => void;
  onContentApplied: (content: GeneratedContent) => void;
  initialPrompt?: string;
  platforms?: string[];
  className?: string;
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  onContentGenerated,
  onContentApplied,
  initialPrompt = '',
  platforms = ['instagram', 'tiktok', 'youtube'],
  className
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [customPrompt, setCustomPrompt] = useState(initialPrompt);
  const [promptVariables, setPromptVariables] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [settings, setSettings] = useState<AISettings>({
    creativity: 70,
    tone: 'casual',
    audience: 'general',
    platform: platforms,
    contentType: 'post',
    brandVoice: '',
    includeEmojis: true,
    includeHashtags: true,
    includeCTA: true
  });
  const [activeTab, setActiveTab] = useState<'prompts' | 'custom' | 'history'>('prompts');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateContent = async (prompt: string, type: GeneratedContent['type'] = 'description') => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      // Mock AI responses based on prompt type and settings
      const mockResponses = {
        title: [
          "🔥 This Will Change Everything You Know About Content Creation",
          "The Secret That Top Creators Don't Want You to Know",
          "I Tried This AI Tool For 30 Days - Here's What Happened",
          "Why 99% of Creators Are Doing This Wrong (And How to Fix It)",
          "The One Thing That Transformed My Content Strategy"
        ],
        description: [
          `Ready to revolutionize your content game? 🚀\n\nThis AI-powered approach has helped thousands of creators:\n✅ 10x their engagement rates\n✅ Save 5+ hours per week\n✅ Increase revenue by 300%\n\nThe best part? It only takes 5 minutes to set up! 💪\n\nSwipe to see the step-by-step process that's been proven to work. Your future self will thank you! ✨\n\n#contentcreator #AI #productivity #viral #success`,
          `POV: You discover the game-changing tool that every top creator is secretly using 🤯\n\nI've been testing this for months, and the results are insane:\n\n📈 Engagement up 400%\n💰 Revenue up 250%\n⏰ Time saved: 20+ hours/week\n\nComment "AI" if you want the full breakdown! 👇\n\n#AI #contentcreation #productivity #viral #creator`
        ],
        hashtags: [
          ['viral', 'trending', 'fyp', 'explore', 'contentcreator', 'AI', 'productivity', 'success', 'motivation', 'creator'],
          ['content', 'creator', 'influence', 'brand', 'marketing', 'social', 'engagement', 'growth', 'community', 'authentic']
        ],
        script: [
          `[HOOK - 0-3s]\n"Stop scrolling! This AI tool just changed everything..."\n\n[PROBLEM - 3-8s]\n"If you're spending hours creating content that gets no views, you're doing it wrong."\n\n[SOLUTION - 8-25s]\n"Here's the exact AI workflow that helped me go from 1K to 100K followers in 3 months..."\n\n[PROOF - 25-35s]\n"Look at these results... [Show screenshots]"\n\n[CTA - 35-40s]\n"Comment 'AI' and I'll send you the complete guide!"`,
          `[ATTENTION GRABBER - 0-2s]\n"This is why your content isn't going viral..."\n\n[REVEAL - 2-15s]\n"Most creators are missing this one crucial element that the algorithm loves..."\n\n[DEMONSTRATION - 15-30s]\n"Watch what happens when I apply this technique..."\n\n[RESULTS - 30-35s]\n"10x more views, 5x more engagement..."\n\n[CALL TO ACTION - 35-40s]\n"Try this on your next post and watch what happens!"`
        ]
      };

      const responses = mockResponses[type] || mockResponses.description;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const content: GeneratedContent = {
        id: `generated-${Date.now()}`,
        type,
        content: selectedResponse,
        confidence: 85 + Math.random() * 15,
        platform: settings.platform[0] || 'instagram',
        variations: responses.filter(r => r !== selectedResponse).slice(0, 2),
        metadata: {
          wordCount: selectedResponse.split(' ').length,
          characterCount: selectedResponse.length,
          estimatedReadTime: `${Math.ceil(selectedResponse.split(' ').length / 200)} min`,
          sentiment: 'positive',
          tone: settings.tone,
          keywords: ['AI', 'content', 'creator', 'viral', 'engagement']
        }
      };

      setGeneratedContent(prev => [content, ...prev]);
      onContentGenerated(content);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptGenerate = async () => {
    if (!selectedPrompt) return;
    
    let finalPrompt = selectedPrompt.template;
    
    // Replace variables in template
    selectedPrompt.variables.forEach(variable => {
      const value = promptVariables[variable] || `[${variable}]`;
      finalPrompt = finalPrompt.replace(`{${variable}}`, value);
    });
    
    await generateContent(finalPrompt, 'description');
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) return;
    await generateContent(customPrompt, 'description');
  };

  const applyContent = (content: GeneratedContent) => {
    onContentApplied(content);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification in real app
  };

  const regenerateContent = (content: GeneratedContent) => {
    generateContent(content.content, content.type);
  };

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-neutral-900">AI Content Generator</h1>
        </div>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Generate viral content ideas, captions, and scripts using advanced AI that understands your brand voice and audience
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-neutral-100 rounded-lg p-1">
          {[
            { id: 'prompts', label: 'Templates', icon: <Lightbulb className="w-4 h-4" /> },
            { id: 'custom', label: 'Custom', icon: <Brain className="w-4 h-4" /> },
            { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Choose a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiPrompts.map(prompt => (
                  <Card
                    key={prompt.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
                      selectedPrompt?.id === prompt.id && 'ring-2 ring-primary-500 bg-primary-50'
                    )}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            {prompt.category === 'viral' && <Rocket className="w-4 h-4 text-primary-600" />}
                            {prompt.category === 'educational' && <Lightbulb className="w-4 h-4 text-primary-600" />}
                            {prompt.category === 'entertainment' && <Star className="w-4 h-4 text-primary-600" />}
                            {prompt.category === 'promotional' && <Target className="w-4 h-4 text-primary-600" />}
                            {prompt.category === 'personal' && <Heart className="w-4 h-4 text-primary-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">{prompt.title}</h4>
                            <p className="text-xs text-neutral-500 capitalize">{prompt.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-warning-500" />
                          <span className="text-sm font-medium">{prompt.viralScore}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 mb-3">{prompt.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex space-x-2">
                          {prompt.platforms.map(platform => (
                            <span key={platform} className="px-2 py-1 bg-neutral-100 rounded-full capitalize">
                              {platform}
                            </span>
                          ))}
                        </div>
                        <span className="text-neutral-500">{prompt.estimatedTime}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Variable Inputs */}
              {selectedPrompt && (
                <Card className="p-6">
                  <h4 className="font-semibold text-neutral-900 mb-4">Customize Your Prompt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPrompt.variables.map(variable => (
                      <Input
                        key={variable}
                        label={variable.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        value={promptVariables[variable] || ''}
                        onChange={(e) => setPromptVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        placeholder={`Enter ${variable.replace('_', ' ')}`}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      onClick={handlePromptGenerate}
                      loading={isGenerating}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                      disabled={selectedPrompt.variables.some(v => !promptVariables[v])}
                      fullWidth
                    >
                      Generate Content
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Custom AI Prompt</h3>
                <TextArea
                  label="Describe what you want to create"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Example: Create a viral TikTok script about morning routines that will get Gen Z excited about productivity..."
                  characterLimit={500}
                  showCharacterCount
                  autoResize
                />
                
                <div className="mt-4">
                  <Button
                    onClick={handleCustomGenerate}
                    loading={isGenerating}
                    leftIcon={<Brain className="w-4 h-4" />}
                    disabled={!customPrompt.trim()}
                    fullWidth
                  >
                    Generate Custom Content
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Generated Content History</h3>
              {generatedContent.length === 0 ? (
                <Card className="p-8 text-center">
                  <Brain className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No generated content yet</p>
                  <p className="text-sm text-neutral-500 mt-1">Start by selecting a template or creating custom content</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {generatedContent.map(content => (
                    <Card key={content.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            content.confidence > 80 ? 'bg-success-500' :
                            content.confidence > 60 ? 'bg-warning-500' : 'bg-error-500'
                          )} />
                          <span className="text-sm font-medium text-neutral-700 capitalize">
                            {content.type}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {content.confidence}% confidence
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(content.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => regenerateContent(content)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => applyContent(content)}
                          >
                            Use This
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-neutral-800 whitespace-pre-wrap">
                          {content.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center space-x-4">
                          <span>{content.metadata.wordCount} words</span>
                          <span>{content.metadata.characterCount} characters</span>
                          <span>{content.metadata.estimatedReadTime} read</span>
                        </div>
                        <span className="capitalize">{content.metadata.sentiment}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* AI Settings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">AI Settings</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showAdvanced ? 'Simple' : 'Advanced'}
              </button>
            </div>

            <div className="space-y-4">
              {/* Creativity Slider */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Creativity Level: {settings.creativity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.creativity}
                  onChange={(e) => setSettings(prev => ({ ...prev, creativity: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Tone</label>
                <select
                  value={settings.tone}
                  onChange={(e) => setSettings(prev => ({ ...prev, tone: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="humorous">Humorous</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Target Platforms</label>
                <div className="grid grid-cols-2 gap-2">
                  {['instagram', 'tiktok', 'youtube', 'twitter'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        const newPlatforms = settings.platform.includes(platform)
                          ? settings.platform.filter(p => p !== platform)
                          : [...settings.platform, platform];
                        setSettings(prev => ({ ...prev, platform: newPlatforms }));
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                        settings.platform.includes(platform)
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {showAdvanced && (
                <>
                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Content Type</label>
                    <select
                      value={settings.contentType}
                      onChange={(e) => setSettings(prev => ({ ...prev, contentType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="post">Social Post</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel/Short</option>
                      <option value="video">Long Video</option>
                      <option value="thread">Thread</option>
                    </select>
                  </div>

                  {/* Brand Voice */}
                  <div>
                    <Input
                      label="Brand Voice (Optional)"
                      value={settings.brandVoice}
                      onChange={(e) => setSettings(prev => ({ ...prev, brandVoice: e.target.value }))}
                      placeholder="e.g., Friendly tech expert, Motivational fitness coach"
                    />
                  </div>

                  {/* Content Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">Include</label>
                    {[
                      { key: 'includeEmojis', label: 'Emojis' },
                      { key: 'includeHashtags', label: 'Hashtags' },
                      { key: 'includeCTA', label: 'Call to Action' }
                    ].map(option => (
                      <label key={option.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings[option.key as keyof AISettings] as boolean}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            [option.key]: e.target.checked
                          }))}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Quick Generate Buttons */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Quick Generate</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'title', label: 'Viral Title', icon: <Zap className="w-4 h-4" /> },
                { type: 'description', label: 'Caption', icon: <FileText className="w-4 h-4" /> },
                { type: 'hashtags', label: 'Hashtags', icon: <Hash className="w-4 h-4" /> },
                { type: 'script', label: 'Video Script', icon: <Video className="w-4 h-4" /> }
              ].map(item => (
                <Button
                  key={item.type}
                  variant="secondary"
                  onClick={() => generateContent('Generate creative content', item.type as any)}
                  loading={isGenerating}
                  leftIcon={item.icon}
                  className="justify-start"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Custom Prompt Area */}
        {activeTab === 'custom' && (
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Custom AI Prompt</h3>
              <TextArea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe exactly what you want to create. Be specific about your audience, platform, and goals..."
                characterLimit={500}
                showCharacterCount
                autoResize
                className="mb-4"
              />
              
              <Button
                onClick={handleCustomGenerate}
                loading={isGenerating}
                leftIcon={<Brain className="w-4 h-4" />}
                disabled={!customPrompt.trim()}
                fullWidth
              >
                Generate Custom Content
              </Button>
            </Card>
          </div>
        )}

        {/* Results Panel */}
        {generatedContent.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Latest Generation</h3>
              {generatedContent.slice(0, 1).map(content => (
                <div key={content.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        content.confidence > 80 ? 'bg-success-500' :
                        content.confidence > 60 ? 'bg-warning-500' : 'bg-error-500'
                      )} />
                      <span className="text-sm font-medium text-neutral-700">
                        {content.confidence}% confidence
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 capitalize">
                      {content.type}
                    </span>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-sm text-neutral-800 whitespace-pre-wrap">
                      {content.content}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                    <div>Words: {content.metadata.wordCount}</div>
                    <div>Characters: {content.metadata.characterCount}</div>
                    <div>Read time: {content.metadata.estimatedReadTime}</div>
                    <div className="capitalize">Tone: {content.metadata.tone}</div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(content.content)}
                      leftIcon={<Copy className="w-3 h-3" />}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => applyContent(content)}
                      leftIcon={<Check className="w-3 h-3" />}
                    >
                      Use This
                    </Button>
                  </div>

                  {/* Variations */}
                  {content.variations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-neutral-700">Variations:</p>
                      {content.variations.map((variation, index) => (
                        <div key={index} className="bg-neutral-50 rounded-lg p-2">
                          <p className="text-xs text-neutral-700">{variation.substring(0, 100)}...</p>
                          <button
                            onClick={() => applyContent({ ...content, content: variation })}
                            className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                          >
                            Use this variation
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">AI is Creating...</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Analyzing trends and generating optimized content for your audience
            </p>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};