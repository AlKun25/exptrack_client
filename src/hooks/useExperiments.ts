'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Experiment, ServerConfig } from '@/types';
import { apiClient } from '@/lib/api';
import { sseClient } from '@/lib/sse';

export function useExperiments(config: ServerConfig | null) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef(config);

  // Update ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const fetchExperiments = useCallback(async () => {
    if (!configRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      apiClient.setConfig(configRef.current);
      const response = await apiClient.getExperiments();
      setExperiments(response.experiments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch experiments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExperiment = useCallback(async (id: string) => {
    if (!configRef.current) throw new Error('No server configuration');

    try {
      apiClient.setConfig(configRef.current);
      await apiClient.deleteExperiment(id);
      await fetchExperiments();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete experiment');
    }
  }, [fetchExperiments]);

  // Set up SSE connection
  useEffect(() => {
    if (!config) return;

    const unsubscribe = sseClient.subscribe((data) => {
      setExperiments(data.experiments);
    });

    sseClient.connect(config.url, config.apiKey);

    return () => {
      unsubscribe();
      sseClient.disconnect();
    };
  }, [config]);

  // Initial fetch
  useEffect(() => {
    if (config) {
      fetchExperiments();
    }
  }, [config, fetchExperiments]);

  return {
    experiments,
    isLoading,
    error,
    fetchExperiments,
    deleteExperiment,
  };
}