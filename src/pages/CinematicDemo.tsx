import React, { useState } from 'react';
import { CinematicWalkthrough } from '../components/CinematicDemo/CinematicWalkthrough';
import { cinematicExportService } from '../services/export/CinematicExportService';
import { cn } from '../design-system/utils/cn';
import {
  Play,
  Download,
  FileText,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

type ThemeVariant = 'light' | 'dark' | 'neon';

export function CinematicDemoPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeVariant>('dark');
  const [isExporting, setIsExporting] = useState(false);

  const handleStartDemo = () => {
    setShowDemo(true);
  };

  const handleDemoComplete = () => {
    setShowDemo(false);
  };

  const handleExportManifest = async () => {
    setIsExporting(true);
    try {
      await cinematicExportService.downloadManifest();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocumentation = async () => {
    setIsExporting(true);
    try {
      await cinematicExportService.downloadAllDocumentation();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (showDemo) {
    return (
      <CinematicWalkthrough
        theme={selectedTheme}
        autoPlay
        showControls
        onComplete={handleDemoComplete}
        onClose={() => setShowDemo(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
              <Play className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Cinematic Demo Experience
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A production-ready demonstration of the SparkLabs Creator Platform featuring
            world-class animation, responsive design, and avatar-driven storytelling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Palette className="w-6 h-6 text-blue-500" />
              Theme Selection
            </h2>

            <div className="space-y-4">
              {[
                {
                  id: 'light' as ThemeVariant,
                  name: 'Minimalist Light',
                  description: 'Clean, professional design with light backgrounds',
                  gradient: 'from-blue-50 to-cyan-50',
                  textColor: 'text-gray-900',
                },
                {
                  id: 'dark' as ThemeVariant,
                  name: 'Cinematic Dark',
                  description: 'Dramatic, immersive experience with dark tones',
                  gradient: 'from-gray-900 to-gray-800',
                  textColor: 'text-white',
                },
                {
                  id: 'neon' as ThemeVariant,
                  name: 'Futuristic Neon',
                  description: 'Vibrant, energetic design with glowing effects',
                  gradient: 'from-black via-purple-900/20 to-black',
                  textColor: 'text-cyan-400',
                },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl transition-all duration-200',
                    'border-2 hover:shadow-lg',
                    selectedTheme === theme.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br',
                        theme.gradient
                      )}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{theme.name}</h3>
                      <p className="text-sm text-gray-400">{theme.description}</p>
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Features</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Multi-Platform Support</h3>
                  <p className="text-sm text-gray-400">
                    Optimized for desktop, tablet, and mobile devices with responsive layouts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Smooth Animations</h3>
                  <p className="text-sm text-gray-400">
                    60fps animations with custom easing functions and transitions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Avatar Storytelling</h3>
                  <p className="text-sm text-gray-400">
                    Intelligent avatar guide with contextual narration and gestures
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Theme Variants</h3>
                  <p className="text-sm text-gray-400">
                    Light, dark, and neon themes with consistent design language
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Viewport Previews</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Monitor, label: 'Desktop', ratio: '16:9', size: '1920×1080' },
              { icon: Tablet, label: 'Tablet', ratio: '4:3', size: '1024×768' },
              { icon: Smartphone, label: 'Mobile', ratio: '9:16', size: '1080×1920' },
            ].map((device) => (
              <div
                key={device.label}
                className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <device.icon className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold text-white mb-1">{device.label}</h3>
                <p className="text-sm text-gray-400 mb-1">Aspect Ratio: {device.ratio}</p>
                <p className="text-xs text-gray-500">{device.size}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleStartDemo}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            Start Cinematic Demo
          </button>

          <button
            onClick={handleExportManifest}
            disabled={isExporting}
            className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg border-2 border-gray-700 hover:border-gray-600 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-6 h-6" />
            Export Manifest
          </button>

          <button
            onClick={handleExportDocumentation}
            disabled={isExporting}
            className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg border-2 border-gray-700 hover:border-gray-600 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-6 h-6" />
            Export Documentation
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Production-ready demo with complete storyboard, component library, and video assets
          </p>
        </div>
      </div>
    </div>
  );
}
