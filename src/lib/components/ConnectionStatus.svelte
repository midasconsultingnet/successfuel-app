<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { connectivityStore } from '$lib/stores/connectivity';
  import { ConnectivityService } from '$lib/services/connectivity';
  import TranslationNew from '$lib/components/TranslationNew.svelte';
  
  let status = $state(get(connectivityStore));
  let connectivityService: ConnectivityService;
  
  $effect(() => {
    // Subscribe to store changes
    const unsubscribe = connectivityStore.subscribe(value => {
      status = value;
    });
    
    return () => unsubscribe();
  });
  
  onMount(() => {
    connectivityService = ConnectivityService.getInstance();
    
    // Perform an initial check
    connectivityService.performCheck();
  });
  
  function getConnectivityClass(): string {
    if (status.isChecking) return 'checking';
    if (status.isApiHealthy && status.isDbHealthy) return 'healthy';
    return 'unhealthy';
  }
  
  function getConnectivityText(): string {
    if (status.isChecking) return 'Checking connection...';
    if (status.isApiHealthy && status.isDbHealthy) return 'Connected';
    if (!status.isApiHealthy && !status.isDbHealthy) return 'Service & database unavailable';
    if (!status.isApiHealthy) return 'Service unavailable';
    if (!status.isDbHealthy) return 'Database unavailable';
    return 'Unknown status';
  }
  
  async function handleRefresh() {
    if (connectivityService) {
      await connectivityService.performCheck();
    }
  }
  
  function formatLastChecked(): string {
    if (!status.lastChecked) return 'Never';
    return status.lastChecked.toLocaleTimeString();
  }
</script>

<div class="connection-status {getConnectivityClass()}" role="status" aria-live="polite">
  <div class="status-icon">
    {#if status.isChecking}
      <i class="fas fa-spinner fa-spin" title="Checking connection"></i>
    {:else if status.isApiHealthy && status.isDbHealthy}
      <i class="fas fa-check-circle" title="Fully connected"></i>
    {:else}
      <i class="fas fa-exclamation-triangle" title="Connection issues"></i>
    {/if}
  </div>
  <div class="status-text" aria-label={getConnectivityText()}>
    <span class="status-message"><TranslationNew key="common.connectionStatus" params={{ status: getConnectivityText() }} /></span>
    <span class="last-checked">Last checked: {formatLastChecked()}</span>
  </div>
  <button 
    class="refresh-btn" 
    on:click={handleRefresh} 
    title="Refresh connection status"
    aria-label="Refresh connection status"
  >
    <i class="fas fa-sync-alt"></i>
  </button>
</div>

<style>
  .connection-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }
  
  .connection-status.checking {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
  
  .connection-status.healthy {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .connection-status.unhealthy {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .status-icon {
    display: flex;
    align-items: center;
  }
  
  .status-icon i {
    font-size: 1.25rem;
  }
  
  .status-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  
  .status-message {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .last-checked {
    font-size: 0.75rem;
    opacity: 0.8;
    white-space: nowrap;
  }
  
  .refresh-btn {
    background: none;
    border: 1px solid transparent;
    color: inherit;
    padding: 0.25rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .refresh-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .refresh-btn:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
</style>