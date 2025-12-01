import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { getAuthService } from '$lib/services/auth'; // Updated import
import type { AuthState } from '$lib/types/auth';

export interface RouteProtectionOptions {
  requireAuth?: boolean;
  requirePermissions?: string[];
  redirectTo?: string;
}

// RouteProtector class to match the expected interface
class RouteProtectorClass {
  async checkAccess(path: string): Promise<boolean> {
    // Default options - could be extended to support route-specific configurations
    const options: RouteProtectionOptions = {
      requireAuth: !['/', '/auth', '/register'].some(route => path.startsWith(route)),
      requirePermissions: [],
      redirectTo: '/auth'
    };

    return await this.handleRouteProtection(path, options);
  }

  async handleRouteProtection(path: string, options: RouteProtectionOptions = {}): Promise<boolean> {
    const {
      requireAuth = true,
      requirePermissions = [],
      redirectTo = '/auth'
    } = options;

    try {
      // Check if user is authenticated
      const authState = get(auth);
      const isAuthenticated = authState.isAuthenticated;

      if (requireAuth && !isAuthenticated) {
        // Try to refresh authentication state
        const authService = await getAuthService();
        await authService.initialize();

        // Re-check authentication after initialization
        const updatedAuthState = get(auth);
        if (!updatedAuthState.isAuthenticated) {
          goto(redirectTo);
          return false;
        }
      }

      // If user is authenticated but we don't have user data, try to fetch it
      if (requireAuth && isAuthenticated && !authState.user) {
        const authService = await getAuthService();
        try {
          await authService.getProfile(); // Use cached version if available
        } catch (profileError) {
          console.error('Error fetching profile during route protection:', profileError);
          goto(redirectTo);
          return false;
        }
      }

      // Check permissions if required
      if (requirePermissions.length > 0) {
        const authService = await getAuthService();
        const hasAllPermissions = requirePermissions.every(permission =>
          authService.hasPermission(permission)
        );

        if (!hasAllPermissions) {
          // User doesn't have required permissions
          goto('/unauthorized');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Route protection check failed:', error);
      goto(redirectTo);
      return false;
    }
  }

  async checkRouteAccess(options: RouteProtectionOptions = {}): Promise<boolean> {
    const {
      requireAuth = true,
      requirePermissions = [],
      redirectTo = '/auth'
    } = options;

    // Check if user is authenticated
    const authState = get(auth);
    const isAuthenticated = authState.isAuthenticated;

    if (requireAuth && !isAuthenticated) {
      // Try to refresh authentication state
      const authService = await getAuthService();
      await authService.initialize();

      // Re-check authentication after initialization
      const updatedAuthState = get(auth);
      if (!updatedAuthState.isAuthenticated) {
        goto(redirectTo);
        return false;
      }
    }

    // If user is authenticated but we don't have user data, try to fetch it
    if (requireAuth && isAuthenticated && !authState.user) {
      const authService = await getAuthService();
      try {
        await authService.getProfile(); // Use cached version if available
      } catch (profileError) {
        console.error('Error fetching profile during route access check:', profileError);
        goto(redirectTo);
        return false;
      }
    }

    // Check permissions if required
    if (requirePermissions.length > 0) {
      const authService = await getAuthService();
      const hasAllPermissions = requirePermissions.every(permission =>
        authService.hasPermission(permission)
      );

      if (!hasAllPermissions) {
        // User doesn't have required permissions
        goto('/unauthorized');
        return false;
      }
    }

    return true;
  }

  async handleRouteAccess(options: RouteProtectionOptions = {}): Promise<boolean> {
    try {
      // First, check if authentication token needs refresh
      const authService = await getAuthService();
      const isTokenValid = await authService.refreshTokenIfNeeded();

      if (!isTokenValid && options.requireAuth) {
        goto(options.redirectTo || '/auth');
        return false;
      }

      // Then check route access
      return await this.checkRouteAccess(options);
    } catch (error) {
      console.error('Route protection check failed:', error);
      goto(options.redirectTo || '/auth');
      return false;
    }
  }

  async protectRoute(options: RouteProtectionOptions = {}): Promise<void> {
    const canAccess = await this.handleRouteAccess(options);
    if (!canAccess) {
      // Navigation has already been redirected by handleRouteAccess
      return;
    }
  }
}

// Export singleton instance
export const RouteProtector = new RouteProtectorClass();

// Export the same functions as standalone utilities
export { 
  checkRouteAccess, 
  handleRouteProtection, 
  protectRoute 
};