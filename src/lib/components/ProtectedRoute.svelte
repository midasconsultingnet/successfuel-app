<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import type { ComponentType } from 'svelte';

  // Component props using $props() for Svelte 5 runes mode
  let {
    component,
    redirectTo = '/login'
  } = $props<{
    component: ComponentType;
    redirectTo?: string;
  }>();

  let isAuthenticated = $state(false);
  let loading = $state(true);

  // Initialize component
  onMount(() => {
    // Subscribe to auth store
    const unsubscribe = auth.subscribe(authState => {
      isAuthenticated = authState.isAuthenticated;
      loading = false;

      // If not authenticated, redirect
      if (!isAuthenticated) {
        goto(redirectTo);
      }
    });

    return unsubscribe;
  });
</script>

{#if loading}
  <div class="protected-route-loading">
    <p>Loading...</p>
  </div>
{:else if isAuthenticated}
  <svelte:component this={component} />
{:else}
  <div class="protected-route-unauthorized">
    <p>Access denied</p>
  </div>
{/if}

<style>
  .protected-route-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .protected-route-unauthorized {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #dc3545;
  }
</style>