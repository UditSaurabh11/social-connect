import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ContentCreator } from './components/ContentCreator';
import { PlatformManager } from './components/PlatformManager';
import { Analytics } from './components/Analytics';
import { AuthCallback } from './components/AuthCallback';

type View = 'dashboard' | 'create' | 'platforms' | 'analytics' | 'auth-callback';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Check if current URL is an auth callback
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/auth/') && path.includes('/callback')) {
      setCurrentView('auth-callback');
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'create':
        return <ContentCreator onBack={() => setCurrentView('dashboard')} />;
      case 'platforms':
        return <PlatformManager onBack={() => setCurrentView('dashboard')} />;
      case 'analytics':
        return <Analytics onBack={() => setCurrentView('dashboard')} />;
      case 'auth-callback':
        return <AuthCallback />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {currentView !== 'auth-callback' && (
        <Header currentView={currentView} onViewChange={setCurrentView} />
      )}
      <main className="container mx-auto px-4 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;