import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { getAuthService } from '$lib/services/auth'; // Updated import
import type { Permission } from '$lib/types/auth';

export interface UseAuthOptions {
  autoInitialize?: boolean;
  requireRefresh?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { autoInitialize = true, requireRefresh = true } = options;

  // Initialize auth if requested
  if (autoInitialize) {
    // This would typically run in a component's onMount
    // For this utility, we return functions that can be called when needed
  }

  async function initializeAuth(): Promise<void> {
    const authService = await getAuthService();
    await authService.initialize();
  }

  async function checkAuthStatus(): Promise<boolean> {
    // First check if user is authenticated
    const authState = get(auth);
    if (!authState.isAuthenticated) {
      return false;
    }

    // If authentication is required, check if token needs refresh
    if (requireRefresh) {
      const authService = await getAuthService();
      return await authService.refreshTokenIfNeeded();
    }

    return true;
  }

  async function getCurrentUser() {
    const authService = await getAuthService();
    return authService.getCurrentUser();
  }

  async function isAuthenticated(): Promise<boolean> {
    const authService = await getAuthService();
    return authService.isAuthenticated();
  }

  async function hasPermission(permission: string): Promise<boolean> {
    const authService = await getAuthService();
    return authService.hasPermission(permission);
  }

  async function hasAnyPermission(permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await hasPermission(permission)) {
        return true;
      }
    }
    return false;
  }

  async function hasAllPermissions(permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!await hasPermission(permission)) {
        return false;
      }
    }
    return true;
  }

  async function refreshTokenIfNeeded(): Promise<boolean> {
    const authService = await getAuthService();
    return await authService.refreshTokenIfNeeded();
  }

  async function logout(): Promise<void> {
    const authService = await getAuthService();
    await authService.logout();
  }

  return {
    initializeAuth,
    checkAuthStatus,
    getCurrentUser,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshTokenIfNeeded,
    logout
  };
}