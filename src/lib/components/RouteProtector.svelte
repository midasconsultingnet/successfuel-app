<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { RouteProtector } from '$lib/utils/routeProtection'; // Import from the same file
  import type { ComponentType } from 'svelte';

  let { component = null, redirectPath = '/auth', fallback = null } = $props<{
    component?: ComponentType | null;
    redirectPath?: string;
    fallback?: ComponentType | null;
  }>();

  let isAuthenticated = $state(false);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      // Check if user has access to this route
      const currentPath = window.location.pathname;
      const hasAccess = await RouteProtector.checkAccess(currentPath);

      if (hasAccess) {
        isAuthenticated = true;
      } else {
        // The RouteProtector already handles redirection internally
        isAuthenticated = false;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Route protection error:', err);
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="loading">Loading...</div>
{:else if error}
  <div class="error">Error: {error}</div>
{:else if isAuthenticated}
  {#if component}
    <svelte:component this={component} />
  {:else}
    <slot />
  {/if}
{:else}
  {#if fallback}
    <svelte:component this={fallback} />
  {:else}
    <div>Redirecting...</div>
  {/if}
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }

  .error {
    color: #dc3545;
    padding: 1rem;
    text-align: center;
  }
</style>