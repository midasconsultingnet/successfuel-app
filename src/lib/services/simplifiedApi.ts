// Simplified API client for SuccessFuel ERP
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { API } from '$lib/utils/constants';
import { getAuthService } from '$lib/services/auth'; // Updated import

const API_BASE_URL = API.BASE_URL;

// Simplified API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  // Set default options
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  const authState = get(auth);
  if (authState.token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${authState.token}`;
  }

  try {
    // Make the request
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If response is 401 (Unauthorized), try to refresh the token and retry
    if (response.status === 401) {
      const authService = await getAuthService(); // Get the service asynchronously
      const refreshed = await authService.refreshTokenIfNeeded?.() || false;

      if (refreshed) {
        // Get the updated token and retry the request
        const updatedAuthState = get(auth);
        if (updatedAuthState.token) {
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${updatedAuthState.token}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        }
      }
    }

    // Handle response
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      // Handle error response
      let message = `Request failed: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // If response is not JSON, use default message
      }

      // If it's still a 401 after refresh attempt, the user needs to log in again
      if (response.status === 401) {
        const authService = await getAuthService(); // Get the service asynchronously
        await authService.logout();
      }

      return { success: false, message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, message };
  }
}

// Specific API functions
export const AuthAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),

  getProfile: () =>
    apiRequest('/users/profile'), // Updated to match API documentation

  register: (userData: { email: string; password: string; name: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  refreshToken: (refreshToken: string) =>
    apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
};

export const PluginAPI = {
  getAvailable: () =>
    apiRequest('/plugins/available'),

  getEnabled: () =>
    apiRequest('/plugins/enabled')
};

// Add more API modules as needed