// Simple Tauri-based authentication service - Main entry point
export const getTauriAuthService = async () => {
  const { simpleTauriAuthService } = await import('$lib/services/simplifiedTauriAuth');
  return simpleTauriAuthService;
};

// Export the class itself for type compatibility
export type { SimpleTauriAuthService } from '$lib/services/simplifiedTauriAuth';