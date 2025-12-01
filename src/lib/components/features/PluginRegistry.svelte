<script lang="ts">
  import type { PluginState } from '$lib/types/plugins';
  import { plugins } from '$lib/stores/plugins';
  import { onMount } from 'svelte';

  let allPlugins = $state<PluginState[]>([]);
  let filteredPlugins = $state<PluginState[]>([]);
  let searchTerm = $state('');
  let filterStatus = $state('all'); // 'all', 'enabled', 'disabled'

  // Load plugins from store
  onMount(async () => {
    await plugins.load();
    
    // Subscribe to plugin store updates
    $effect(() => {
      const registry = $plugins;
      allPlugins = Object.values(registry);
      updateFilteredPlugins();
    });
  });

  // Update filtered plugins based on search and filter
  function updateFilteredPlugins() {
    let result = allPlugins;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(plugin => 
        plugin.manifest.name.toLowerCase().includes(term) ||
        plugin.manifest.description.toLowerCase().includes(term) ||
        plugin.manifest.author.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(plugin => 
        filterStatus === 'enabled' ? plugin.enabled : !plugin.enabled
      );
    }
    
    filteredPlugins = result;
  }

  // Update filters when search term or filter status changes
  $effect(() => {
    updateFilteredPlugins();
  });

  // Toggle plugin enabled state
  async function togglePlugin(pluginId: string, enabled: boolean) {
    if (enabled) {
      await plugins.disable(pluginId);
    } else {
      await plugins.enable(pluginId);
    }
  }
</script>

<div class="plugin-registry">
  <div class="registry-header">
    <h1>Plugin Registry</h1>
    <p>Manage and configure plugins for your gas station ERP system</p>
  </div>

  <div class="registry-controls">
    <div class="search-box">
      <input
        type="text"
        placeholder="Search plugins..."
        bind:value={searchTerm}
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>

    <select bind:value={filterStatus} class="filter-select">
      <option value="all">All Plugins</option>
      <option value="enabled">Enabled</option>
      <option value="disabled">Disabled</option>
    </select>
  </div>

  <div class="plugins-grid">
    {#if filteredPlugins.length > 0}
      {#each filteredPlugins as plugin (plugin.manifest.id)}
        <div class="plugin-card">
          <div class="plugin-header">
            <div class="plugin-icon">🔌</div>
            <div class="plugin-info">
              <h3>{plugin.manifest.name}</h3>
              <span class="plugin-version">v{plugin.manifest.version}</span>
            </div>
            <div class="plugin-status">
              <span class={`status-indicator ${plugin.enabled ? 'enabled' : 'disabled'}`}>
                {plugin.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div class="plugin-description">
            <p>{plugin.manifest.description}</p>
          </div>

          <div class="plugin-meta">
            <span>Author: {plugin.manifest.author}</span>
            <span>Permissions: {plugin.manifest.permissions.length}</span>
            <span>Dependencies: {plugin.manifest.dependencies.length}</span>
          </div>

          <div class="plugin-actions">
            <button 
              class={`toggle-btn ${plugin.enabled ? 'disable' : 'enable'}`}
              on:click={() => togglePlugin(plugin.manifest.id, plugin.enabled)}
            >
              {plugin.enabled ? 'Disable' : 'Enable'}
            </button>
            <button class="configure-btn">Configure</button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="no-plugins">
        <div class="no-plugins-icon">🔌</div>
        <h3>No plugins found</h3>
        <p>{searchTerm ? 'Try a different search term' : 'No plugins are available in the registry'}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .plugin-registry {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .registry-header {
    margin-bottom: 1.5rem;
  }

  .registry-header h1 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #212529);
    font-size: 1.75rem;
  }

  .registry-header p {
    margin: 0;
    color: var(--text-secondary, #6c757d);
  }

  .registry-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    font-size: 1rem;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted, #868e96);
  }

  .filter-select {
    padding: 0.75rem;
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    background-color: white;
    font-size: 1rem;
  }

  .plugins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .plugin-card {
    background: var(--card-bg, white);
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    display: flex;
    flex-direction: column;
  }

  .plugin-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .plugin-icon {
    font-size: 1.5rem;
  }

  .plugin-info {
    flex: 1;
  }

  .plugin-info h3 {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary, #212529);
  }

  .plugin-version {
    background: var(--secondary-color, #6c757d);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .plugin-status {
    align-self: flex-start;
  }

  .status-indicator {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-indicator.enabled {
    background-color: rgba(40, 167, 69, 0.1);
    color: var(--success-color, #28a745);
  }

  .status-indicator.disabled {
    background-color: rgba(108, 117, 125, 0.1);
    color: var(--secondary-color, #6c757d);
  }

  .plugin-description {
    margin-bottom: 1rem;
    flex: 1;
  }

  .plugin-description p {
    margin: 0;
    color: var(--text-secondary, #6c757d);
    line-height: 1.5;
  }

  .plugin-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--text-muted, #868e96);
  }

  .plugin-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: 500;
  }

  .toggle-btn.enable {
    background-color: var(--success-color, #28a745);
    color: white;
  }

  .toggle-btn.enable:hover {
    background-color: #218838;
  }

  .toggle-btn.disable {
    background-color: var(--danger-color, #dc3545);
    color: white;
  }

  .toggle-btn.disable:hover {
    background-color: #c82333;
  }

  .configure-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color, #dee2e6);
    background-color: white;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .configure-btn:hover {
    background-color: var(--hover-bg, #f8f9fa);
  }

  .no-plugins {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary, #6c757d);
  }

  .no-plugins-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .no-plugins h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #212529);
  }

  .no-plugins p {
    margin: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .plugin-registry {
      padding: 0.5rem;
    }

    .registry-controls {
      flex-direction: column;
    }

    .search-box {
      min-width: unset;
    }

    .plugins-grid {
      grid-template-columns: 1fr;
    }

    .plugin-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .plugin-actions {
      flex-direction: column;
    }
  }
</style>