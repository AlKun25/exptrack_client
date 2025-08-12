'use client';

import { useState, useCallback } from 'react';
import { ServerConfig } from '@/types';
import { apiClient } from '@/lib/api';

export function useExperimentLogs(config: ServerConfig | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (experimentId: string, maxLines: number = 100) => {
    if (!config) throw new Error('No server configuration');

    try {
      setIsLoading(true);
      setError(null);
      apiClient.setConfig(config);
      const response = await apiClient.getExperimentLogs(experimentId, maxLines);
      setLogs(response.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
  }, []);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    clearLogs,
  };
}