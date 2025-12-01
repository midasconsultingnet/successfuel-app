<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthService } from '$lib/services/auth';
  import type { ComponentType } from 'svelte';

  let { pluginId, fallback = null, loading: loadingSlot = null } = $props<{
    pluginId: string;
    fallback?: any;
    loading?: any;
  }>();

  let component: ComponentType | null = $state(null);
  let error: string | null = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      // Check if user has permission to load this plugin
      const authService = await getAuthService();
      const hasPermission = authService.hasPermission(`plugin:${pluginId}`);
      
      if (!hasPermission) {
        throw new Error(`Insufficient permissions to load plugin: ${pluginId}`);
      }

      // Dynamically import the plugin component
      const pluginModule = await import(`$lib/components/bricks/${pluginId}/index.svelte`);
      component = pluginModule.default;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load plugin';
      console.error(`Error loading plugin ${pluginId}:`, err);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  {#if loadingSlot}
    {@render loadingSlot}
  {:else}
    <div>Loading plugin...</div>
  {/if}
{:else if error}
  {#if fallback}
    {@render fallback({ error })}
  {:else}
    <div class="error">Error: {error}</div>
  {/if}
{:else if component}
  <svelte:component this={component} />
{/if}

<style>
  .error {
    color: #dc3545;
    padding: 1rem;
    text-align: center;
  }
</style>