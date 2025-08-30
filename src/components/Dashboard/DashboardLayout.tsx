import React, { useState, useEffect } from 'react';
import { cn } from '../../design-system/utils/cn';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  Home,
  PlusCircle,
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  Zap,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  HelpCircle,
  MessageSquare,
  Gift,
  Crown,
  Rocket
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'revenue';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentPage = 'dashboard' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'revenue',
      title: 'New Revenue!',
      message: 'You earned $127 from your latest Instagram post',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      action: { label: 'View Details', onClick: () => {} }
    },
    {
      id: '2',
      type: 'success',
      title: 'Content Published',
      message: 'Your TikTok video is now live and performing well!',
      timestamp: new Date(Date.now() - 1800000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'AI Suggestion Ready',
      message: 'New content ideas based on trending topics',
      timestamp: new Date(Date.now() - 3600000),
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, shortcut: '⌘1' },
    { id: 'create', label: 'Create Content', icon: <PlusCircle className="w-5 h-5" />, shortcut: '⌘N' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, shortcut: '⌘A' },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-5 h-5" />, shortcut: '⌘R' },
    { id: 'audience', label: 'Audience', icon: <Users className="w-5 h-5" />, shortcut: '⌘U' },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" />, shortcut: '⌘C' },
    { id: 'automation', label: 'Automation', icon: <Zap className="w-5 h-5" />, shortcut: '⌘Z' },
  ];

  const quickActions = [
    { label: 'New Post', icon: <PlusCircle className="w-4 h-4" />, action: () => {}, color: 'bg-primary-500' },
    { label: 'AI Generate', icon: <Sparkles className="w-4 h-4" />, action: () => {}, color: 'bg-purple-500' },
    { label: 'Schedule', icon: <Calendar className="w-4 h-4" />, action: () => {}, color: 'bg-success-500' },
    { label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, action: () => {}, color: 'bg-warning-500' },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            // Navigate to dashboard
            break;
          case 'n':
            e.preventDefault();
            // Open content creation
            break;
          case 'k':
            e.preventDefault();
            // Open command palette
            break;
          case '/':
            e.preventDefault();
            // Focus search
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-neutral-50', darkMode && 'dark')}>
      {/* Top Navigation */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  FlashFusion
                </span>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search content, analytics, or ask AI... (⌘K)"
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={cn(
                      'p-2 rounded-lg text-white hover:opacity-90 transition-all duration-200 hover:scale-105',
                      action.color
                    )}
                    title={action.label}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-neutral-900">Notifications</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700">
                          Mark all read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors',
                            !notification.read && 'bg-primary-50/50'
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              'w-2 h-2 rounded-full mt-2',
                              notification.type === 'revenue' && 'bg-success-500',
                              notification.type === 'success' && 'bg-primary-500',
                              notification.type === 'warning' && 'bg-warning-500',
                              notification.type === 'info' && 'bg-neutral-400'
                            )} />
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">{notification.title}</p>
                              <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-neutral-500 mt-2">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                              {notification.action && (
                                <button
                                  onClick={notification.action.onClick}
                                  className="text-xs text-primary-600 hover:text-primary-700 mt-2"
                                >
                                  {notification.action.label}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <img
                    src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-neutral-200">
                      <div className="flex items-center space-x-3">
                        <img
                          src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100"
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">Sarah Chen</p>
                          <p className="text-sm text-neutral-600">@sarahcreates</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Crown className="w-3 h-3 text-warning-500" />
                            <span className="text-xs text-warning-600 font-medium">Pro Plan</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <User className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-700">Profile Settings</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <Settings className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-700">Preferences</span>
                      </button>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        {darkMode ? <Sun className="w-4 h-4 text-neutral-500" /> : <Moon className="w-4 h-4 text-neutral-500" />}
                        <span className="text-sm text-neutral-700">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <HelpCircle className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-700">Help & Support</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <Gift className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-700">Refer Friends</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-neutral-200 p-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-error-50 text-error-600 transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="hidden lg:block p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                title="Toggle Fullscreen (F11)"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-neutral-200 lg:hidden">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-neutral-900">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group',
                    currentPage === item.id
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </span>
                </button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-neutral-200 space-y-3">
              {/* Upgrade Prompt */}
              <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Rocket className="w-4 h-4" />
                  <span className="text-sm font-medium">Upgrade to Pro</span>
                </div>
                <p className="text-xs opacity-90 mb-3">
                  Unlock unlimited AI generation and advanced analytics
                </p>
                <Button size="sm" variant="secondary" fullWidth>
                  Upgrade Now
                </Button>
              </Card>

              {/* Help & Support */}
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <MessageSquare className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">Help & Support</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Click outside handlers */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};