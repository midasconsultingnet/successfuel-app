import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { getAuthService } from '$lib/services/auth'; // Updated import
import { goto } from '$app/navigation';

export interface AuthCheckResult {
  isAuthenticated: boolean;
  isTokenValid: boolean;
  canProceed: boolean;
  redirectUrl?: string;
}

export async function checkAuthStatus(): Promise<AuthCheckResult> {
  const authState = get(auth);
  const isAuthenticated = authState.isAuthenticated;

  if (!isAuthenticated) {
    return {
      isAuthenticated: false,
      isTokenValid: false,
      canProceed: false,
      redirectUrl: '/auth'
    };
  }

  // Check if token needs refresh
  const authService = await getAuthService();
  const isTokenValid = await authService.refreshTokenIfNeeded();

  if (!isTokenValid) {
    return {
      isAuthenticated: false,
      isTokenValid: false,
      canProceed: false,
      redirectUrl: '/auth'
    };
  }

  return {
    isAuthenticated: true,
    isTokenValid: true,
    canProceed: true
  };
}

export async function requireAuth(redirectUrl: string = '/auth'): Promise<AuthCheckResult> {
  const result = await checkAuthStatus();

  if (!result.canProceed) {
    goto(redirectUrl);
  }

  return result;
}

export async function requirePermission(permission: string, redirectUrl: string = '/unauthorized'): Promise<boolean> {
  const result = await checkAuthStatus();

  if (!result.canProceed) {
    goto(result.redirectUrl || redirectUrl);
    return false;
  }

  const authService = await getAuthService();
  const hasPermission = authService.hasPermission(permission);

  if (!hasPermission) {
    goto(redirectUrl);
    return false;
  }

  return true;
}

export async function requirePermissions(permissions: string[], redirectUrl: string = '/unauthorized'): Promise<boolean> {
  for (const permission of permissions) {
    const hasPermission = await requirePermission(permission, redirectUrl);
    if (!hasPermission) {
      return false;
    }
  }
  return true;
}

export async function handleAuthError(error: any): Promise<void> {
  console.error('Authentication error:', error);

  try {
    const result = await checkAuthStatus();
    
    if (!result.isTokenValid) {
      // Try to refresh token again
      const authService = await getAuthService();
      const refreshed = await authService.refreshTokenIfNeeded();
      
      if (!refreshed) {
        // If refresh fails again, redirect to login
        goto('/auth');
      }
    }
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError);
    goto('/auth');
  }
}

// Function to get current user safely
export async function getCurrentUser() {
  const result = await checkAuthStatus();
  
  if (result.canProceed) {
    const authService = await getAuthService();
    return authService.getCurrentUser();
  }
  
  return null;
}