import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import type { Permission } from '$lib/types/auth';
import { SimpleAuthService, simpleAuthService } from '$lib/services/simplifiedAuth';
import { ConnectivityService } from '$lib/services/connectivity';

interface ProfileCache {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class EnhancedAuthService extends SimpleAuthService {
  private connectivityService: ConnectivityService;

  constructor() {
    super();
    this.connectivityService = ConnectivityService.getInstance();
  }

  // Check connectivity before performing an API operation
  async checkConnectivity(): Promise<boolean> {
    const status = this.connectivityService.getCurrentStatus();
    
    // If we haven't performed a check yet or we're checking, perform a check now
    if (!status.lastChecked || status.isChecking) {
      await this.connectivityService.performCheck();
      return true; // We'll let the calling function handle the actual status
    }

    // If API or DB is not healthy, return false
    return status.isApiHealthy && status.isDbHealthy;
  }

  // Override login to check connectivity first
  async login(credentials: any): Promise<void> {
    const isHealthy = await this.checkConnectivity();
    
    if (!isHealthy) {
      const status = this.connectivityService.getCurrentStatus();
      let errorMsg = 'Service unavailable. ';
      
      if (!status.isApiHealthy) errorMsg += 'API is down. ';
      if (!status.isDbHealthy) errorMsg += 'Database unavailable. ';
      
      auth.setError(errorMsg);
      throw new Error(errorMsg);
    }

    // If connectivity is healthy, proceed with the original login
    return super.login(credentials);
  }

  // Override getProfile to check connectivity first
  async getProfile(forceRefresh: boolean = false): Promise<void> {
    const isHealthy = await this.checkConnectivity();
    
    if (!isHealthy) {
      console.warn('Connectivity check failed, using cached profile if available');
      // If connectivity is down but we have cached data, return cached data
      if (this.hasValidCache() && !forceRefresh) {
        console.log('Using cached profile data due to connectivity issues');
        return super.getProfile(forceRefresh); // This will use the cache
      } else {
        const status = this.connectivityService.getCurrentStatus();
        let errorMsg = 'Service unavailable. ';
        
        if (!status.isApiHealthy) errorMsg += 'API is down. ';
        if (!status.isDbHealthy) errorMsg += 'Database unavailable. ';
        
        auth.setError(errorMsg);
        throw new Error(errorMsg);
      }
    }

    // If connectivity is healthy, proceed with the original getProfile
    return super.getProfile(forceRefresh);
  }

  // Check if we have a valid cache
  private hasValidCache(): boolean {
    if (!this['profileCache']) return false;
    const now = Date.now();
    return now - this['profileCache'].timestamp < this['profileCache'].ttl;
  }

  // Override refreshTokenIfNeeded to check connectivity
  async refreshTokenIfNeeded(): Promise<boolean> {
    // Check connectivity first
    const isHealthy = await this.checkConnectivity();
    
    if (!isHealthy) {
      console.warn('Connectivity issue detected, token may not be valid');
      return false; // Indicate that token might not be valid due to connectivity issues
    }

    // If connectivity is good, perform the original check
    return super.refreshTokenIfNeeded();
  }

  // Method to get current connectivity status
  getCurrentConnectivityStatus() {
    return this.connectivityService.getCurrentStatus();
  }
}

export const enhancedAuthService = new EnhancedAuthService();

// Export the original service as fallback for compatibility
export { simpleAuthService };