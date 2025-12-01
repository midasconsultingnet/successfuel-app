// Plugin store for managing plugin state
import { writable, derived } from 'svelte/store';
import type { PluginRegistry, PluginState } from '$lib/types/plugins';

function createPluginStore() {
  const { subscribe, set, update } = writable<PluginRegistry>({
    // Initial empty plugin registry
  });

  // Derived store for active plugins
  const activePlugins = derived(
    subscribe,
    $registry => Object.values($registry).filter(plugin => plugin.enabled && plugin.loaded)
  );

  // Derived store for plugin navigation items
  const navigationItems = derived(
    activePlugins,
    $plugins => {
      return $plugins.flatMap(plugin => {
        if (plugin.manifest.routes && plugin.manifest.routes.length > 0) {
          return plugin.manifest.routes.map(route => ({
            id: `${plugin.manifest.id}-${route.path}`,
            label: route.path.charAt(1).toUpperCase() + route.path.slice(2),
            href: route.path,
            icon: '⚙️', // Default plugin icon
            pluginId: plugin.manifest.id
          }));
        }
        return [];
      });
    }
  );

  return {
    subscribe,
    activePlugins,
    navigationItems,

    // Load plugin registry from backend
    load: async () => {
      // In a real implementation, this would fetch from the backend
      // For now we'll just initialize with an empty registry
      set({});
    },

    // Add a plugin to the registry
    add: (plugin: PluginState) => {
      update(registry => ({
        ...registry,
        [plugin.manifest.id]: plugin
      }));
    },

    // Update a plugin's state
    updateState: (pluginId: string, state: Partial<PluginState>) => {
      update(registry => {
        const existing = registry[pluginId];
        if (existing) {
          return {
            ...registry,
            [pluginId]: { ...existing, ...state }
          };
        }
        return registry;
      });
    },

    // Remove a plugin from the registry
    remove: (pluginId: string) => {
      update(registry => {
        const newRegistry = { ...registry };
        delete newRegistry[pluginId];
        return newRegistry;
      });
    },

    // Enable a plugin
    enable: (pluginId: string) => {
      update(registry => {
        const existing = registry[pluginId];
        if (existing) {
          return {
            ...registry,
            [pluginId]: {
              ...existing,
              enabled: true
            }
          };
        }
        return registry;
      });
    },

    // Disable a plugin
    disable: (pluginId: string) => {
      update(registry => {
        const existing = registry[pluginId];
        if (existing) {
          return {
            ...registry,
            [pluginId]: {
              ...existing,
              enabled: false
            }
          };
        }
        return registry;
      });
    },

    // Mark a plugin as loaded
    markLoaded: (pluginId: string) => {
      update(registry => {
        const existing = registry[pluginId];
        if (existing) {
          return {
            ...registry,
            [pluginId]: {
              ...existing,
              loaded: true
            }
          };
        }
        return registry;
      });
    },

    // Get a specific plugin
    get: (pluginId: string) => {
      const registry = get(this);
      return registry[pluginId] || null;
    }
  };
}

export const plugins = createPluginStore();