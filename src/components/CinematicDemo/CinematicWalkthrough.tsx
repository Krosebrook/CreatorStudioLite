import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../design-system/utils/cn';
import { Button } from '../../design-system/components/Button';
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Camera,
  Image as ImageIcon,
  Video,
  Calendar,
  Globe,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Eye,
  Heart,
  MessageCircle,
  Share
} from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  content: React.ReactNode;
  narration?: string;
  animation: 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'morph';
  avatarAction?: 'intro' | 'point' | 'celebrate' | 'explain';
}

interface CinematicWalkthroughProps {
  onComplete?: () => void;
  onClose?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
  style?: 'minimalist' | 'cinematic' | 'futuristic';
}

export const CinematicWalkthrough: React.FC<CinematicWalkthroughProps> = ({
  onComplete,
  onClose,
  autoPlay = false,
  showControls = true,
  style = 'cinematic'
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const scenes: Scene[] = [
    {
      id: 'splash',
      title: 'Welcome to SparkLabs',
      subtitle: 'Your All-in-One Creator Platform',
      duration: 3000,
      animation: 'morph',
      avatarAction: 'intro',
      narration: 'Welcome to SparkLabs, where creativity meets technology',
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

          <div className="relative z-10 text-center space-y-8 animate-fade-in">
            <div className="inline-block">
              <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                <Sparkles className="w-16 h-16 text-primary-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white animate-slide-up" style={{ animationDelay: '0.2s' }}>
                SparkLabs
              </h1>
              <p className="text-2xl text-primary-100 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                Create. Amplify. Grow.
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 text-white/80 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold">2M+</div>
                <div className="text-sm">Creators</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">$250M+</div>
                <div className="text-sm">Revenue</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">50B+</div>
                <div className="text-sm">Views</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowRight className="w-8 h-8 text-white/60 rotate-90" />
          </div>
        </div>
      )
    },
    {
      id: 'onboarding',
      title: 'Meet Your AI Assistant',
      subtitle: 'Guided tour of platform capabilities',
      duration: 5000,
      animation: 'slide-left',
      avatarAction: 'intro',
      narration: 'Hi! I\'m Spark, your AI assistant. Let me show you around!',
      content: (
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-success-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center px-8">
            <div className="space-y-6 animate-slide-left">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                <Sparkles className="w-16 h-16 text-white" />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                  Meet Spark ✨
                </h2>
                <p className="text-xl text-neutral-600 leading-relaxed">
                  Your AI-powered assistant that helps you create viral content, manage multiple platforms, and grow your audience exponentially.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: <Camera className="w-5 h-5" />, text: 'AI Content Generation' },
                  { icon: <Globe className="w-5 h-5" />, text: 'Multi-Platform Publishing' },
                  { icon: <BarChart3 className="w-5 h-5" />, text: 'Real-Time Analytics' },
                  { icon: <DollarSign className="w-5 h-5" />, text: 'Revenue Optimization' }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-neutral-700 animate-slide-left"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {feature.icon}
                    </div>
                    <span className="font-medium">{feature.text}</span>
                    <Check className="w-5 h-5 text-success-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-right">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <h3 className="font-semibold text-neutral-900">Quick Tour</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                      <span className="text-sm text-neutral-600">Active</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Create Content', progress: 100, color: 'bg-success-500' },
                      { label: 'Connect Platforms', progress: 75, color: 'bg-primary-500' },
                      { label: 'Set Up Analytics', progress: 50, color: 'bg-warning-500' },
                      { label: 'Optimize Revenue', progress: 25, color: 'bg-neutral-300' }
                    ].map((step, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700">{step.label}</span>
                          <span className="text-neutral-500">{step.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className={cn(step.color, 'h-2 rounded-full transition-all duration-1000')}
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Your Command Center',
      subtitle: 'Real-time insights and performance tracking',
      duration: 6000,
      animation: 'zoom',
      avatarAction: 'explain',
      narration: 'This is your dashboard - your central hub for all creator activities',
      content: (
        <div className="relative w-full h-full bg-gradient-to-br from-white via-neutral-50 to-primary-50 overflow-hidden p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">Creator Dashboard</h2>
                <p className="text-neutral-600">Real-time performance across all platforms</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse" />
                <span className="text-sm text-neutral-600">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: <Users />, label: 'Followers', value: '259K', trend: '+15.3%', color: 'primary' },
                { icon: <Eye />, label: 'Views', value: '12.4M', trend: '+24.7%', color: 'success' },
                { icon: <Heart />, label: 'Engagement', value: '8.7%', trend: '+2.1%', color: 'error' },
                { icon: <DollarSign />, label: 'Revenue', value: '$18.7K', trend: '+34.2%', color: 'warning' }
              ].map((metric, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      `bg-${metric.color}-100 text-${metric.color}-600`
                    )}>
                      {React.cloneElement(metric.icon, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-success-500" />
                      <span className="text-xs text-success-600 font-medium">{metric.trend}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg animate-slide-left" style={{ animationDelay: '0.4s' }}>
                <h3 className="font-semibold text-neutral-900 mb-4">Platform Performance</h3>
                <div className="space-y-3">
                  {[
                    { platform: 'Instagram', followers: '125K', engagement: '8.7%', icon: <Instagram className="w-5 h-5 text-pink-500" /> },
                    { platform: 'YouTube', followers: '89K', engagement: '12.3%', icon: <Youtube className="w-5 h-5 text-red-500" /> },
                    { platform: 'TikTok', followers: '45K', engagement: '15.1%', icon: <Video className="w-5 h-5 text-black" /> }
                  ].map((platform, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        {platform.icon}
                        <span className="font-medium text-neutral-900">{platform.platform}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-neutral-900">{platform.followers}</div>
                        <div className="text-xs text-success-600">{platform.engagement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg animate-slide-right" style={{ animationDelay: '0.6s' }}>
                <h3 className="font-semibold text-neutral-900 mb-4">Content Performance</h3>
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">Video Content</span>
                      <span className="text-sm text-neutral-600">94%</span>
                    </div>
                    <div className="overflow-hidden h-2 bg-neutral-200 rounded-full">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">Image Posts</span>
                      <span className="text-sm text-neutral-600">87%</span>
                    </div>
                    <div className="overflow-hidden h-2 bg-neutral-200 rounded-full">
                      <div className="bg-gradient-to-r from-success-500 to-success-600 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">Stories</span>
                      <span className="text-sm text-neutral-600">76%</span>
                    </div>
                    <div className="overflow-hidden h-2 bg-neutral-200 rounded-full">
                      <div className="bg-gradient-to-r from-warning-500 to-warning-600 h-2 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'interaction',
      title: 'Create & Publish',
      subtitle: 'Seamless content creation workflow',
      duration: 7000,
      animation: 'slide-up',
      avatarAction: 'point',
      narration: 'Creating and publishing content has never been easier',
      content: (
        <div className="relative w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-slide-left">
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-white">
                  Create Stunning Content
                </h2>
                <p className="text-xl text-neutral-300">
                  AI-powered tools that adapt to every platform
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <Camera />, title: 'Capture', desc: 'Professional camera & video tools', delay: '0s' },
                  { icon: <Zap />, title: 'AI Generate', desc: 'Let AI create content for you', delay: '0.1s' },
                  { icon: <ImageIcon />, title: 'Edit', desc: 'Advanced editing with one click', delay: '0.2s' },
                  { icon: <Globe />, title: 'Publish', desc: 'Multi-platform in seconds', delay: '0.3s' }
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 animate-slide-left"
                    style={{ animationDelay: step.delay }}
                  >
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      {React.cloneElement(step.icon, { className: 'w-6 h-6 text-white' })}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{step.title}</h4>
                      <p className="text-sm text-neutral-300">{step.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400 ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-right">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Content Studio</h3>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Video className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="aspect-video bg-neutral-200 rounded-lg overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      defaultValue="Summer vibes ☀️ #fashion #lifestyle"
                    />

                    <div className="flex flex-wrap gap-2">
                      {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map((platform, index) => (
                        <button
                          key={index}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                            index < 2 ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          )}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                      <span>Publish Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'completion',
      title: 'Ready to Amplify?',
      subtitle: 'Start your creator journey today',
      duration: 4000,
      animation: 'zoom',
      avatarAction: 'celebrate',
      narration: 'You\'re all set! Let\'s start creating amazing content together!',
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success-600 via-primary-600 to-primary-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

          <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-8">
            <div className="inline-block animate-bounce-slow">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Check className="w-12 h-12 text-success-600" />
              </div>
            </div>

            <div className="space-y-4 animate-slide-up">
              <h1 className="text-5xl font-bold text-white">
                You're All Set! 🎉
              </h1>
              <p className="text-2xl text-white/90">
                Start creating content that reaches millions
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 py-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: <Zap />, title: 'Fast', desc: '10x faster creation' },
                { icon: <TrendingUp />, title: 'Smart', desc: 'AI-powered insights' },
                { icon: <DollarSign />, title: 'Profitable', desc: 'Maximize revenue' }
              ].map((benefit, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
                    {React.cloneElement(benefit.icon, { className: 'w-8 h-8 text-white' })}
                  </div>
                  <h3 className="font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm text-white/80">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={onComplete}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200">
                Watch Demo Again
              </button>
            </div>

            <p className="text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.7s' }}>
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    if (isPlaying) {
      const sceneProgress = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / (currentScene.duration / 100));
          if (newProgress >= 100) {
            clearInterval(sceneProgress);
            handleNextScene();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      progressIntervalRef.current = sceneProgress;

      return () => clearInterval(sceneProgress);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [isPlaying, currentSceneIndex]);

  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  };

  const handlePreviousScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSkipToScene = (index: number) => {
    setCurrentSceneIndex(index);
    setProgress(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getAnimationClass = (animation: Scene['animation']) => {
    switch (animation) {
      case 'fade': return 'animate-fade-in';
      case 'slide-up': return 'animate-slide-up';
      case 'slide-left': return 'animate-slide-left';
      case 'zoom': return 'animate-zoom-in';
      case 'morph': return 'animate-morph';
      default: return 'animate-fade-in';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <div className={cn('w-full h-full', getAnimationClass(currentScene.animation))}>
        {currentScene.content}
      </div>

      {showControls && (
        <>
          <div className="absolute top-0 left-0 right-0 z-50">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold">{currentScene.title}</h3>
                  <p className="text-sm text-white/70">{currentScene.subtitle}</p>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            <div className="px-6 pb-4">
              <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-1 overflow-hidden">
                <div
                  className="bg-white h-1 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousScene}
                      disabled={currentSceneIndex === 0}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipBack className="w-5 h-5 text-white" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-neutral-900" />
                      ) : (
                        <Play className="w-6 h-6 text-neutral-900 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleNextScene}
                      disabled={currentSceneIndex === scenes.length - 1}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-1">
                      {scenes.map((scene, index) => (
                        <button
                          key={scene.id}
                          onClick={() => handleSkipToScene(index)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all duration-200',
                            index === currentSceneIndex
                              ? 'bg-white w-8'
                              : 'bg-white/40 hover:bg-white/60'
                          )}
                          title={scene.title}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-slide-left {
          animation: slideLeft 0.6s ease-out forwards;
        }
        .animate-slide-right {
          animation: slideRight 0.6s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoomIn 0.6s ease-out forwards;
        }
        .animate-morph {
          animation: morph 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes morph {
          from { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
