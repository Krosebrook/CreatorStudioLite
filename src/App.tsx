import React from 'react';
import { useState } from 'react';
import { cn } from './design-system/utils/cn';
import { LandingPage } from './components/LandingPage';
import { CreatorDashboard } from './components/Dashboard';
import { ContentStudio } from './components/ContentStudio';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'studio'>('landing');
  
  // For demo purposes, you can toggle between landing and dashboard
  // In production, this would be handled by authentication state
  
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
    </div>
  );
}

export default App;