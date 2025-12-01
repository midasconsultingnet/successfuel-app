import { connection, type ConnectionStatus } from '$lib/stores/connection';
import { HealthAPI } from '$lib/services/api/health';
import { get } from 'svelte/store';

export interface ConnectivityConfig {
  checkInterval: number; // Interval for periodic checks in ms (default 10s)
  retryBaseDelay: number; // Base delay for retries in ms (default 1s)
  maxRetryDelay: number; // Maximum delay for retries in ms (default 30s)
  requestTimeout: number; // Timeout for requests in ms (default 10s)
}

export interface ConnectivityResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class EnhancedConnectivityManager {
  private static instance: EnhancedConnectivityManager;
  private config: ConnectivityConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private statusChangeCallback: ((status: ConnectionStatus) => void) | null = null;

  // Singleton pattern with optional configuration
  static getInstance(config?: Partial<ConnectivityConfig>): EnhancedConnectivityManager {
    if (typeof window === 'undefined') {
      // On server, return a minimal instance that doesn't perform any checks
      console.warn('Creating minimal connectivity manager instance on server');
      return new EnhancedConnectivityManager(config, true);
    }

    if (!EnhancedConnectivityManager.instance) {
      EnhancedConnectivityManager.instance = new EnhancedConnectivityManager(config);
    }
    return EnhancedConnectivityManager.instance;
  }

  private constructor(config?: Partial<ConnectivityConfig>, isServer = false) {
    if (isServer) {
      // Minimal configuration for server - no actual checks
      this.config = { checkInterval: 0, retryBaseDelay: 1000, maxRetryDelay: 30000, requestTimeout: 10000 };
      return;
    }

    this.config = {
      checkInterval: 10000, // 10 seconds
      retryBaseDelay: 1000, // 1 second
      maxRetryDelay: 30000, // 30 seconds
      requestTimeout: 10000, // 10 seconds
      ...config
    };
  }

  // Initialize the connectivity manager
  initialize(): void {
    if (typeof window === 'undefined') {
      // Don't initialize on server
      console.warn('Connectivity manager initialization skipped on server');
      this.isInitialized = true;
      return;
    }

    if (!this.isInitialized) {
      // Set up status change listener
      connection.subscribe((status) => {
        if (this.statusChangeCallback) {
          this.statusChangeCallback(status);
        }
      });

      this.startPeriodicChecks();
      this.isInitialized = true;
    }
  }

  // Start periodic connectivity checks (client-side only)
  startPeriodicChecks(): () => void {
    if (typeof window === 'undefined' || this.config.checkInterval <= 0) {
      // Don't run periodic checks on the server or if disabled
      console.warn('Periodic connectivity checks skipped on server or if disabled');
      return () => {};
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Set up periodic checks (client-side only)
    // Avoid initial check during setup to prevent SvelteKit warnings
    this.intervalId = setInterval(() => {
      connection.checkConnection();
    }, this.config.checkInterval);

    // Return cleanup function
    return () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  // Get the current connection status
  getCurrentStatus(): ConnectionStatus {
    return get(connection);
  }

  // Get current status as a promise
  getCurrentStatusPromise(): Promise<ConnectionStatus> {
    return new Promise((resolve) => {
      const unsubscribe = connection.subscribe((status) => {
        unsubscribe();
        resolve(status);
      });
    });
  }

  // Perform an immediate connection check with retry logic
  async checkConnectionWithRetry(maxRetries: number = 3): Promise<ConnectionStatus> {
    let attempt = 0;
    let lastStatus: ConnectionStatus | null = null;

    while (attempt <= maxRetries) {
      await connection.checkConnection();

      lastStatus = await this.getCurrentStatusPromise();

      if (lastStatus.isConnected) {
        return lastStatus;
      }

      if (attempt < maxRetries) {
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.retryBaseDelay * Math.pow(2, attempt),
          this.config.maxRetryDelay
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }

      attempt++;
    }

    return lastStatus!;
  }

  // Check if the connection is stable
  isConnectionStable(): boolean {
    const status = this.getCurrentStatus();
    return status.connectionStability === 'stable';
  }

  // Execute API call with connectivity handling
  async executeWithConnectivity<T>(
    apiCall: () => Promise<T>,
    options: { maxRetries?: number } = {}
  ): Promise<ConnectivityResult<T>> {
    const { maxRetries = 3 } = options;

    // First, check if we're connected
    const status = this.getCurrentStatus();

    if (!status.isConnected) {
      // Attempt to reconnect immediately if not connected
      await connection.immediateRetry();

      // Wait a bit for the connection to be re-established
      const newStatus = await this.waitForConnection(5000);
      if (!newStatus) {
        return {
          success: false,
          error: 'No internet connection available'
        };
      }
    }

    // Execute the API call with retry logic
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await apiCall();
        return {
          success: true,
          data: result
        };
      } catch (error) {
        lastError = error;

        // Determine if this is a network error or application error
        const isNetworkError = this.isNetworkError(error);

        if (isNetworkError) {
          // If it's a network error, we might want to retry
          if (attempt === maxRetries - 1) {
            // Last attempt, return the error
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Request failed'
            };
          }

          // Wait before retrying with exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // If it's an application error, don't retry
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Application error'
          };
        }
      }
    }

    // This should not be reached, but just in case
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 'Request failed'
    };
  }

  // Handle user-initiated action (immediate retry)
  async handleUserAction(): Promise<boolean> {
    // If we're not connected, attempt immediate reconnection
    const status = this.getCurrentStatus();
    if (!status.isConnected) {
      await connection.forceRetry();

      // Wait for connection to be established
      return await this.waitForConnection(5000);
    }

    return true;
  }

  // Wait for connection to be established
  waitForConnection(timeoutMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      let unsubscribe: () => void;

      const subscription = connection.subscribe((status) => {
        if (status.isConnected) {
          if (unsubscribe) unsubscribe();
          resolve(true);
        } else if (Date.now() - startTime > timeoutMs) {
          // Timeout reached
          if (unsubscribe) unsubscribe();
          resolve(false);
        }
        // Otherwise, continue waiting
      });

      // Store unsubscribe function after the subscription is created
      unsubscribe = subscription;
    });
  }

  // Determine if an error is a network error
  private isNetworkError(error: any): boolean {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    if (error instanceof Error) {
      // Common network error indicators
      const networkErrorPatterns = [
        'Failed to fetch',
        'NetworkError',
        'Network Error',
        'TypeError: Failed to fetch',
        'Load failed'
      ];

      return networkErrorPatterns.some(pattern =>
        error.message.includes(pattern)
      );
    }

    return false;
  }

  // Register notification callback for connection status changes
  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusChangeCallback = callback;
  }

  // Clear notification callback
  clearStatusChangeCallback(): void {
    this.statusChangeCallback = null;
  }

  // Destroy the connectivity manager
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.statusChangeCallback = null;
    this.isInitialized = false;
  }
}