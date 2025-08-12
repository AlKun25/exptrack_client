'use client';

import { useState, useCallback } from 'react';
import { ServerConfig, ServerConfigResponse } from '@/types';
import { apiClient } from '@/lib/api';

export function useServerConfig() {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [serverConfig, setServerConfig] = useState<ServerConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async (url: string, apiKey?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const testConfig: ServerConfig = {
        url,
        apiKey: apiKey || undefined,
      };
      
      apiClient.setConfig(testConfig);
      const healthResponse = await apiClient.healthCheck();
      const configResponse = await apiClient.getConfig();
      
      setServerConfig(configResponse);
      return { success: true, message: `Connection successful! Server version: ${healthResponse.version}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback((newConfig: ServerConfig) => {
    setConfig(newConfig);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('serverConfig', JSON.stringify(newConfig));
    }
  }, []);

  const loadConfig = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedConfig = localStorage.getItem('serverConfig');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
          return JSON.parse(savedConfig);
        }
      } catch (err) {
        console.error('Failed to load saved config:', err);
      }
    }
    return null;
  }, []);

  const clearConfig = useCallback(() => {
    setConfig(null);
    setServerConfig(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('serverConfig');
    }
  }, []);

  return {
    config,
    serverConfig,
    isLoading,
    error,
    testConnection,
    saveConfig,
    loadConfig,
    clearConfig,
  };
}