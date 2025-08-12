import { Experiment } from '@/types';

export interface SSEMessage {
  experiments: Experiment[];
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Set<(data: SSEMessage) => void> = new Set();

  connect(url: string, apiKey?: string) {
    this.disconnect();
    
    const fullUrl = new URL(`${url}/experiments/events`);
    if (apiKey) {
      fullUrl.searchParams.set('api_key', apiKey);
    }

    this.eventSource = new EventSource(fullUrl.toString());
    
    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        this.notifyListeners(data);
        this.reconnectAttempts = 0; // Reset on successful message
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onerror = () => {
      console.error('SSE connection error');
      this.handleReconnect(url, apiKey);
    };
  }

  private handleReconnect(url: string, apiKey?: string) {
    this.disconnect();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(url, apiKey);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(callback: (data: SSEMessage) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(data: SSEMessage) {
    this.listeners.forEach(callback => callback(data));
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const sseClient = new SSEClient();