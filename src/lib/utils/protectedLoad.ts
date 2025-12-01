import type { LoadEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { routeRequiresAuth } from './serverAuth';

/**
 * Server-side load function for protected routes
 * This function should be used in +page.ts files for protected routes
 */
export async function protectedLoad(event: LoadEvent) {
  const { url } = event;
  const pathname = url.pathname;

  // Check if route requires authentication
  if (routeRequiresAuth(pathname)) {
    // For Tauri applications, we can't validate auth server-side
    // Instead, we'll allow the request to proceed but ensure the client-side
    // authentication check happens immediately
    
    // Add a flag to indicate this is a protected route that needs auth check
    return {
      requiresAuth: true,
      pathname
    };
  }

  return {
    requiresAuth: false,
    pathname
  };
}

/**
 * Check authentication in load function and redirect if not authenticated
 */
export async function checkAuthInLoad(event: LoadEvent) {
  const { url } = event;
  const pathname = url.pathname;

  // Check if route requires authentication
  if (routeRequiresAuth(pathname)) {
    // In a Tauri app, we can't validate auth server-side, so we'll redirect to auth
    // with the return URL to let the client-side code handle the actual check
    throw redirect(302, `/auth?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return {};
}