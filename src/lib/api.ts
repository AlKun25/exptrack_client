import axios, { AxiosInstance, AxiosError } from 'axios';
import { Experiment, ServerConfig, ExperimentsListResponse, ExperimentLogsResponse, HealthCheckResponse, ServerConfigResponse } from '@/types';

class ApiClient {
  private instance: AxiosInstance;
  private config: ServerConfig | null = null;

  constructor() {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (this.config?.apiKey) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          console.error('Unauthorized access');
        }
        return Promise.reject(error);
      }
    );
  }

  setConfig(config: ServerConfig) {
    this.config = config;
    this.instance.defaults.baseURL = config.url;
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await this.instance.get<HealthCheckResponse>('/');
    return response.data;
  }

  async getExperiments(): Promise<ExperimentsListResponse> {
    const response = await this.instance.get<ExperimentsListResponse>('/experiments');
    return response.data;
  }

  async getExperiment(id: string): Promise<Experiment> {
    const response = await this.instance.get<Experiment>(`/experiments/${id}`);
    return response.data;
  }

  async getExperimentLogs(id: string, maxLines: number = 100): Promise<ExperimentLogsResponse> {
    const response = await this.instance.get<ExperimentLogsResponse>(`/experiments/${id}/logs`, {
      params: { max_lines: maxLines },
    });
    return response.data;
  }

  async deleteExperiment(id: string): Promise<void> {
    await this.instance.delete(`/experiments/${id}`);
  }

  async getConfig(): Promise<ServerConfigResponse> {
    const response = await this.instance.get<ServerConfigResponse>('/config');
    return response.data;
  }
}

export const apiClient = new ApiClient();