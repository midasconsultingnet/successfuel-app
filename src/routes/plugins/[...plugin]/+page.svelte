<script lang="ts">
  import { page } from '$app/stores';
  import BrickLoader from '$lib/components/bricks/BrickLoader.svelte';
  
  let pluginId = $state<string | null>(null);
  
  $effect(() => {
    // Extract plugin ID from the route
    const path = $page.route.id;
    if (path) {
      // Extract plugin name from route like /plugins/[pluginId]
      const match = path.match(/\/plugins\/([^/]+)/);
      if (match) {
        pluginId = match[1];
      }
    }
  });
</script>

<div class="dynamic-plugin-page">
  {#if pluginId}
    <h1>Plugin: {pluginId}</h1>
    <BrickLoader {pluginId} componentName="Index" />
  {:else}
    <p>Invalid plugin route</p>
  {/if}
</div>

<style>
  .dynamic-plugin-page {
    padding: 1rem;
  }
</style>