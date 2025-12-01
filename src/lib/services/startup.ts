import { connection } from '$lib/stores/connection';
import { getAuthService } from '$lib/services/auth'; // Changed import
import { simpleTauriAuthService } from '$lib/services/simplifiedTauriAuth';

// Service to handle app initialization and connectivity checks
export class AppStartupService {
  // Check connectivity on app start using the fetch from load function (server-side)
  static async initializeAppWithLoadFetch(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>): Promise<boolean> {
    // First, check if we can connect to the API using the provided fetch
    await connection.checkConnectionWithLoadFetch(fetch);

    // Wait for the connection check to complete
    return new Promise((resolve) => {
      let unsubscribe: () => void;

      const subscription = connection.subscribe((status) => {
        if (!status.isChecking) {
          if (unsubscribe) unsubscribe();
          resolve(status.isConnected);
        }
      });

      // Store unsubscribe function after the subscription is created
      unsubscribe = subscription;
    });
  }

  // Client-side initialization (for when not in a load function context)
  static async initializeApp(): Promise<boolean> {
    // Initialize auth service first
    const authService = await getAuthService();
    await authService.initialize();

    // First, check if we can connect to the API
    await connection.checkConnection();

    // Wait for the connection check to complete
    return new Promise((resolve) => {
      let unsubscribe: () => void;

      const subscription = connection.subscribe((status) => {
        if (!status.isChecking) {
          if (unsubscribe) unsubscribe();
          resolve(status.isConnected);
        }
      });

      // Store unsubscribe function after the subscription is created
      unsubscribe = subscription;
    });
  }

  // Initialize connectivity manager - simplified version
  static initializeConnectivity(): void {
    // In our simplified version, we don't need a complex connectivity manager
    // We just ensure the auth store is initialized
  }

  // Periodically check connectivity (for ongoing monitoring)
  static startPeriodicChecks(intervalMs: number = 10000): () => void {
    if (typeof window === 'undefined') {
      // Don't run periodic checks on the server
      console.warn('Periodic connectivity checks skipped on server');
      return () => {};
    }

    // In our simplified version, we just return the function from connection store
    return connection.startPeriodicChecks(intervalMs);
  }

  // Get current connection status
  static getCurrentStatus() {
    return connection.getStatus();
  }

  // Cleanup resources on app shutdown
  static cleanup(): void {
    // In our simplified version, we just stop periodic checks
    connection.stopPeriodicChecks();
  }
}

// Initialize the periodic checks when the app starts
let stopPeriodicChecks: (() => void) | null = null;

export function setupConnectivityMonitoring() {
    if (!stopPeriodicChecks) {
        stopPeriodicChecks = AppStartupService.startPeriodicChecks();
    }

    // Return cleanup function
    return () => {
        if (stopPeriodicChecks) {
            stopPeriodicChecks();
            stopPeriodicChecks = null;
        }
    };
}