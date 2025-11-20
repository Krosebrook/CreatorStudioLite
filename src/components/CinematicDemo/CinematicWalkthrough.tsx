import React, { useState } from 'react';
import { cn } from '../../design-system/utils/cn';
import { useSequenceAnimation } from '../../hooks/useAnimation';
import { useViewport } from '../../hooks/useViewport';
import { AvatarAssistant } from './AvatarAssistant';
import {
  SplashScene,
  OnboardingScene,
  DashboardScene,
  InteractionScene,
  CompletionScene,
} from './SceneComponents';
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
} from 'lucide-react';

type ThemeVariant = 'light' | 'dark' | 'neon';
type AvatarAction = 'intro' | 'point' | 'celebrate' | 'explain';

interface Scene {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  narration?: string;
  avatarAction?: AvatarAction;
}

interface CinematicWalkthroughProps {
  onComplete?: () => void;
  onClose?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
  theme?: ThemeVariant;
}

export const CinematicWalkthrough: React.FC<CinematicWalkthroughProps> = ({
  onComplete,
  onClose,
  autoPlay = false,
  showControls = true,
  theme = 'dark',
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewport = useViewport();

  const scenes: Scene[] = [
    {
      id: 'splash',
      title: 'Welcome to SparkLabs',
      subtitle: 'Your All-in-One Creator Platform',
      duration: 3000,
      avatarAction: 'intro',
      narration: 'Welcome to SparkLabs, where creativity meets technology',
    },
    {
      id: 'onboarding',
      title: 'Meet Your AI Assistant',
      subtitle: 'Guided tour of platform capabilities',
      duration: 5000,
      avatarAction: 'intro',
      narration: 'Hi! I\'m Spark, your AI assistant. Let me show you around!',
    },
    {
      id: 'dashboard',
      title: 'Your Command Center',
      subtitle: 'Real-time insights and performance tracking',
      duration: 6000,
      avatarAction: 'explain',
      narration: 'This is your dashboard - your central hub for all creator activities',
    },
    {
      id: 'interaction',
      title: 'Create & Publish',
      subtitle: 'Seamless content creation workflow',
      duration: 7000,
      avatarAction: 'point',
      narration: 'Creating and publishing content has never been easier',
    },
    {
      id: 'completion',
      title: 'Ready to Amplify?',
      subtitle: 'Start your creator journey today',
      duration: 4000,
      avatarAction: 'celebrate',
      narration: 'You\'re all set! Let\'s start creating amazing content together!',
    },
  ];

  const sceneConfigs = scenes.map((scene) => ({
    duration: scene.duration,
    easing: 'easeInOut' as const,
  }));

  const {
    currentScene: sceneIndex,
    sceneProgress,
    totalProgress,
    isPlaying,
    playSequence,
    pauseSequence,
    resetSequence,
  } = useSequenceAnimation(sceneConfigs);

  const currentScene = scenes[sceneIndex];

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const renderScene = () => {
    const sceneProps = {
      progress: sceneProgress,
      isActive: true,
      theme,
    };

    switch (currentScene.id) {
      case 'splash':
        return <SplashScene {...sceneProps} />;
      case 'onboarding':
        return <OnboardingScene {...sceneProps} />;
      case 'dashboard':
        return <DashboardScene {...sceneProps} />;
      case 'interaction':
        return <InteractionScene {...sceneProps} />;
      case 'completion':
        return <CompletionScene {...sceneProps} />;
      default:
        return <SplashScene {...sceneProps} />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {renderScene()}

      {currentScene.avatarAction && (
        <AvatarAssistant
          action={currentScene.avatarAction}
          narration={currentScene.narration}
          theme={theme}
        />
      )}

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
                  style={{ width: `${totalProgress * 100}%` }}
                />
              </div>
              {viewport.isMobile && (
                <div className="text-white/70 text-xs mt-2 text-center">
                  Scene {sceneIndex + 1} of {scenes.length}
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={resetSequence}
                      disabled={sceneIndex === 0 && sceneProgress === 0}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipBack className="w-5 h-5 text-white" />
                    </button>

                    <button
                      onClick={isPlaying ? pauseSequence : playSequence}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-neutral-900" />
                      ) : (
                        <Play className="w-6 h-6 text-neutral-900 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleComplete}
                      disabled={sceneIndex === scenes.length - 1 && sceneProgress === 1}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-1">
                      {scenes.map((scene, index) => (
                        <div
                          key={scene.id}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all duration-200',
                            index === sceneIndex
                              ? 'bg-white w-8'
                              : index < sceneIndex
                              ? 'bg-white/70'
                              : 'bg-white/40'
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

    </div>
  );
};
