import React, { useState, useEffect } from 'react';
import { Button } from '../../../design-system/components/Button';
import { Sparkles, Menu, X } from 'lucide-react';
import { cn } from '../../../design-system/utils/cn';

interface NavigationHeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  onSignIn,
  onGetStarted,
  isAuthenticated
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">SparkLabs</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated && (
              <>
                <Button variant="ghost" onClick={onSignIn}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={onGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-neutral-900" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-900" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-neutral-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {!isAuthenticated && (
              <div className="space-y-2 pt-4 border-t border-neutral-200">
                <Button variant="ghost" fullWidth onClick={onSignIn}>
                  Sign In
                </Button>
                <Button variant="primary" fullWidth onClick={onGetStarted}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
