import React, { useState } from 'react';
import { AuthModal } from '../Auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  NavigationHeader,
  HeroSection,
  FeaturesSection,
  TestimonialsSection,
  PricingSection,
  Footer
} from './components';
import { features } from './data/features';
import { testimonials } from './data/testimonials';
import { pricingTiers } from './data/pricing';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setIsSignupOpen(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsSignupOpen(true);
  };

  const handleSelectPlan = (tierName: string) => {
    console.log('Selected plan:', tierName);
    handleGetStarted();
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
        isAuthenticated={!!user}
      />

      <HeroSection
        onGetStarted={handleGetStarted}
        onWatchDemo={() => console.log('Watch demo clicked')}
      />

      <div id="features">
        <FeaturesSection features={features} />
      </div>

      <div id="testimonials">
        <TestimonialsSection testimonials={testimonials} />
      </div>

      <div id="pricing">
        <PricingSection
          pricingTiers={pricingTiers}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      <Footer />

      <AuthModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default LandingPage;
