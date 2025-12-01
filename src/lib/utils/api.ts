/**
 * Data Flow Pattern for SuccessFuel ERP
 * 
 * This file outlines the pattern for handling data in a cloud-first ERP system
 * with optional offline/local storage capabilities.
 */

import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

// Define a generic cache store
export interface CacheStore<T> {
  data: Writable<T | null>;
  loading: Writable<boolean>;
  error: Writable<string | null>;
  lastUpdated: Writable<Date | null>;
}

// Create a cache store factory
export function createCacheStore<T>(initialValue: T | null = null): CacheStore<T> {
  return {
    data: writable<T | null>(initialValue),
    loading: writable<boolean>(false),
    error: writable<string | null>(null),
    lastUpdated: writable<Date | null>(null)
  };
}

// Data synchronization strategy
export class DataSync {
  // Sync data from cloud to local store
  static async syncFromCloud<T>(
    apiCall: () => Promise<T>,
    cacheStore: CacheStore<T>,
    useCache: boolean = true
  ): Promise<T> {
    // Check if we should use cache and if data is recent
    if (useCache) {
      const unsubscribe = cacheStore.lastUpdated.subscribe(lastUpdated => {
        if (lastUpdated) {
          const now = new Date();
          // If data is less than 5 minutes old, use cache
          if (now.getTime() - lastUpdated.getTime() < 5 * 60 * 1000) {
            // Data is fresh, return cached data
            return;
          }
        }
      });
      unsubscribe();
    }
    
    // Set loading state
    cacheStore.loading.set(true);
    cacheStore.error.set(null);
    
    try {
      // Fetch from cloud API
      const data = await apiCall();
      
      // Update cache
      cacheStore.data.set(data);
      cacheStore.lastUpdated.set(new Date());
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      cacheStore.error.set(errorMessage);
      throw error;
    } finally {
      cacheStore.loading.set(false);
    }
  }
  
  // Sync data from local store to cloud
  static async syncToCloud<T>(
    data: T,
    apiCall: (data: T) => Promise<T>,
    cacheStore: CacheStore<T>
  ): Promise<T> {
    try {
      // Update cache optimistically
      cacheStore.data.set(data);
      cacheStore.loading.set(true);
      
      // Sync to cloud
      const result = await apiCall(data);
      
      // Update cache with server response
      cacheStore.data.set(result);
      cacheStore.lastUpdated.set(new Date());
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      cacheStore.error.set(errorMessage);
      // Revert to previous data if sync fails
      // Note: In a real implementation, you'd store the previous state
      throw error;
    } finally {
      cacheStore.loading.set(false);
    }
  }
}