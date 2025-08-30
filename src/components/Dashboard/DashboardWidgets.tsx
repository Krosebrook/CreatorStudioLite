import React, { useState, useEffect } from 'react';
import { cn } from '../../design-system/utils/cn';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share, 
  DollarSign,
  Users,
  Calendar,
  Clock,
  Zap,
  Target,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  Download,
  ExternalLink,
  Play,
  Pause,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Camera,
  Video,
  Mic,
  FileText,
  Image,
  Filter,
  SortDesc,
  ChevronRight,
  Plus,
  Minus,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface MetricData {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  type: 'image' | 'video' | 'story' | 'reel';
  thumbnail: string;
  publishedAt: Date;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    revenue: number;
  };
  status: 'published' | 'scheduled' | 'draft';
}

interface RevenueStream {
  source: string;
  amount: number;
  change: number;
  color: string;
  icon: React.ReactNode;
}

// Real-time metrics widget
export const MetricsOverview: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [isLive, setIsLive] = useState(true);

  const metrics: MetricData[] = [
    { label: 'Total Views', value: '2.4M', change: '+12.5%', trend: 'up', period: 'vs last week' },
    { label: 'Engagement Rate', value: '8.7%', change: '+2.1%', trend: 'up', period: 'vs last week' },
    { label: 'New Followers', value: '15.2K', change: '+18.3%', trend: 'up', period: 'vs last week' },
    { label: 'Revenue', value: '$3,247', change: '+24.7%', trend: 'up', period: 'vs last week' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-neutral-900">Performance Overview</h3>
          {isLive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-xs text-success-600 font-medium">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button size="sm" variant="ghost">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <p className="text-sm font-medium text-neutral-600">{metric.label}</p>
            <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
            <div className="flex items-center space-x-1">
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : metric.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-error-500" />
              ) : (
                <div className="w-4 h-4" />
              )}
              <span className={cn(
                'text-sm font-medium',
                metric.trend === 'up' && 'text-success-600',
                metric.trend === 'down' && 'text-error-600',
                metric.trend === 'neutral' && 'text-neutral-600'
              )}>
                {metric.change}
              </span>
            </div>
            <p className="text-xs text-neutral-500">{metric.period}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Recent content performance widget
export const RecentContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'performance' | 'revenue'>('recent');

  const content: ContentItem[] = [
    {
      id: '1',
      title: 'Summer Fashion Haul 2024',
      platform: 'instagram',
      type: 'reel',
      thumbnail: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
      publishedAt: new Date(Date.now() - 3600000),
      metrics: { views: 125000, likes: 8900, comments: 234, shares: 156, revenue: 247 },
      status: 'published'
    },
    {
      id: '2',
      title: 'Quick Makeup Tutorial',
      platform: 'tiktok',
      type: 'video',
      thumbnail: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400',
      publishedAt: new Date(Date.now() - 7200000),
      metrics: { views: 89000, likes: 12400, comments: 567, shares: 234, revenue: 89 },
      status: 'published'
    },
    {
      id: '3',
      title: 'Behind the Scenes: Content Creation',
      platform: 'youtube',
      type: 'video',
      thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      publishedAt: new Date(Date.now() + 86400000),
      metrics: { views: 0, likes: 0, comments: 0, shares: 0, revenue: 0 },
      status: 'scheduled'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'tiktok': return <div className="w-4 h-4 bg-black rounded-sm" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-500" />;
      default: return <Globe className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'reel': return <Camera className="w-4 h-4" />;
      case 'story': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Recent Content</h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="recent">Most Recent</option>
            <option value="performance">Best Performance</option>
            <option value="revenue">Highest Revenue</option>
          </select>
          
          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1 rounded transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1 rounded transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'
              )}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {content.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                {getPlatformIcon(item.platform)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-neutral-900 truncate">{item.title}</h4>
                {getTypeIcon(item.type)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-neutral-600">
                <span className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{item.metrics.views.toLocaleString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{item.metrics.likes.toLocaleString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${item.metrics.revenue}</span>
                </span>
              </div>
              
              <p className="text-xs text-neutral-500 mt-1">
                {item.status === 'scheduled' ? 'Scheduled for ' : 'Published '}
                {item.publishedAt.toLocaleDateString()}
              </p>
            </div>
            
            <Button size="sm" variant="ghost">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <Button variant="ghost" fullWidth>
          View All Content
        </Button>
      </div>
    </Card>
  );
};

// Revenue tracking widget
export const RevenueWidget: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const revenueStreams: RevenueStream[] = [
    { source: 'Brand Partnerships', amount: 1850, change: 15.2, color: 'bg-primary-500', icon: <Award className="w-4 h-4" /> },
    { source: 'Affiliate Marketing', amount: 892, change: 8.7, color: 'bg-success-500', icon: <Target className="w-4 h-4" /> },
    { source: 'Course Sales', amount: 645, change: -2.1, color: 'bg-warning-500', icon: <FileText className="w-4 h-4" /> },
    { source: 'Merchandise', amount: 234, change: 22.4, color: 'bg-purple-500', icon: <Gift className="w-4 h-4" /> },
  ];

  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.amount, 0);
  const totalChange = ((revenueStreams.reduce((sum, stream) => sum + (stream.amount * stream.change / 100), 0) / totalRevenue) * 100);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-neutral-900">Revenue Tracking</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-xs text-success-600 font-medium">Live</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Button size="sm" variant="ghost">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-neutral-900">
            ${totalRevenue.toLocaleString()}
          </span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-success-500" />
            <span className="text-sm font-medium text-success-600">
              +{totalChange.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-neutral-600">Total revenue this {period}</p>
      </div>

      {/* Revenue Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Revenue Streams</span>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showBreakdown ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        {showBreakdown && (
          <div className="space-y-2">
            {revenueStreams.map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={cn('p-2 rounded-lg text-white', stream.color)}>
                    {stream.icon}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{stream.source}</p>
                    <div className="flex items-center space-x-1">
                      {stream.change > 0 ? (
                        <TrendingUp className="w-3 h-3 text-success-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-error-500" />
                      )}
                      <span className={cn(
                        'text-xs font-medium',
                        stream.change > 0 ? 'text-success-600' : 'text-error-600'
                      )}>
                        {stream.change > 0 ? '+' : ''}{stream.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-neutral-900">
                  ${stream.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// AI insights widget
export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState([
    {
      type: 'opportunity',
      title: 'Trending Topic Alert',
      message: 'Fashion week content is trending +340%. Create related content now.',
      action: 'Create Content',
      priority: 'high',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      type: 'optimization',
      title: 'Best Posting Time',
      message: 'Your audience is most active at 7 PM EST. Schedule your next post.',
      action: 'Schedule Now',
      priority: 'medium',
      icon: <Clock className="w-4 h-4" />
    },
    {
      type: 'revenue',
      title: 'Brand Partnership Match',
      message: 'Nike wants to collaborate. 95% compatibility score.',
      action: 'View Proposal',
      priority: 'high',
      icon: <Award className="w-4 h-4" />
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-error-500 bg-error-50';
      case 'medium': return 'border-l-warning-500 bg-warning-50';
      case 'low': return 'border-l-primary-500 bg-primary-50';
      default: return 'border-l-neutral-500 bg-neutral-50';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">AI Insights</h3>
        </div>
        <Button size="sm" variant="ghost">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'p-4 border-l-4 rounded-lg transition-all duration-200 hover:shadow-sm',
              getPriorityColor(insight.priority)
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">{insight.title}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{insight.message}</p>
                </div>
              </div>
              <Button size="sm" variant="primary">
                {insight.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <Button variant="ghost" fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
          Generate More Insights
        </Button>
      </div>
    </Card>
  );
};

// Quick actions widget
export const QuickActions: React.FC = () => {
  const actions = [
    { 
      label: 'Create Post', 
      icon: <Plus className="w-5 h-5" />, 
      color: 'bg-primary-500 hover:bg-primary-600',
      description: 'Start creating new content',
      shortcut: '⌘N'
    },
    { 
      label: 'AI Generate', 
      icon: <Sparkles className="w-5 h-5" />, 
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Generate content with AI',
      shortcut: '⌘G'
    },
    { 
      label: 'Schedule', 
      icon: <Calendar className="w-5 h-5" />, 
      color: 'bg-success-500 hover:bg-success-600',
      description: 'Schedule upcoming posts',
      shortcut: '⌘S'
    },
    { 
      label: 'Analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      color: 'bg-warning-500 hover:bg-warning-600',
      description: 'View detailed analytics',
      shortcut: '⌘A'
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={cn(
              'p-4 rounded-lg text-white transition-all duration-200 hover:scale-105 hover:shadow-lg group',
              action.color
            )}
            title={`${action.description} (${action.shortcut})`}
          >
            <div className="flex flex-col items-center space-y-2">
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                {action.shortcut}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-2">Pro Tip</p>
          <p className="text-sm text-neutral-700">
            Use keyboard shortcuts to speed up your workflow
          </p>
        </div>
      </div>
    </Card>
  );
};

// Platform status widget
export const PlatformStatus: React.FC = () => {
  const platforms = [
    { 
      name: 'Instagram', 
      icon: <Instagram className="w-5 h-5" />, 
      connected: true, 
      status: 'healthy',
      lastSync: '2 min ago',
      followers: '125K',
      engagement: '8.7%',
      color: 'text-pink-500'
    },
    { 
      name: 'TikTok', 
      icon: <div className="w-5 h-5 bg-black rounded-sm" />, 
      connected: true, 
      status: 'healthy',
      lastSync: '5 min ago',
      followers: '89K',
      engagement: '12.3%',
      color: 'text-black'
    },
    { 
      name: 'YouTube', 
      icon: <Youtube className="w-5 h-5" />, 
      connected: true, 
      status: 'syncing',
      lastSync: 'Syncing...',
      followers: '45K',
      engagement: '6.2%',
      color: 'text-red-500'
    },
    { 
      name: 'Twitter', 
      icon: <Twitter className="w-5 h-5" />, 
      connected: false, 
      status: 'disconnected',
      lastSync: 'Never',
      followers: '0',
      engagement: '0%',
      color: 'text-blue-500'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success-500';
      case 'syncing': return 'bg-warning-500 animate-pulse';
      case 'error': return 'bg-error-500';
      case 'disconnected': return 'bg-neutral-300';
      default: return 'bg-neutral-300';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Platform Status</h3>
        <Button size="sm" variant="ghost">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {platforms.map((platform, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={cn('p-2 rounded-lg bg-neutral-100', platform.color)}>
                  {platform.icon}
                </div>
                <div className={cn(
                  'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                  getStatusColor(platform.status)
                )} />
              </div>
              
              <div>
                <p className="font-medium text-neutral-900">{platform.name}</p>
                <p className="text-xs text-neutral-500">{platform.lastSync}</p>
              </div>
            </div>
            
            {platform.connected ? (
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">{platform.followers}</p>
                <p className="text-xs text-neutral-500">{platform.engagement} engagement</p>
              </div>
            ) : (
              <Button size="sm" variant="primary">
                Connect
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// Upcoming schedule widget
export const UpcomingSchedule: React.FC = () => {
  const scheduledContent = [
    {
      id: '1',
      title: 'Morning Routine Tips',
      platform: 'instagram',
      type: 'story',
      scheduledFor: new Date(Date.now() + 3600000), // 1 hour from now
      status: 'ready'
    },
    {
      id: '2',
      title: 'Product Review: New Camera',
      platform: 'youtube',
      type: 'video',
      scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
      status: 'processing'
    },
    {
      id: '3',
      title: 'Weekly Motivation Thread',
      platform: 'twitter',
      type: 'thread',
      scheduledFor: new Date(Date.now() + 172800000), // Day after tomorrow
      status: 'draft'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Upcoming Schedule</h3>
        <Button size="sm" variant="ghost">
          <Calendar className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {scheduledContent.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 truncate">{item.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-neutral-500 capitalize">{item.platform}</span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500">
                  {item.scheduledFor.toLocaleDateString()} at {item.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <div className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              item.status === 'ready' && 'bg-success-100 text-success-700',
              item.status === 'processing' && 'bg-warning-100 text-warning-700',
              item.status === 'draft' && 'bg-neutral-100 text-neutral-700'
            )}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <Button variant="ghost" fullWidth>
          View Full Calendar
        </Button>
      </div>
    </Card>
  );
};

// Trending topics widget
export const TrendingTopics: React.FC = () => {
  const trends = [
    { topic: '#SummerVibes', growth: '+340%', posts: '2.4M', difficulty: 'Medium' },
    { topic: '#TechReview', growth: '+180%', posts: '890K', difficulty: 'Easy' },
    { topic: '#FitnessMotivation', growth: '+95%', posts: '1.2M', difficulty: 'Hard' },
    { topic: '#CookingHacks', growth: '+67%', posts: '567K', difficulty: 'Easy' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Trending Now</h3>
        </div>
        <Button size="sm" variant="ghost">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {trends.map((trend, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-neutral-900">{trend.topic}</p>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  trend.difficulty === 'Easy' && 'bg-success-100 text-success-700',
                  trend.difficulty === 'Medium' && 'bg-warning-100 text-warning-700',
                  trend.difficulty === 'Hard' && 'bg-error-100 text-error-700'
                )}>
                  {trend.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm font-medium text-success-600">{trend.growth}</span>
                <span className="text-xs text-neutral-500">{trend.posts} posts</span>
              </div>
            </div>
            
            <Button size="sm" variant="primary">
              Use Trend
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};