/**
 * SvelteKit Connectivity Implementation Guide
 * 
 * This file documents best practices for implementing connectivity checks in SvelteKit applications.
 */

// 1. PROPER FETCH USAGE IN SVELTEKIT

/*
 * ❌ WRONG - Using global fetch in load functions
 * const response = await fetch('https://api.example.com/health');
 */

/*
 * ✅ CORRECT - Using the fetch provided by load function
 * export const load: PageServerLoad = async ({ fetch }) => {
 *   const response = await fetch('https://api.example.com/health');
 *   return response.json();
 * };
 */

// 2. HANDLING STORE SUBSCRIPTIONS TO AVOID TEMPORAL DEAD ZONE

/*
 * ❌ WRONG - Calling unsubscribe before initialization
 * const promise = new Promise((resolve) => {
 *   const unsubscribe = store.subscribe((value) => {
 *     if (condition) {
 *       unsubscribe(); // ReferenceError: Cannot access 'unsubscribe' before initialization
 *       resolve(value);
 *     }
 *   });
 * });
 */

/*
 * ✅ CORRECT - Initialize unsubscribe after the subscription
 */
function safeStoreSubscription() {
  return new Promise((resolve) => {
    let unsubscribe: () => void;
    
    const subscription = $store.subscribe((value) => {
      if (condition) {
        if (unsubscribe) unsubscribe();
        resolve(value);
      }
    });
    
    // Assign unsubscribe after subscription is created
    unsubscribe = subscription;
  });
}

// 3. BEST PRACTICES FOR HEALTH CHECKS

// Always implement proper error handling
async function robustHealthCheck(fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>) {
  try {
    const response = await fetch('https://api.example.com/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      throw new Error('Network error - please check your connection');
    }
    if (error.name === 'AbortError') {
      // Timeout error
      throw new Error('Health check timeout - service may be slow to respond');
    }
    // Re-throw other errors
    throw error;
  }
}

// 4. IMPLEMENTING CONNECTION STORE WITH PROPER ERROR HANDLING

interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  error: string | null;
  latency: number | null;
}

// Properly structured connection store with error handling
function createRobustConnectionStore() {
  const { subscribe, set, update } = writable<ConnectionStatus>({
    isConnected: false,
    isChecking: false,
    lastCheck: null,
    error: null,
    latency: null
  });

  return {
    subscribe,
    
    async checkConnection(fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>) {
      update((status) => ({ ...status, isChecking: true, error: null }));
      
      const startTime = Date.now();
      
      try {
        // Use provided fetch if in server context, otherwise use global fetch
        const response = fetch 
          ? await robustHealthCheck(fetch)
          : await window.fetch('/api/health'); // or your health endpoint
        
        const latency = Date.now() - startTime;
        
        set({
          isConnected: response.ok || response.status === 'success',
          isChecking: false,
          lastCheck: new Date(),
          error: null,
          latency
        });
      } catch (error) {
        const latency = Date.now() - startTime;
        
        set({
          isConnected: false,
          isChecking: false,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Connection check failed',
          latency
        });
      }
    }
  };
}

// 5. PROPER ERROR HANDLING FOR APP INITIALIZATION

async function safeAppInitialization() {
  try {
    // Initialize connection
    await connection.checkConnection();
    
    // Wait for connection with proper error handling
    return await new Promise((resolve, reject) => {
      let unsubscribe: () => void;
      const timeout = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        reject(new Error('App initialization timeout'));
      }, 30000); // 30 second timeout
      
      const subscription = connection.subscribe((status) => {
        if (!status.isChecking) {
          clearTimeout(timeout);
          if (unsubscribe) unsubscribe();
          resolve(status.isConnected);
        }
      });
      
      unsubscribe = subscription;
    });
  } catch (error) {
    console.error('App initialization failed:', error);
    return false;
  }
}

// 6. RECOMMENDED PATTERN FOR CONNECTIVITY-AWARE OPERATIONS

class ConnectivityAwareAPI {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Check connectivity before operation
        const status = get(connection);
        if (!status.isConnected) {
          await connection.checkConnection();
          // Wait for reconnection
          const connected = await waitForConnection(5000);
          if (!connected) {
            throw new Error('No connection available');
          }
        }
        
        return await operation();
      } catch (error) {
        if (attempt === retries - 1) {
          throw error; // Last attempt, rethrow the error
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw new Error('Operation failed after all retries');
  }
}