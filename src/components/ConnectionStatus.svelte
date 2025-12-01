<script lang="ts">
  import { onMount } from 'svelte';
  import { connection } from '$lib/stores/connection';
  import { ConnectivityUtils } from '$lib/utils/connectivity';
  import type { ConnectionStatus } from '$lib/stores/connection';

  // Reactive declarations for connection status
  let status: ConnectionStatus = $state({
    isConnected: false,
    isChecking: false,
    lastCheck: null,
    error: null,
    latency: null,
    retryCount: 0,
    nextRetryTime: null,
    isRetrying: false,
    connectionStability: 'offline'
  });

  // Initialize connectivity utils and connection status
  onMount(async () => {
    // Initialize connectivity utils with custom options
    ConnectivityUtils.initialize({
      checkInterval: 10000, // Every 10 seconds
      maxRetries: 5,
      timeout: 10000,
      retryOnUserAction: true
    });

    // Check connection on component mount
    await connection.checkConnection();
  });

  // Subscribe to connection store with proper handling
  $effect(() => {
    const unsubscribe = connection.subscribe(connStatus => {
      status = connStatus;
    });

    // Cleanup subscription on component destroy
    return () => {
      unsubscribe?.();
    };
  });

  // Function to manually check connection
  const checkConnection = async () => {
    await connection.checkConnection();
  };

  // Function to retry connection if failed
  const retryConnection = async () => {
    await connection.forceRetry();
  };

  // Function to get connection status class for styling
  const getStatusClass = (): string => {
    if (status.isChecking || status.isRetrying) return 'checking';
    if (status.isConnected) return 'connected';
    return 'disconnected';
  };

  // Function to get connection status text
  const getStatusText = (): string => {
    if (status.isChecking || status.isRetrying) return 'Checking connection...';
    if (status.isConnected) return 'Connected';
    return 'Disconnected';
  };

  // Function to get stability indicator
  const getStabilityIndicator = (): string => {
    if (!status.isConnected) return 'Offline';
    switch (status.connectionStability) {
      case 'stable': return 'Stable';
      case 'unstable': return 'Unstable';
      default: return 'Unknown';
    }
  };

  // Function to get retry message
  const getRetryMessage = (): string => {
    if (status.isRetrying && status.retryCount > 0) {
      return `Retrying... (attempt ${status.retryCount})`;
    }
    if (status.retryCount > 0) {
      return `Last retry failed (attempt ${status.retryCount})`;
    }
    return '';
  };
</script>

<div class="connection-status">
  <div class="status-indicator">
    <span class={getStatusClass()}>
      {#if status.isChecking || status.isRetrying}
        <span class="spinner">↻</span>
      {/if}
      {getStatusText()}
    </span>
  </div>

  {#if status.connectionStability && !status.isChecking && !status.isRetrying}
    <div class="stability-indicator">
      Stability: <span class={status.connectionStability}>{getStabilityIndicator()}</span>
    </div>
  {/if}

  {#if status.error}
    <div class="error-message">
      <p>Error: {status.error}</p>
      {#if getRetryMessage()}
        <p class="retry-info">{getRetryMessage()}</p>
      {/if}
      <button 
        on:click={retryConnection} 
        class="retry-btn"
        disabled={status.isChecking || status.isRetrying}
      >
        {status.isRetrying ? 'Retrying...' : 'Retry Connection'}
      </button>
    </div>
  {/if}

  {#if status.latency !== null}
    <div class="latency">Latency: {status.latency}ms</div>
  {/if}

  {#if status.lastCheck}
    <div class="last-check">Last check: {status.lastCheck.toLocaleTimeString()}</div>
  {/if}

  <button 
    on:click={checkConnection} 
    disabled={status.isChecking || status.isRetrying} 
    class="check-btn"
  >
    {status.isChecking || status.isRetrying ? 'Checking...' : 'Check Connection'}
  </button>
</div>

<style>
  .connection-status {
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin: 1rem 0;
    background-color: #fafafa;
    position: relative;
  }

  .status-indicator {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  .connected {
    color: #28a745;
  }

  .disconnected {
    color: #dc3545;
  }

  .checking {
    color: #ffc107;
  }

  .stable {
    color: #28a745;
    font-weight: bold;
  }

  .unstable {
    color: #ffc107;
    font-weight: bold;
  }

  .offline {
    color: #dc3545;
    font-weight: bold;
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .stability-indicator {
    font-size: 0.9rem;
    margin: 0.25rem 0;
    color: #6c757d;
  }

  .error-message {
    color: #dc3545;
    margin: 0.5rem 0;
    padding: 0.5rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .error-message p {
    margin: 0 0 0.5rem 0;
  }

  .retry-info {
    font-size: 0.85rem;
    margin: 0.25rem 0 0 0;
    font-style: italic;
  }

  .latency, .last-check {
    font-size: 0.9rem;
    color: #6c757d;
    margin: 0.25rem 0;
  }

  .retry-btn, .check-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .retry-btn:hover, .check-btn:hover {
    background-color: #0056b3;
  }

  .retry-btn:disabled, .check-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
</style>