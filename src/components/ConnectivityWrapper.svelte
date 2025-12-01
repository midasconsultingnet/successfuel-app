<script lang="ts">
  import { onMount } from 'svelte';
  import { connection } from '$lib/stores/connection';
  import { get } from 'svelte/store';

  // Component props using $props() for Svelte 5 runes mode
  let { 
    checkOnMount = true, 
    waitForConnection = false, 
    timeout = 10000, 
    renderWhenOffline = false 
  } = $props<{
    checkOnMount?: boolean;
    waitForConnection?: boolean;
    timeout?: number;
    renderWhenOffline?: boolean;
  }>();

  let isConnected = $state(false);
  let isChecking = $state(true);
  let hasAttemptedConnection = $state(false);
  let showContent = $state(false);

  // Initialize component
  onMount(async () => {
    if (checkOnMount) {
      // Check connection status
      await checkConnection();
    }

    // Subscribe to connection store
    const unsubscribe = connection.subscribe(connState => {
      isConnected = connState.isConnected;
      isChecking = connState.isChecking;
      
      if (!isChecking && !hasAttemptedConnection) {
        hasAttemptedConnection = true;
      }

      // Determine if content should be shown
      if (waitForConnection) {
        // Wait for connection before showing content
        showContent = isConnected;
      } else {
        // Show content regardless of connection status
        showContent = true;
      }
    });

    return unsubscribe;
  });

  // Function to check connection
  async function checkConnection() {
    try {
      await connection.checkConnection();
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  }

  // Function to retry connection
  async function retryConnection() {
    await checkConnection();
  }
</script>

{#if isChecking && !hasAttemptedConnection}
  <div class="connectivity-checking">
    <p>Checking connection...</p>
  </div>
{:else if !isConnected && waitForConnection && !renderWhenOffline}
  <div class="connectivity-offline">
    <h3>No Internet Connection</h3>
    <p>You are currently offline. Please check your connection.</p>
    <button on:click={retryConnection}>Retry Connection</button>
  </div>
{:else}
  <div class="connectivity-content">
    {#if showContent}
      <slot />
    {/if}
  </div>
{/if}

<style>
  .connectivity-checking {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    text-align: center;
  }

  .connectivity-offline {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    min-height: 300px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 0.5rem;
  }

  .connectivity-offline h3 {
    margin-top: 0;
    color: #721c24;
  }

  .connectivity-content {
    width: 100%;
  }
</style>