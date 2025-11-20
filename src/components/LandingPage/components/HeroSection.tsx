import React from 'react';
import { Button } from '../../../design-system/components/Button';
import { Sparkles, Play } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onWatchDemo }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-success-50" />

      <div className="relative max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>The All-in-One Creator Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
          Create, Publish, and
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-success-600">
            Monetize Content
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto">
          SparkLabs is the complete platform for content creators. AI-powered tools,
          cross-platform publishing, real-time analytics, and revenue optimization—all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            leftIcon={<Sparkles className="w-5 h-5" />}
            className="min-w-[200px]"
          >
            Start Free Trial
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onWatchDemo}
            leftIcon={<Play className="w-5 h-5" />}
            className="min-w-[200px]"
          >
            Watch Demo
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-neutral-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
