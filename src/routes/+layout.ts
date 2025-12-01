// Tauri doesn't have a Node.js server to do proper SSR
// so we use adapter-static with a fallback to index.html to put the site in SPA mode
import { AppStartupService } from '$lib/services/startup';
import { HealthAPI } from '$lib/services/api/health';

// Initialize app connectivity on startup
export async function load({ fetch }) {
  try {
    // Initialize connectivity manager with custom options
    AppStartupService.initializeConnectivity(); // Removed options that weren't supported

    // Initialize authentication state from Tauri storage
    await AppStartupService.initializeApp();

    // Check connectivity before loading the app using the proper fetch
    const response = await HealthAPI.checkWithLoadFetch(fetch);
    const isConnected = response.status === 'success';

    return {
      isConnected
    };
  } catch (error) {
    // If health check fails, return disconnected status
    return {
      isConnected: false
    };
  }
}

export const ssr = false;

// Global layout configuration for the ERP application