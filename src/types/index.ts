export interface Experiment {
    id: string;
    name: string;
    log_file: string;
    status: 'running' | 'completed' | 'failed' | 'unknown';
    pid: number | null;
    created_at: string;
    updated_at: string;
    size: number;
    lines: number;
  }
  
  export interface ServerConfig {
    url: string;
    apiKey?: string;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface ExperimentsListResponse {
    experiments: Experiment[];
  }
  
  export interface ExperimentLogsResponse {
    logs: string[];
  }
  
  export interface HealthCheckResponse {
    message: string;
    version: string;
    timestamp: string;
  }
  
  export interface ServerConfigResponse {
    log_directory: string;
    update_interval: number;
    log_monitor_scan_interval: number;
    api_key_required: boolean;
    cors_origins: string[];
  }