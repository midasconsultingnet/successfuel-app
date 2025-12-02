// Enhanced authentication service with connectivity checks - Main entry point
export const getAuthService = async () => {
  const { enhancedAuthService } = await import('$lib/services/enhancedAuth');
  return enhancedAuthService;
};

// Export the class itself for type compatibility
export type { SimpleAuthService } from '$lib/services/simplifiedAuth';
export type { EnhancedAuthService } from '$lib/services/enhancedAuth';