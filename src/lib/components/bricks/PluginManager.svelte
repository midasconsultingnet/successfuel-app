<script lang="ts">
  // PluginManager.svelte - Main plugin management component
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import type { Component } from 'svelte';
  
  export type PluginManifest = {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    entry: string;
    routes?: Array<{
      path: string;
      component: string;
    }>;
    permissions: string[];
    dependencies: string[];
    hooks?: {
      onLoad?: string;
      onUnload?: string;
    };
  };
  
  type PluginState = {
    manifest: PluginManifest;
    enabled: boolean;
    loaded: boolean;
    component?: Component;
  };
  
  let plugins = $state<PluginState[]>([]);
  let loading = $state(true);
  
  // Load all plugins
  onMount(async () => {
    await loadPlugins();
  });
  
  async function loadPlugins() {
    try {
      const pluginIds: string[] = await invoke('get_plugins');
      
      plugins = await Promise.all(pluginIds.map(async (id) => {
        // In a real implementation, we would load the manifest for each plugin
        // For now, we'll create a mock manifest
        const manifest: PluginManifest = {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          version: '1.0.0',
          description: `Description for ${id} plugin`,
          author: 'SuccessFuel',
          entry: `${id}.svelte`,
          permissions: [],
          dependencies: [],
        };
        
        return {
          manifest,
          enabled: true,
          loaded: false
        };
      }));
    } catch (err) {
      console.error('Failed to load plugins:', err);
    } finally {
      loading = false;
    }
  }
  
  // Load a specific plugin
  async function loadPlugin(pluginId: string) {
    try {
      await invoke('load_plugin', { pluginId });
      const plugin = plugins.find(p => p.manifest.id === pluginId);
      if (plugin) {
        plugin.enabled = true;
        // In a real implementation, we would dynamically import the component
        // plugin.component = await import(`$lib/plugins/${pluginId}/${plugin.manifest.entry}`);
      }
    } catch (err) {
      console.error(`Failed to load plugin ${pluginId}:`, err);
    }
  }
  
  // Unload a specific plugin
  async function unloadPlugin(pluginId: string) {
    try {
      await invoke('unload_plugin', { pluginId });
      const plugin = plugins.find(p => p.manifest.id === pluginId);
      if (plugin) {
        plugin.enabled = false;
        plugin.loaded = false;
      }
    } catch (err) {
      console.error(`Failed to unload plugin ${pluginId}:`, err);
    }
  }
  
  // Toggle plugin enabled state
  async function togglePlugin(pluginId: string) {
    const plugin = plugins.find(p => p.manifest.id === pluginId);
    if (plugin) {
      if (plugin.enabled) {
        await unloadPlugin(pluginId);
      } else {
        await loadPlugin(pluginId);
      }
    }
  }
  
  // Refresh the plugin list
  async function refreshPlugins() {
    loading = true;
    await loadPlugins();
  }
</script>

<div class="plugin-manager">
  <header class="plugin-header">
    <h1>Plugin Manager</h1>
    <button class="refresh-btn" onclick={refreshPlugins} title="Refresh Plugins">
      Refresh
    </button>
  </header>
  
  {#if loading}
    <div class="loading">Loading plugins...</div>
  {:else}
    <div class="plugin-grid">
      {#each plugins as plugin (plugin.manifest.id)}
        <div class="plugin-card">
          <div class="plugin-info">
            <h3>{plugin.manifest.name}</h3>
            <p class="plugin-version">v{plugin.manifest.version}</p>
            <p class="plugin-description">{plugin.manifest.description}</p>
            <p class="plugin-author">By {plugin.manifest.author}</p>
          </div>
          
          <div class="plugin-actions">
            <button
              class="toggle-btn"
              class:enabled={plugin.enabled}
              class:disabled={!plugin.enabled}
              onclick={() => togglePlugin(plugin.manifest.id)}
            >
              {plugin.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      {/each}
    </div>
    
    {#if plugins.length === 0}
      <div class="no-plugins">
        <p>No plugins available.</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .plugin-manager {
    padding: 1rem;
  }
  
  .plugin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .plugin-card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: white;
    display: flex;
    flex-direction: column;
  }
  
  .plugin-info {
    flex: 1;
  }
  
  .plugin-info h3 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }
  
  .plugin-version {
    font-size: 0.8rem;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }
  
  .plugin-description {
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }
  
  .plugin-author {
    font-size: 0.8rem;
    color: #adb5bd;
    margin: 0;
  }
  
  .plugin-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
  
  .toggle-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .toggle-btn.enabled {
    background-color: #28a745;
    color: white;
  }
  
  .toggle-btn.disabled {
    background-color: #dc3545;
    color: white;
  }
  
  .loading, .no-plugins {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }
  
  .refresh-btn {
    padding: 0.5rem 1rem;
    background-color: #17a2b8;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .refresh-btn:hover {
    background-color: #138496;
  }
</style>