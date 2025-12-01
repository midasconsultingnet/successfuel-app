<script lang="ts">
  // BrickLoader component to dynamically load plugin components
  import { onMount } from 'svelte';
  import type { Component } from 'svelte';

  let { pluginId, componentName, props = {} } = $props<{
    pluginId: string;
    componentName: string;
    props?: Record<string, any>;
  }>();

  let component: Component | null = null;
  let error: string | null = null;
  let loading = $state(true);

  onMount(async () => {
    try {
      // Dynamic import of plugin components
      // In a real implementation, this would load from a plugin registry
      const module = await import(`$lib/components/bricks/${pluginId}/${componentName}.svelte`);
      component = module.default;
      loading = false;
    } catch (err) {
      console.error(`Failed to load plugin component: ${pluginId}/${componentName}`, err);
      error = `Failed to load plugin: ${pluginId}`;
      loading = false;
    }
  });
</script>

<div class="brick-loader">
  {#if loading}
    <div>Loading plugin...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if component}
    <svelte:component this={component} {...props} />
  {/if}
</div>

<style>
  .brick-loader {
    width: 100%;
    min-height: 100px;
  }
  
  .error {
    color: #dc3545;
    padding: 1rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 0.25rem;
  }
</style>