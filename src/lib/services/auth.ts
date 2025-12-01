// Simple authentication service - Main entry point
export const getAuthService = async () => {
  const { simpleAuthService } = await import('$lib/services/simplifiedAuth');
  return simpleAuthService;
};

// Export the class itself for type compatibility
export type { SimpleAuthService } from '$lib/services/simplifiedAuth';