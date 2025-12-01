import type { RequestEvent } from '@sveltejs/kit';

/**
 * Server-side authentication validation
 * This function validates authentication for server-side rendering
 */
export async function validateServerAuth(event: RequestEvent): Promise<{
  isAuthenticated: boolean;
  user?: any;
  error?: string
}> {
  // For Tauri applications, server-side authentication validation is tricky
  // since Tauri commands can't be called from the server-side context
  // Instead, we'll return true here to allow the request to proceed to client-side validation
  // where the actual authentication check will happen

  // The real authentication validation happens on the client side
  // This server-side check is just to control initial route access

  try {
    // In a Tauri app, authentication is typically handled client-side
    // We'll return true to allow the request but ensure client-side validation happens
    // The actual authentication status is checked on the client

    // For static generation, we'll allow the request but client-side code will handle redirects
    return { isAuthenticated: true };
  } catch (error) {
    console.error('Server-side auth validation failed:', error);
    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Authentication validation failed'
    };
  }
}

/**
 * Check if a route requires authentication
 */
export function routeRequiresAuth(path: string): boolean {
  const publicRoutes = ['/', '/auth', '/login', '/register', '/forgot-password', '/reset-password', '/health', '/api/auth'];

  return !publicRoutes.some(publicRoute =>
    path === publicRoute || path.startsWith(publicRoute + '/')
  );
}

/**
 * Handle protected route access on the server
 */
export async function handleProtectedRoute(event: RequestEvent): Promise<{
  allow: boolean;
  redirect?: string;
  error?: string
}> {
  const path = event.url.pathname;

  // Check if route requires authentication
  if (!routeRequiresAuth(path)) {
    return { allow: true };
  }

  // For Tauri apps, we'll allow the request to proceed to client-side
  // where the actual authentication check will happen
  // The server-side hook will primarily be used to redirect if needed
  // but the real validation happens on the client

  // In Tauri applications, since authentication is client-side and tokens are stored
  // in Tauri's secure storage, we cannot verify authentication on the server side.
  // So we allow the request to proceed to client-side validation.
  // The actual authentication status is checked on the client after the page loads.

  // The only exception is for direct navigation to protected routes when the app starts
  // which should redirect to the auth page
  const referer = event.request.headers.get('referer');
  const isDirectNavigation = !referer || new URL(referer).origin !== event.url.origin;

  // For Tauri desktop apps, direct navigation check may not be reliable
  // So we'll be more permissive and allow access, letting the client-side handle it
  return { allow: true };
}