import { get } from 'svelte/store';
import { API } from '$lib/utils/constants';
import { connectivityStore } from '$lib/stores/connectivity';

export interface HealthCheckResponse {
  status: string;
  message?: string;
}

export interface ConnectivityStatus {
  isApiHealthy: boolean;
  isDbHealthy: boolean;
  lastChecked: Date | null;
  isChecking: boolean;
}

export class ConnectivityService {
  private static instance: ConnectivityService;
  private baseUrl: string;
  private checkInterval: number = 30000; // 30 seconds
  private checkTimeout: number = 10000; // 10 seconds
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    // Use the root URL from the app configuration
    this.baseUrl = API.ROOT_URL;
  }

  public static getInstance(): ConnectivityService {
    if (!ConnectivityService.instance) {
      ConnectivityService.instance = new ConnectivityService();
    }
    return ConnectivityService.instance;
  }

  /**
   * Perform a health check on the API
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      // Using fetch directly to avoid circular dependencies with auth
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.checkTimeout);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const data: HealthCheckResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('API is not healthy');
    }
  }

  /**
   * Perform a database connectivity check
   */
  async checkDbConnection(): Promise<HealthCheckResponse> {
    try {
      // Using fetch directly to avoid circular dependencies with auth
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.checkTimeout);

      const response = await fetch(`${this.baseUrl}/db-check`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`DB check failed with status: ${response.status}`);
      }

      const data: HealthCheckResponse = await response.json();
      return data;
    } catch (error) {
      console.error('DB check error:', error);
      throw new Error('Database connection is not healthy');
    }
  }

  /**
   * Perform both health checks and update store
   */
  async performCheck(): Promise<ConnectivityStatus> {
    const currentState = get(connectivityStore);
    
    // Update checking flag
    connectivityStore.update(state => ({
      ...state,
      isChecking: true
    }));

    try {
      // Perform both checks concurrently
      const [apiResult, dbResult] = await Promise.allSettled([
        this.checkHealth(),
        this.checkDbConnection()
      ]);

      const isApiHealthy = apiResult.status === 'fulfilled' && apiResult.value.status === 'healthy';
      const isDbHealthy = dbResult.status === 'fulfilled' && dbResult.value.status === 'success';

      const status: ConnectivityStatus = {
        isApiHealthy,
        isDbHealthy,
        lastChecked: new Date(),
        isChecking: false
      };

      // Update the store with the new status
      connectivityStore.set(status);

      return status;
    } catch (error) {
      console.error('Connectivity check error:', error);
      
      const status: ConnectivityStatus = {
        isApiHealthy: false,
        isDbHealthy: false,
        lastChecked: new Date(),
        isChecking: false
      };
      
      connectivityStore.set(status);
      return status;
    }
  }

  /**
   * Start periodic connectivity checks
   */
  startPeriodicChecks(): void {
    if (this.intervalId) {
      this.stopPeriodicChecks();
    }

    // Perform initial check
    this.performCheck();

    // Set up interval for periodic checks
    this.intervalId = setInterval(() => {
      this.performCheck();
    }, this.checkInterval);
  }

  /**
   * Stop periodic connectivity checks
   */
  stopPeriodicChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get current connectivity status from store
   */
  getCurrentStatus(): ConnectivityStatus {
    return get(connectivityStore);
  }
}