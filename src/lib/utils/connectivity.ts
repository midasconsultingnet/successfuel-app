import { get } from 'svelte/store';
import { connection } from '$lib/stores/connection';
import { EnhancedConnectivityManager } from '$lib/services/connectivity';
import { HealthAPI } from '$lib/services/api/health';

// Enhanced utility functions for connectivity-aware operations
export class ConnectivityUtils {
  private static connectivityManager: EnhancedConnectivityManager;

  static initialize(options?: Parameters<typeof EnhancedConnectivityManager.getInstance>[0]): void {
    this.connectivityManager = EnhancedConnectivityManager.getInstance(options);
    this.connectivityManager.initialize();
  }

  // Check if the app is currently connected to the API
  static isConnected(): boolean {
    const status = get(connection);
    return status.isConnected;
  }

  // Wait for connection to be established (with timeout)
  static async waitForConnection(timeoutMs: number = 10000): Promise<boolean> {
    if (!this.connectivityManager) {
      this.initialize();
    }
    return await this.connectivityManager.waitForConnection(timeoutMs);
  }

  // Execute an API call with connectivity check
  static async executeWithConnectivityCheck<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    if (!this.connectivityManager) {
      this.initialize();
    }
    
    const result = await this.connectivityManager.executeWithConnectivity(
      apiCall,
      { maxRetries }
    );

    if (!result.success) {
      throw new Error(result.error || 'Request failed');
    }

    return result.data as T;
  }

  // Handle user action when offline - immediately retry
  static async handleUserAction(): Promise<boolean> {
    if (!this.connectivityManager) {
      this.initialize();
    }
    return await this.connectivityManager.handleUserAction();
  }

  // Refresh connection status
  static async refreshConnection(): Promise<void> {
    if (!this.connectivityManager) {
      this.initialize();
    }
    await this.connectivityManager.checkConnection();
  }

  // Get current connection status
  static getCurrentStatus() {
    if (!this.connectivityManager) {
      this.initialize();
    }
    return this.connectivityManager.getCurrentStatus();
  }

  // Register notification callback for connection status changes
  static onStatusChange(callback: (status: any) => void): void {
    if (!this.connectivityManager) {
      this.initialize();
    }
    this.connectivityManager.onStatusChange(callback);
  }

  // Clear notification callback
  static clearStatusChangeCallback(): void {
    if (!this.connectivityManager) {
      this.initialize();
    }
    this.connectivityManager.clearStatusChangeCallback();
  }
}