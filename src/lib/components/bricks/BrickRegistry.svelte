<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  
  // Plugin registry to track available plugins
  type Plugin = {
    id: string;
    name: string;
    version: string;
    description: string;
    enabled: boolean;
  };
  
  let plugins = $state<Plugin[]>([]);
  let loading = $state(true);
  
  onMount(async () => {
    try {
      const pluginList: string[] = await invoke('get_plugins');
      plugins = pluginList.map(id => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        version: '1.0.0',
        description: `Description for ${id} plugin`,
        enabled: true
      }));
    } catch (err) {
      console.error('Failed to load plugins:', err);
    } finally {
      loading = false;
    }
  });
  
  async function togglePlugin(pluginId: string) {
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin) {
      if (plugin.enabled) {
        try {
          await invoke('unload_plugin', { pluginId });
          plugin.enabled = false;
        } catch (err) {
          console.error(`Failed to unload plugin ${pluginId}:`, err);
        }
      } else {
        try {
          await invoke('load_plugin', { pluginId });
          plugin.enabled = true;
        } catch (err) {
          console.error(`Failed to load plugin ${pluginId}:`, err);
        }
      }
    }
  }
</script>

<div class="brick-registry">
  <h2>Plugin Registry</h2>
  
  {#if loading}
    <div>Loading plugins...</div>
  {:else}
    <div class="plugin-list">
      {#each plugins as plugin (plugin.id)}
        <div class="plugin-card">
          <div class="plugin-header">
            <h3>{plugin.name}</h3>
            <span class="version">v{plugin.version}</span>
          </div>
          <p class="description">{plugin.description}</p>
          <div class="plugin-actions">
            <button
              class="toggle-btn"
              class:enabled={plugin.enabled}
              onclick={() => togglePlugin(plugin.id)}
            >
              {plugin.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      {/each}
    </div>
    {#if plugins.length === 0}
      <p>No plugins available.</p>
    {/if}
  {/if}
</div>

<style>
  .brick-registry {
    padding: 1rem;
  }
  
  .plugin-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .plugin-card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: white;
  }
  
  .plugin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .version {
    background-color: #6c757d;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }
  
  .description {
    margin: 0.5rem 0;
    color: #6c757d;
  }
  
  .plugin-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .toggle-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .toggle-btn.enabled {
    background-color: #28a745;
    color: white;
  }
  
  .toggle-btn:not(.enabled) {
    background-color: #dc3545;
    color: white;
  }
</style>