import React from 'react';
import { useState, useEffect } from 'react';
import { cn } from './design-system/utils/cn';
import { LandingPage } from './components/LandingPage';
import { CreatorDashboard } from './components/Dashboard';
import { ContentStudio } from './components/ContentStudio';
import { CinematicWalkthrough } from './components/CinematicDemo';
import { useAuth } from './contexts/AuthContext';
import { Loader2, Play } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'studio' | 'demo'>('landing');
  const [showDemo, setShowDemo] = useState(false);
  
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
            <p className="text-neutral-600">Loading Amplify...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {showDemo ? (
        <CinematicWalkthrough
          onComplete={() => setShowDemo(false)}
          onClose={() => setShowDemo(false)}
          autoPlay={true}
          showControls={true}
          style="cinematic"
        />
      ) : currentView === 'landing' ? (
        <LandingPage />
      ) : currentView === 'dashboard' ? (
        <CreatorDashboard />
      ) : (
        <ContentStudio />
      )}
      
      {/* Demo Toggle Button - Remove in production */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-1">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className={cn(
            'px-3 py-1 rounded text-xs transition-colors',
            showDemo ? 'bg-primary-500 text-white' : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg'
          )}
          title="Watch Cinematic Demo"
        >
          <div className="flex items-center space-x-1">
            <Play className="w-3 h-3" />
            <span>Demo</span>
          </div>
        </button>
        {user && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;