// Base API configuration for the ERP system
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { API } from '$lib/utils/constants';
import { getAuthService } from '$lib/services/auth'; // Updated import

// Define base API configuration
export const API_BASE_URL = API.BASE_URL;

// Base API class to handle requests
export class BaseAPI {
  static async request(endpoint: string, options: RequestInit = {}) {
    // Get auth state
    const authState = get(auth);

    // Set default options
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    if (authState.token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${authState.token}`;
    }

    // Make the request
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If response is 401 (Unauthorized), try to refresh the token and retry
    if (response.status === 401) {
      const authService = await getAuthService(); // Get the service asynchronously
      const refreshed = await authService.refreshTokenIfNeeded();

      if (refreshed) {
        // Get the updated token and retry the request
        const updatedAuthState = get(auth);
        if (updatedAuthState.token) {
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${updatedAuthState.token}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        }
      }
    }

    // Handle non-success responses
    if (!response.ok) {
      // If it's still a 401 after refresh attempt, the user needs to log in again
      if (response.status === 401) {
        const authService = await getAuthService(); // Get the service asynchronously
        await authService.logout();
        throw new Error('Authentication required. Please log in again.');
      }

      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }

    // Return JSON response
    return response.json();
  }

  static async get(endpoint: string, params?: Record<string, string>) {
    let fullEndpoint = endpoint;
    if (params) {
      fullEndpoint += '?' + new URLSearchParams(params).toString();
    }
    return this.request(fullEndpoint, { method: 'GET' });
  }

  static async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  static async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  static async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export default BaseAPI;