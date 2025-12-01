import { writable, get } from 'svelte/store';
import { HealthAPI } from '$lib/services/api/health';

export interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  error: string | null;
  latency: number | null;
  retryCount: number;
  nextRetryTime: number | null;
  isRetrying: boolean;
  connectionStability: 'stable' | 'unstable' | 'offline';
}

const DEFAULT_STATUS: ConnectionStatus = {
  isConnected: false,
  isChecking: false,
  lastCheck: null,
  error: null,
  latency: null,
  retryCount: 0,
  nextRetryTime: null,
  isRetrying: false,
  connectionStability: 'offline'
};

function createConnectionStore() {
  const { subscribe, set, update } = writable<ConnectionStatus>(DEFAULT_STATUS);

  return {
    subscribe,

    // Check connection to the API (client-side)
    async checkConnection(): Promise<void> {
      update((status) => ({
        ...status,
        isChecking: true,
        error: null
      }));

      const startTime = Date.now();

      try {
        const response = await HealthAPI.check();
        const latency = Date.now() - startTime;

        update((status) => ({
          ...status,
          isConnected: response.status === 'success',
          isChecking: false,
          lastCheck: new Date(),
          error: response.status !== 'success' ? response.message : null,
          latency,
          retryCount: 0, // Reset retry count on successful connection
          isRetrying: false,
          connectionStability: response.status === 'success'
            ? (latency < 200 ? 'stable' : 'unstable')
            : 'offline'
        }));
      } catch (error) {
        const latency = Date.now() - startTime;

        update((status) => ({
          ...status,
          isConnected: false,
          isChecking: false,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Connection failed',
          latency,
          retryCount: status.retryCount + 1,
          isRetrying: false,
          connectionStability: 'offline'
        }));
      }
    },

    // Server-side check connection using the provided fetch
    async checkConnectionWithLoadFetch(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>): Promise<void> {
      update((status) => ({
        ...status,
        isChecking: true,
        error: null
      }));

      const startTime = Date.now();

      try {
        const response = await HealthAPI.checkWithLoadFetch(fetch);
        const latency = Date.now() - startTime;

        update((status) => ({
          ...status,
          isConnected: response.status === 'success',
          isChecking: false,
          lastCheck: new Date(),
          error: response.status !== 'success' ? response.message : null,
          latency,
          retryCount: 0, // Reset retry count on successful connection
          isRetrying: false,
          connectionStability: response.status === 'success'
            ? (latency < 200 ? 'stable' : 'unstable')
            : 'offline'
        }));
      } catch (error) {
        const latency = Date.now() - startTime;

        update((status) => ({
          ...status,
          isConnected: false,
          isChecking: false,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Connection failed',
          latency,
          retryCount: status.retryCount + 1,
          isRetrying: false,
          connectionStability: 'offline'
        }));
      }
    },

    // Immediate retry connection with exponential backoff
    async immediateRetry(): Promise<void> {
      const currentStatus = get(this);
      
      // Don't retry if already checking or retrying
      if (currentStatus.isChecking || currentStatus.isRetrying) {
        return;
      }

      update((status) => ({
        ...status,
        isRetrying: true,
        error: null
      }));

      // Calculate delay based on retry count (exponential backoff)
      const baseDelay = 1000; // 1 second
      const maxDelay = 30000; // 30 seconds max
      const delay = Math.min(baseDelay * Math.pow(2, currentStatus.retryCount), maxDelay);

      // Wait for the calculated delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Perform the connection check
      await this.checkConnection();
    },

    // Start periodic connectivity checks with faster interval (client-side only)
    startPeriodicChecks(intervalMs: number = 10000): () => void {
      if (typeof window === 'undefined') {
        // Don't run periodic checks on the server
        console.warn('Periodic connectivity checks skipped on server');
        return () => {};
      }

      const intervalId = setInterval(() => {
        this.checkConnection();
      }, intervalMs);

      return () => clearInterval(intervalId);
    },

    // Reset connection status completely
    reset(): void {
      set(DEFAULT_STATUS);
    },

    // Set manual status (useful for testing)
    setManualStatus(connected: boolean): void {
      update((status) => ({
        ...status,
        isConnected: connected,
        lastCheck: new Date(),
        connectionStability: connected ? 'stable' : 'offline',
        retryCount: 0,
        isRetrying: false,
        nextRetryTime: null
      }));
    },

    // Force connection retry regardless of current state
    async forceRetry(): Promise<void> {
      update((status) => ({
        ...status,
        isChecking: true,
        isRetrying: true,
        error: null
      }));

      await this.checkConnection();
    }
  };
}

export const connection = createConnectionStore();