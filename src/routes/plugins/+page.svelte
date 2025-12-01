<script lang="ts">
  import PluginRegistry from '$lib/components/features/PluginRegistry.svelte';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let user = $state<string | null>(null);

  onMount(() => {
    const authState = $auth;
    if (!authState.isAuthenticated) {
      goto('/auth');
      return;
    }
    user = authState.user?.name || null;
  });
</script>

<div class="plugins-page">
  <PluginRegistry />
</div>

<style>
  .plugins-page {
    min-height: 100vh;
    background-color: var(--page-bg, #f8f9fa);
  }
</style>