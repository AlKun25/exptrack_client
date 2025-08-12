'use client';

import { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/auth-screen';
import { ServerConfigScreen } from '@/components/server-config-screen';
import { ExperimentDashboard } from '@/components/experiement-dashboard';
import { ServerConfig } from '@/types';
import { useServerConfig } from '@/hooks/useServerConfig';

type Screen = 'auth' | 'server-config' | 'dashboard';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const { loadConfig } = useServerConfig();

  useEffect(() => {
    // Check for saved configuration on mount
    const savedConfig = loadConfig();
    if (savedConfig) {
      setCurrentScreen('dashboard');
    }
  }, [loadConfig]);

  const handleAuthSuccess = () => {
    setCurrentScreen('server-config');
  };

  const handleServerConfigured = (config: ServerConfig) => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('auth');
  };

  return (
    <>
      {currentScreen === 'auth' && (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
      {currentScreen === 'server-config' && (
        <ServerConfigScreen 
          onConfigured={handleServerConfigured} 
          onBack={() => setCurrentScreen('auth')}
        />
      )}
      {currentScreen === 'dashboard' && (
        <ExperimentDashboard 
          serverConfig={loadConfig()!}
          onLogout={handleLogout}
          onServerConfig={() => setCurrentScreen('server-config')}
        />
      )}
    </>
  );
}