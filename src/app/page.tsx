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
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const { loadConfig, saveConfig } = useServerConfig();

  useEffect(() => {
    // Check for saved configuration on mount
    const savedConfig = loadConfig();
    if (savedConfig) {
      setServerConfig(savedConfig);
      setCurrentScreen('dashboard');
    }
  }, [loadConfig]);

  const handleAuthSuccess = () => {
    setCurrentScreen('server-config');
  };

  const handleServerConfigured = (config: ServerConfig) => {
    saveConfig(config);
    setServerConfig(config);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setServerConfig(null);
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
      {currentScreen === 'dashboard' && serverConfig && (
        <ExperimentDashboard 
          serverConfig={serverConfig}
          onLogout={handleLogout}
          onServerConfig={() => setCurrentScreen('server-config')}
        />
      )}
    </>
  );
}