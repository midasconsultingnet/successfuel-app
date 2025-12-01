import type { PluginManifest, PluginState } from '$lib/types/plugins';
import { plugins } from '$lib/stores/plugins';
import { getAuthService } from '$lib/services/auth'; // Updated import

export class PluginService {
  // Load a specific plugin by ID
  static async loadPlugin(pluginId: string): Promise<boolean> {
    try {
      const pluginState = plugins.get(pluginId);
      if (!pluginState) {
        console.error(`Plugin ${pluginId} not found in registry`);
        return false;
      }

      // Check if plugin is already loaded
      if (pluginState.loaded) {
        return true;
      }

      // Check if plugin is enabled
      if (!pluginState.enabled) {
        console.warn(`Cannot load disabled plugin ${pluginId}`);
        return false;
      }

      // Check dependencies
      if (pluginState.manifest.dependencies) {
        for (const depId of pluginState.manifest.dependencies) {
          const depState = plugins.get(depId);
          if (!depState || !depState.enabled || !depState.loaded) {
            console.error(`Plugin ${pluginId} dependency ${depId} is not available`);
            return false;
          }
        }
      }

      // Check permissions
      if (pluginState.manifest.permissions) {
        const authService = await getAuthService();
        const hasPermissions = pluginState.manifest.permissions.every(permission => 
          authService.hasPermission(permission)
        );

        if (!hasPermissions) {
          console.error(`Insufficient permissions to load plugin ${pluginId}`);
          return false;
        }
      }

      // Update plugin state to loaded
      plugins.update(pluginId, { loaded: true });

      // Execute any load lifecycle hook
      if (pluginState.manifest.lifecycle?.onLoad) {
        await pluginState.manifest.lifecycle.onLoad();
      }

      console.log(`Plugin ${pluginId} loaded successfully`);
      return true;
    } catch (error) {
      console.error(`Error loading plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Unload a specific plugin
  static async unloadPlugin(pluginId: string): Promise<boolean> {
    try {
      const pluginState = plugins.get(pluginId);
      if (!pluginState || !pluginState.loaded) {
        return true; // Plugin is already unloaded
      }

      // Execute any unload lifecycle hook
      if (pluginState.manifest.lifecycle?.onUnload) {
        await pluginState.manifest.lifecycle.onUnload();
      }

      // Update plugin state to unloaded
      plugins.update(pluginId, { loaded: false });

      console.log(`Plugin ${pluginId} unloaded successfully`);
      return true;
    } catch (error) {
      console.error(`Error unloading plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Enable a plugin (but don't load it)
  static enablePlugin(pluginId: string): boolean {
    try {
      const pluginState = plugins.get(pluginId);
      if (!pluginState) {
        console.error(`Plugin ${pluginId} not found`);
        return false;
      }

      plugins.update(pluginId, { enabled: true });
      console.log(`Plugin ${pluginId} enabled`);
      return true;
    } catch (error) {
      console.error(`Error enabling plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Disable a plugin (and unload it if loaded)
  static async disablePlugin(pluginId: string): Promise<boolean> {
    try {
      const pluginState = plugins.get(pluginId);
      if (!pluginState) {
        console.error(`Plugin ${pluginId} not found`);
        return false;
      }

      // If the plugin is currently loaded, unload it first
      if (pluginState.loaded) {
        await this.unloadPlugin(pluginId);
      }

      plugins.update(pluginId, { enabled: false });
      console.log(`Plugin ${pluginId} disabled`);
      return true;
    } catch (error) {
      console.error(`Error disabling plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Get plugin by ID
  static getPlugin(pluginId: string): PluginState | null {
    return plugins.get(pluginId);
  }

  // Get all active (enabled and loaded) plugins
  static getActivePlugins(): PluginState[] {
    const registry = plugins.getRegistry();
    return Object.values(registry).filter(
      plugin => plugin.enabled && plugin.loaded
    );
  }

  // Get all enabled plugins
  static getEnabledPlugins(): PluginState[] {
    const registry = plugins.getRegistry();
    return Object.values(registry).filter(plugin => plugin.enabled);
  }

  // Check if a plugin is available (exists, enabled and loaded)
  static isPluginAvailable(pluginId: string): boolean {
    const pluginState = plugins.get(pluginId);
    return !!(pluginState && pluginState.enabled && pluginState.loaded);
  }

  // Load all enabled plugins
  static async loadAllEnabledPlugins(): Promise<void> {
    const enabledPlugins = this.getEnabledPlugins();
    
    // Use Promise.all to load all plugins in parallel
    await Promise.allSettled(
      enabledPlugins.map(plugin => this.loadPlugin(plugin.manifest.id))
    );
  }

  // Validate plugin manifest
  static validateManifest(manifest: PluginManifest): boolean {
    if (!manifest.id || typeof manifest.id !== 'string') {
      console.error('Plugin manifest must have a valid id');
      return false;
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      console.error('Plugin manifest must have a valid version');
      return false;
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      console.error('Plugin manifest must have a valid name');
      return false;
    }

    if (!manifest.entry || typeof manifest.entry !== 'string') {
      console.error('Plugin manifest must have a valid entry point');
      return false;
    }

    return true;
  }

  // Register a new plugin
  static registerPlugin(manifest: PluginManifest): boolean {
    if (!this.validateManifest(manifest)) {
      return false;
    }

    // Check if plugin already exists
    if (plugins.get(manifest.id)) {
      console.warn(`Plugin ${manifest.id} already registered`);
      return false;
    }

    // Add plugin to registry with default state (disabled and unloaded)
    plugins.add({
      manifest,
      enabled: false, // Plugins are disabled by default
      loaded: false,
      error: null
    });

    console.log(`Plugin ${manifest.id} registered successfully`);
    return true;
  }
}

// Initialize default plugins
export async function initializePlugins(): Promise<void> {
  // Load all enabled plugins after auth is initialized
  await PluginService.loadAllEnabledPlugins();
}