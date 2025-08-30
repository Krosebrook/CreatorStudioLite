import React from 'react';
import { useState, useEffect } from 'react';
import { cn } from './design-system/utils/cn';
import { LandingPage } from './components/LandingPage';
import { CreatorDashboard } from './components/Dashboard';
import { ContentStudio } from './components/ContentStudio';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'studio'>('landing');
  
  // Update view based on authentication state
  useEffect(() => {
    if (user && currentView === 'landing') {
      setCurrentView('dashboard');
    } else if (!user && currentView !== 'landing') {
      setCurrentView('landing');
    }
  }, [user, currentView]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-neutral-600">Loading FlashFusion...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {currentView === 'landing' ? (
        <LandingPage />
      ) : currentView === 'dashboard' ? (
        <CreatorDashboard />
      ) : (
        <ContentStudio />
      )}
      
      {/* Demo Toggle Button - Remove in production */}
      {user && (
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-1">
          <button
            onClick={() => setCurrentView('landing')}
            className={cn(
              'px-3 py-1 rounded text-xs transition-colors',
              currentView === 'landing' ? 'bg-primary-500 text-white' : 'bg-black text-white hover:bg-neutral-800'
            )}
          >
            Landing
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={cn(
              'px-3 py-1 rounded text-xs transition-colors',
              currentView === 'dashboard' ? 'bg-primary-500 text-white' : 'bg-black text-white hover:bg-neutral-800'
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('studio')}
            className={cn(
              'px-3 py-1 rounded text-xs transition-colors',
              currentView === 'studio' ? 'bg-primary-500 text-white' : 'bg-black text-white hover:bg-neutral-800'
            )}
          >
            Studio
          </button>
        </div>
      )}
    </div>
  );
}

export default App;