import React from 'react';
import { cn } from '../../design-system/utils/cn';

interface SceneProps {
  progress: number;
  isActive: boolean;
  theme: 'light' | 'dark' | 'neon';
}

export function SplashScene({ progress, isActive, theme }: SceneProps) {
  const opacity = Math.min(progress * 2, 1);
  const scale = 0.5 + progress * 0.5;
  const rotation = progress * 360;

  const themeColors = {
    light: 'from-blue-500 to-cyan-500',
    dark: 'from-slate-800 to-slate-900',
    neon: 'from-pink-500 via-purple-500 to-cyan-500',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'transition-opacity duration-500',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className={cn('relative', theme === 'neon' && 'animate-pulse')}>
        <div
          className="absolute inset-0 blur-3xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${theme === 'neon' ? '#ff00ff' : '#3b82f6'} 0%, transparent 70%)`,
            transform: `scale(${scale * 2})`,
          }}
        />

        <div
          className="relative"
          style={{
            opacity,
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className={cn('w-32 h-32 rounded-3xl bg-gradient-to-br', themeColors[theme])}>
            <div className="w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 text-white"
                style={{ opacity: Math.max(0, progress - 0.5) * 2 }}
              >
                <path
                  d="M50 10 L90 90 L10 90 Z"
                  fill="currentColor"
                  transform="rotate(0 50 50)"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          style={{ opacity: Math.max(0, (progress - 0.7) * 3) }}
        >
          <h1
            className={cn(
              'text-4xl font-bold',
              theme === 'light' && 'text-gray-900',
              theme === 'dark' && 'text-white',
              theme === 'neon' && 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500'
            )}
          >
            SparkLabs
          </h1>
        </div>
      </div>
    </div>
  );
}

export function OnboardingScene({ progress, isActive, theme }: SceneProps) {
  const slideIn = Math.min(progress * 1.5, 1);
  const fadeIn = Math.max(0, (progress - 0.3) * 2);

  const bgColor = {
    light: 'bg-white',
    dark: 'bg-gray-900',
    neon: 'bg-black',
  };

  const textColor = {
    light: 'text-gray-900',
    dark: 'text-white',
    neon: 'text-cyan-400',
  };

  const accentColor = {
    light: 'border-blue-500',
    dark: 'border-slate-600',
    neon: 'border-pink-500',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center p-8',
        'transition-opacity duration-500',
        bgColor[theme],
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          style={{
            transform: `translateX(${(1 - slideIn) * -100}px)`,
            opacity: slideIn,
          }}
        >
          <div
            className={cn(
              'aspect-video rounded-2xl border-4',
              accentColor[theme],
              'relative overflow-hidden',
              theme === 'neon' && 'shadow-lg shadow-pink-500/50'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn('text-6xl', textColor[theme])}
                style={{ opacity: fadeIn }}
              >
                ▶
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col justify-center space-y-4"
          style={{
            transform: `translateX(${(1 - fadeIn) * 100}px)`,
            opacity: fadeIn,
          }}
        >
          <h2 className={cn('text-3xl font-bold', textColor[theme])}>
            Welcome to Your Studio
          </h2>
          <p className={cn('text-lg opacity-80', textColor[theme])}>
            Plan, create, and publish content across all your platforms from one unified workspace.
          </p>
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all duration-300',
                  i === 1 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700',
                  theme === 'neon' && i === 1 && 'bg-pink-500 shadow-lg shadow-pink-500/50'
                )}
                style={{
                  opacity: Math.max(0, (progress - i * 0.2) * 2),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardScene({ progress, isActive, theme }: SceneProps) {
  const cardDelay = [0, 0.15, 0.3, 0.45];

  const bgColor = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    neon: 'bg-black',
  };

  const cardBg = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700',
    neon: 'bg-gray-900 border-pink-500/30',
  };

  const textColor = {
    light: 'text-gray-900',
    dark: 'text-white',
    neon: 'text-cyan-400',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-auto p-8',
        'transition-opacity duration-500',
        bgColor[theme],
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="mb-8"
          style={{
            opacity: Math.min(progress * 2, 1),
            transform: `translateY(${(1 - Math.min(progress * 2, 1)) * 20}px)`,
          }}
        >
          <h1 className={cn('text-4xl font-bold mb-2', textColor[theme])}>
            Dashboard
          </h1>
          <p className={cn('text-lg opacity-70', textColor[theme])}>
            Your content at a glance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardDelay.map((delay, idx) => {
            const cardProgress = Math.max(0, Math.min((progress - delay) * 2, 1));
            const metrics = [
              { label: 'Total Views', value: '1.2M', change: '+12%' },
              { label: 'Engagement', value: '8.4%', change: '+2.3%' },
              { label: 'Content', value: '247', change: '+15' },
              { label: 'Revenue', value: '$4.2K', change: '+18%' },
            ];

            return (
              <div
                key={idx}
                className={cn(
                  'border rounded-xl p-6 transition-all duration-300',
                  cardBg[theme],
                  theme === 'neon' && 'shadow-lg shadow-pink-500/10 hover:shadow-pink-500/30'
                )}
                style={{
                  opacity: cardProgress,
                  transform: `translateY(${(1 - cardProgress) * 30}px) scale(${0.9 + cardProgress * 0.1})`,
                }}
              >
                <div className={cn('text-sm opacity-70 mb-2', textColor[theme])}>
                  {metrics[idx].label}
                </div>
                <div className={cn('text-3xl font-bold mb-1', textColor[theme])}>
                  {metrics[idx].value}
                </div>
                <div className="text-sm text-green-500">{metrics[idx].change}</div>
              </div>
            );
          })}
        </div>

        <div
          className={cn('mt-8 border rounded-xl p-6', cardBg[theme])}
          style={{
            opacity: Math.max(0, (progress - 0.6) * 2),
            transform: `translateY(${Math.max(0, 1 - (progress - 0.6) * 2) * 20}px)`,
          }}
        >
          <h3 className={cn('text-xl font-semibold mb-4', textColor[theme])}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full',
                    theme === 'neon' ? 'bg-gradient-to-br from-pink-500 to-cyan-500' : 'bg-blue-500'
                  )}
                />
                <div className="flex-1">
                  <div className={cn('font-medium', textColor[theme])}>
                    New content published
                  </div>
                  <div className={cn('text-sm opacity-60', textColor[theme])}>
                    {i} hour{i > 1 ? 's' : ''} ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractionScene({ progress, isActive, theme }: SceneProps) {
  const dragProgress = Math.sin(progress * Math.PI);

  const bgColor = {
    light: 'bg-white',
    dark: 'bg-gray-900',
    neon: 'bg-black',
  };

  const textColor = {
    light: 'text-gray-900',
    dark: 'text-white',
    neon: 'text-cyan-400',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center p-8',
        'transition-opacity duration-500',
        bgColor[theme],
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="max-w-2xl w-full text-center">
        <h2 className={cn('text-3xl font-bold mb-8', textColor[theme])}>
          Intuitive Interactions
        </h2>

        <div className="relative h-64 flex items-center justify-center">
          <div
            className={cn(
              'w-32 h-32 rounded-2xl cursor-move shadow-2xl',
              theme === 'neon'
                ? 'bg-gradient-to-br from-pink-500 to-cyan-500 shadow-pink-500/50'
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            )}
            style={{
              transform: `translateX(${dragProgress * 100}px) rotate(${dragProgress * 15}deg) scale(${1 + Math.abs(dragProgress) * 0.1})`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white text-4xl">
              ↔
            </div>
          </div>
        </div>

        <p className={cn('mt-8 text-lg opacity-80', textColor[theme])}>
          Drag, drop, and interact with smooth animations
        </p>
      </div>
    </div>
  );
}

export function CompletionScene({ progress, isActive, theme }: SceneProps) {
  const scale = Math.min(progress * 1.2, 1);
  const particleProgress = progress;

  const bgColor = {
    light: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800',
    neon: 'bg-gradient-to-br from-black via-purple-900/20 to-black',
  };

  const textColor = {
    light: 'text-gray-900',
    dark: 'text-white',
    neon: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'transition-opacity duration-500',
        bgColor[theme],
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative text-center">
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = particleProgress * 200;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          return (
            <div
              key={i}
              className={cn(
                'absolute w-4 h-4 rounded-full',
                theme === 'neon' ? 'bg-pink-500' : 'bg-blue-500'
              )}
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${x}px, ${y}px) scale(${1 - particleProgress})`,
                opacity: 1 - particleProgress,
              }}
            />
          );
        })}

        <div style={{ transform: `scale(${scale})` }}>
          <div
            className={cn(
              'w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl',
              theme === 'neon'
                ? 'bg-gradient-to-br from-pink-500 to-cyan-500 shadow-2xl shadow-pink-500/50'
                : 'bg-gradient-to-br from-green-500 to-emerald-500'
            )}
          >
            ✓
          </div>

          <h2 className={cn('text-4xl font-bold mb-4', textColor[theme])}>
            Ready to Create
          </h2>
          <p className={cn('text-xl mb-8', theme === 'neon' ? 'text-cyan-300' : 'opacity-80')}>
            Your studio is set up and ready to go
          </p>

          <button
            className={cn(
              'px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300',
              theme === 'neon'
                ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
              'transform hover:scale-105'
            )}
            style={{ opacity: Math.max(0, (progress - 0.5) * 2) }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
