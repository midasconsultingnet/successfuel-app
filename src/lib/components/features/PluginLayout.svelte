<script lang="ts">
  import { plugins } from '$lib/stores/plugins';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PluginManifest } from '$lib/types/plugins';

  let { pluginId, children } = $props<{ pluginId: string; children: any }>();
  let plugin: PluginManifest | null = $state(null);
  let isLoading = $state(true);
  let hasPermission = $state(false);

  onMount(async () => {
    // Check if the plugin exists and is enabled
    const registry = $plugins;
    const pluginState = registry[pluginId];
    
    if (!pluginState || !pluginState.enabled) {
      // Redirect to plugins page if plugin doesn't exist or isn't enabled
      await goto('/plugins');
      return;
    }
    
    plugin = pluginState.manifest;
    // In a real implementation, you would check permissions here
    hasPermission = true;
    isLoading = false;
  });
</script>

{#if isLoading}
  <div class="plugin-layout">
    <div class="loading">Loading plugin...</div>
  </div>
{:else if !hasPermission}
  <div class="plugin-layout">
    <div class="error">You don't have permission to access this plugin.</div>
  </div>
{:else}
  <div class="plugin-layout">
    <header class="plugin-header">
      <div class="plugin-info">
        <h1>{plugin?.name}</h1>
        <p>{plugin?.description}</p>
      </div>
      <div class="plugin-meta">
        <span class="plugin-version">v{plugin?.version}</span>
        <span class="plugin-author">by {plugin?.author}</span>
      </div>
    </header>
    
    <main class="plugin-content">
      <slot />
    </main>
  </div>
{/if}

<style>
  .plugin-layout {
    padding: 1rem;
    min-height: 100vh;
    background-color: var(--page-bg, #f8f9fa);
  }

  .plugin-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, #dee2e6);
  }

  .plugin-info {
    margin-bottom: 0.5rem;
  }

  .plugin-info h1 {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary, #212529);
    font-size: 1.5rem;
  }

  .plugin-info p {
    margin: 0;
    color: var(--text-secondary, #6c757d);
  }

  .plugin-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-muted, #868e96);
  }

  .plugin-version {
    background-color: var(--secondary-color, #6c757d);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
  }

  .plugin-content {
    background: var(--card-bg, white);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .loading,
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50vh;
    font-size: 1.25rem;
    color: var(--text-secondary, #6c757d);
  }

  .error {
    color: var(--danger-color, #dc3545);
  }
</style>