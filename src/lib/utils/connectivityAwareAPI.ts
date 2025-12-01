import { connection } from '$lib/stores/connection';
import { get } from 'svelte/store';

export interface ConnectivityResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isNetworkError: boolean;
}

export class ConnectivityAwareAPI {
  // Make an API call with automatic connectivity handling
  static async makeRequest<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<ConnectivityResponse<T>> {
    // First, check if we're connected
    const status = get(connection);
    
    if (!status.isConnected) {
      // Attempt to reconnect immediately if not connected
      await connection.immediateRetry();
      
      // Wait a bit for the connection to be re-established
      const newStatus = await this.waitForConnection(5000);
      if (!newStatus) {
        return {
          success: false,
          error: 'No internet connection available',
          isNetworkError: true
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
          data: result,
          isNetworkError: false
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
              error: error instanceof Error ? error.message : 'Request failed',
              isNetworkError: true
            };
          }
          
          // Wait before retrying with exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // If it's an application error, don't retry
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Application error',
            isNetworkError: false
          };
        }
      }
    }
    
    // This should not be reached, but just in case
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 'Request failed',
      isNetworkError: this.isNetworkError(lastError)
    };
  }

  // Handle user-initiated actions that should trigger immediate reconnection
  static async handleUserAction<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<ConnectivityResponse<T>> {
    // If we're not connected, attempt immediate reconnection
    const status = get(connection);
    if (!status.isConnected) {
      await connection.forceRetry();
    }
    
    // Wait for connection to be established
    const connected = await this.waitForConnection(5000);
    if (!connected) {
      return {
        success: false,
        error: 'Cannot perform action: No internet connection',
        isNetworkError: true
      };
    }
    
    // Make the API request
    return this.makeRequest(apiCall, maxRetries);
  }

  // Wait for connection to be established
  private static async waitForConnection(timeoutMs: number = 5000): Promise<boolean> {
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
  private static isNetworkError(error: any): boolean {
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
}