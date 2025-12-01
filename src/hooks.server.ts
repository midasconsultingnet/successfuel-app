// src/hooks.server.ts - Server-side hooks for route protection
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get the current route
  const route = event.url.pathname;

  // For API routes, we might want to handle authentication differently
  if (route.startsWith('/api/')) {
    // API routes would be handled by the backend API directly
    return resolve(event);
  }

  // For Tauri applications with SSR disabled (SPA mode), authentication is handled entirely on the client
  // The server-side hook should be very permissive and allow all application routes to load
  // so that the client-side authentication logic can take effect
  return resolve(event);
};