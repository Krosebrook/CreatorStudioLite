import React, { useState, useEffect } from 'react';
import { cn } from '../../design-system/utils/cn';
import { DashboardLayout } from './DashboardLayout';
import { MetricsOverview, RecentContent, RevenueWidget, AIInsights, QuickActions, PlatformStatus, UpcomingSchedule, TrendingTopics } from './DashboardWidgets';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { 
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Target,
  Award,
  Eye,
  Heart,
  Settings,
  Layout,
  Move,
  RotateCcw,
  Save,
  Rocket,
  X
} from 'lucide-react';

interface Widget {
  id: string;
  component: React.ComponentType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  removable: boolean;
}

interface CreatorStats {
  totalFollowers: number;
  totalViews: number;
  totalRevenue: number;
  engagementRate: number;
  contentCount: number;
  averageViews: number;
  topPlatform: string;
  growthRate: number;
}

export const CreatorDashboard: React.FC = () => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'metrics', component: MetricsOverview, title: 'Performance Overview', size: 'large', position: { x: 0, y: 0 }, removable: false },
    { id: 'quick-actions', component: QuickActions, title: 'Quick Actions', size: 'small', position: { x: 2, y: 0 }, removable: true },
    { id: 'revenue', component: RevenueWidget, title: 'Revenue Tracking', size: 'medium', position: { x: 0, y: 1 }, removable: true },
    { id: 'ai-insights', component: AIInsights, title: 'AI Insights', size: 'medium', position: { x: 1, y: 1 }, removable: true },
    { id: 'recent-content', component: RecentContent, title: 'Recent Content', size: 'large', position: { x: 0, y: 2 }, removable: true },
    { id: 'platform-status', component: PlatformStatus, title: 'Platform Status', size: 'small', position: { x: 2, y: 1 }, removable: true },
    { id: 'schedule', component: UpcomingSchedule, title: 'Upcoming Schedule', size: 'medium', position: { x: 0, y: 3 }, removable: true },
    { id: 'trending', component: TrendingTopics, title: 'Trending Topics', size: 'medium', position: { x: 1, y: 3 }, removable: true },
  ]);

  const [creatorStats, setCreatorStats] = useState<CreatorStats>({
    totalFollowers: 259000,
    totalViews: 12400000,
    totalRevenue: 18750,
    engagementRate: 8.7,
    contentCount: 342,
    averageViews: 36257,
    topPlatform: 'Instagram',
    growthRate: 15.3
  });

  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const getGreeting = () => {
    const greetings = {
      morning: '🌅 Good morning',
      afternoon: '☀️ Good afternoon', 
      evening: '🌙 Good evening'
    };
    return greetings[timeOfDay];
  };

  const getWidgetGridClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 lg:col-span-2';
      case 'large': return 'col-span-1 lg:col-span-2 xl:col-span-3';
      case 'full': return 'col-span-full';
      default: return 'col-span-1';
    }
  };

  const availableWidgets = [
    { id: 'content-calendar', title: 'Content Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'competitor-analysis', title: 'Competitor Analysis', icon: <Target className="w-4 h-4" /> },
    { id: 'brand-partnerships', title: 'Brand Partnerships', icon: <Award className="w-4 h-4" /> },
    { id: 'audience-insights', title: 'Audience Insights', icon: <Users className="w-4 h-4" /> },
    { id: 'viral-tracker', title: 'Viral Content Tracker', icon: <Rocket className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {getGreeting()}, Sarah! 👋
            </h1>
            <p className="text-neutral-600 mt-1">
              Your content is up {creatorStats.growthRate}% this week. Revenue goal: 78% complete.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={isCustomizing ? 'primary' : 'ghost'}
              onClick={() => setIsCustomizing(!isCustomizing)}
              leftIcon={isCustomizing ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            >
              {isCustomizing ? 'Save Layout' : 'Customize'}
            </Button>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Content
            </Button>
          </div>
        </div>

        {/* Key Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Users className="w-6 h-6 text-primary-500" />
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-success-500" />
                  <span className="text-xs text-success-600 font-medium">+{creatorStats.growthRate}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Followers</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {(creatorStats.totalFollowers / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Eye className="w-6 h-6 text-primary-500" />
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-success-500" />
                  <span className="text-xs text-success-600 font-medium">+12.5%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Views</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {(creatorStats.totalViews / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <DollarSign className="w-6 h-6 text-success-500" />
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-success-500" />
                  <span className="text-xs text-success-600 font-medium">+24.7%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-neutral-900">
                  ${(creatorStats.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Heart className="w-6 h-6 text-error-500" />
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-success-500" />
                  <span className="text-xs text-success-600 font-medium">+2.1%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-neutral-900">{creatorStats.engagementRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Customization Mode */}
        {isCustomizing && (
          <Card className="p-4 bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layout className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">Customize Your Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button size="sm" variant="primary">
                  <Save className="w-4 h-4" />
                  Save Layout
                </Button>
              </div>
            </div>
            <p className="text-sm text-primary-700 mt-2">
              Drag widgets to rearrange, click the + button to add new widgets, or remove widgets you don't need.
            </p>
          </Card>
        )}

        {/* Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => {
            const WidgetComponent = widget.component;
            return (
              <div
                key={widget.id}
                className={cn(
                  getWidgetGridClass(widget.size),
                  isCustomizing && 'relative group'
                )}
              >
                {isCustomizing && (
                  <div className="absolute -top-2 -right-2 z-10 flex space-x-1">
                    <button className="w-6 h-6 bg-white border border-neutral-300 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors">
                      <Move className="w-3 h-3 text-neutral-600" />
                    </button>
                    {widget.removable && (
                      <button className="w-6 h-6 bg-white border border-neutral-300 rounded-full flex items-center justify-center hover:bg-error-50 hover:border-error-300 transition-colors">
                        <X className="w-3 h-3 text-error-600" />
                      </button>
                    )}
                  </div>
                )}
                <WidgetComponent />
              </div>
            );
          })}
          
          {/* Add Widget Button */}
          {isCustomizing && (
            <Card className="p-4 border-2 border-dashed border-neutral-300 hover:border-primary-400 transition-colors cursor-pointer">
              <div className="text-center">
                <Plus className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <h3 className="font-medium text-neutral-700 mb-3">Add Widget</h3>
                <div className="space-y-1">
                  {availableWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      className="w-full flex items-center space-x-2 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                    >
                      {widget.icon}
                      <span>{widget.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* AI Assistant Floating Action */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Stats Footer */}
        <Card className="p-6 bg-gradient-to-r from-primary-50 to-success-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">This Week</p>
                <p className="text-2xl font-bold text-primary-600">+{creatorStats.growthRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">Top Content</p>
                <p className="text-2xl font-bold text-success-600">{(creatorStats.averageViews / 1000).toFixed(0)}K views</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">Revenue Goal</p>
                <p className="text-2xl font-bold text-warning-600">78%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="sm" variant="primary" leftIcon={<Target className="w-4 h-4" />}>
                Set Goals
              </Button>
              <Button size="sm" variant="ghost" leftIcon={<BarChart3 className="w-4 h-4" />}>
                Full Report
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};