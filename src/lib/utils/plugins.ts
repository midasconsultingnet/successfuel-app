// Plugin utilities and helper functions
import type { PluginManifest } from '$lib/types/plugins';
import { invoke } from '@tauri-apps/api/core';

/**
 * Loads a plugin manifest from the backend
 */
export async function loadPluginManifest(pluginId: string): Promise<PluginManifest | null> {
  try {
    // In a real implementation, this would load the manifest file from the plugin directory
    // For now we'll return a mock manifest
    return {
      id: pluginId,
      name: pluginId.charAt(0).toUpperCase() + pluginId.slice(1),
      version: '1.0.0',
      description: `Description for ${pluginId} plugin`,
      author: 'SuccessFuel',
      entry: `${pluginId}.svelte`,
      permissions: [],
      dependencies: [],
    };
  } catch (error) {
    console.error(`Failed to load manifest for plugin ${pluginId}:`, error);
    return null;
  }
}

/**
 * Checks if a plugin has the required permissions
 */
export function hasPermission(plugin: PluginManifest, permission: string): boolean {
  return plugin.permissions.includes(permission);
}

/**
 * Checks if a plugin has all required dependencies
 */
export async function checkDependencies(plugin: PluginManifest): Promise<boolean> {
  // Check if all dependencies are available and enabled
  for (const depId of plugin.dependencies) {
    try {
      const result: boolean = await invoke('get_plugin_status', { pluginId: depId });
      if (!result) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Validates a plugin manifest
 */
export function validateManifest(manifest: PluginManifest): boolean {
  return !!(
    manifest.id &&
    manifest.name &&
    manifest.version &&
    manifest.entry
  );
}