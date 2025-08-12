import { Experiment } from '@/types';

export interface SSEMessage {
  experiments: Experiment[];
}

export type SSEConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Set<(data: SSEMessage) => void> = new Set();
  private statusListeners: Set<(status: SSEConnectionStatus) => void> = new Set();
  private status: SSEConnectionStatus = 'disconnected';

  connect(url: string, apiKey?: string) {
    this.disconnect();
    this.setStatus('connecting');
    
    console.log('Attempting SSE connection to:', `${url}/experiments/events`);
    
    // Test SSE endpoint availability first
    console.log('Testing SSE endpoint availability...');
    this.testSSEEndpoint(url, apiKey).then((available) => {
      if (!available) {
        console.warn('SSE endpoint not available, falling back to polling');
        this.setStatus('error');
        return;
      }
      
      this.establishConnection(url, apiKey);
    }).catch((error) => {
      console.error('Failed to test SSE endpoint:', error);
      this.setStatus('error');
    });
  }

  private async testSSEEndpoint(url: string, apiKey?: string): Promise<boolean> {
    try {
      const testUrl = new URL(`${url}/experiments/events`);
      if (apiKey) {
        testUrl.searchParams.set('api_key', apiKey);
      }
      // Add ngrok bypass parameter
      testUrl.searchParams.set('ngrok-skip-browser-warning', 'true');
      
      const response = await fetch(testUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
      
      console.log('SSE endpoint test response:', response);
      
      const contentType = response.headers.get('Content-Type');
      return response.ok && (contentType?.includes('text/event-stream') ?? false);
    } catch (error) {
      console.error('SSE endpoint test failed:', error);
      return false;
    }
  }

  private establishConnection(url: string, apiKey?: string) {
    const fullUrl = new URL(`${url}/experiments/events`);
    if (apiKey) {
      fullUrl.searchParams.set('api_key', apiKey);
    }
    // Add ngrok bypass parameter since EventSource doesn't support custom headers
    fullUrl.searchParams.set('ngrok-skip-browser-warning', 'true');

    this.eventSource = new EventSource(fullUrl.toString());
    
    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        this.notifyListeners(data);
        this.reconnectAttempts = 0; // Reset on successful message
        this.setStatus('connected');
      } catch (error) {
        console.error('Error parsing SSE message:', error);
        this.setStatus('error');
      }
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.reconnectAttempts = 0;
      this.setStatus('connected');
    };

    this.eventSource.onerror = (event) => {
      console.error('SSE connection error occurred:', {
        readyState: this.eventSource?.readyState,
        url: this.eventSource?.url,
        event
      });
      
      if (this.eventSource) {
        console.log('EventSource readyState:', 
          this.eventSource.readyState === 0 ? 'CONNECTING' :
          this.eventSource.readyState === 1 ? 'OPEN' :
          this.eventSource.readyState === 2 ? 'CLOSED' : 'UNKNOWN'
        );
      }
      
      this.setStatus('error');
      this.handleReconnect(url, apiKey);
    };
  }

  private handleReconnect(url: string, apiKey?: string) {
    this.disconnect();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`SSE reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      console.log('Previous connection failed for URL:', url);
      
      setTimeout(() => {
        this.connect(url, apiKey);
      }, delay);
    } else {
      console.error('Max SSE reconnection attempts reached');
      this.setStatus('error');
    }
  }

  subscribe(callback: (data: SSEMessage) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  subscribeToStatus(callback: (status: SSEConnectionStatus) => void) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  getStatus(): SSEConnectionStatus {
    return this.status;
  }

  private setStatus(status: SSEConnectionStatus) {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach(callback => callback(status));
    }
  }

  private notifyListeners(data: SSEMessage) {
    this.listeners.forEach(callback => callback(data));
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.setStatus('disconnected');
  }
}

export const sseClient = new SSEClient();