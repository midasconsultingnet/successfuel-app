import { browser } from '$app/environment';
import { HealthAPI } from '$lib/services/api/health';

// Service to handle health checks in SvelteKit load functions
export class HealthCheckService {
  // Server-side health check that properly uses the load function's fetch
  static async serverSideHealthCheck(
    fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
  ): Promise<{ isConnected: boolean; message?: string; error?: string }> {
    try {
      // On the server side, use the fetch provided by the load function
      const response = await HealthAPI.checkWithLoadFetch(fetch);
      
      return {
        isConnected: response.status === 'success',
        message: response.message
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }

  // Client-side health check
  static async clientSideHealthCheck(): Promise<{ isConnected: boolean; message?: string; error?: string }> {
    if (!browser) {
      // This should not be called on the server, but just in case
      throw new Error('Client-side health check called on server');
    }

    try {
      const response = await HealthAPI.check();
      
      return {
        isConnected: response.status === 'success',
        message: response.message
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }

  // Universal health check that works on both client and server
  static async universalHealthCheck(
    loadFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>
  ): Promise<{ isConnected: boolean; message?: string; error?: string }> {
    if (!browser && loadFetch) {
      // Server-side execution
      return this.serverSideHealthCheck(loadFetch);
    } else {
      // Client-side execution
      return this.clientSideHealthCheck();
    }
  }
}

export default HealthCheckService;