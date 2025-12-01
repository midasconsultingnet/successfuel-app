<script lang="ts">
  import { onMount } from 'svelte';
  import { connection } from '$lib/stores/connection';
  import { get } from 'svelte/store';

  // Component props using $props() for Svelte 5 runes mode
  let { 
    showNotifications = true, 
    position = 'top-right' 
  } = $props<{
    showNotifications?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }>();

  let isConnected = $state(true);
  let notifications = $state<any[]>([]);

  // Initialize component
  onMount(() => {
    // Subscribe to connection store
    const unsubscribe = connection.subscribe(connState => {
      const wasConnected = isConnected;
      isConnected = connState.isConnected;

      // Add notification when connection status changes
      if (wasConnected !== isConnected && showNotifications) {
        const notification = {
          id: Date.now(),
          type: isConnected ? 'success' : 'error',
          message: isConnected 
            ? 'Connection restored!' 
            : 'Connection lost. Working offline.',
          timestamp: new Date()
        };

        // Add to notifications
        notifications = [notification, ...notifications.slice(0, 4)]; // Keep only 5 latest

        // Remove notification after delay
        setTimeout(() => {
          notifications = notifications.filter(n => n.id !== notification.id);
        }, 5000);
      }
    });

    return unsubscribe;
  });
</script>

{#if showNotifications && notifications.length > 0}
  <div class={`connection-notifications notifications-${position}`}>
    {#each notifications as notification (notification.id)}
      <div class={`notification notification-${notification.type}`}>
        <div class="notification-content">
          <span class="notification-message">{notification.message}</span>
          <button 
            class="notification-close"
            on:click={() => notifications = notifications.filter(n => n.id !== notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .connection-notifications {
    position: fixed;
    z-index: 9999;
    padding: 0.5rem;
  }

  .notifications-top-right {
    top: 1rem;
    right: 1rem;
  }

  .notifications-top-left {
    top: 1rem;
    left: 1rem;
  }

  .notifications-bottom-right {
    bottom: 1rem;
    right: 1rem;
  }

  .notifications-bottom-left {
    bottom: 1rem;
    left: 1rem;
  }

  .notification {
    width: 300px;
    margin-bottom: 0.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .notification-success {
    background-color: #d4edda;
    border-left: 4px solid #28a745;
    color: #155724;
  }

  .notification-error {
    background-color: #f8d7da;
    border-left: 4px solid #dc3545;
    color: #721c24;
  }

  .notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
  }

  .notification-message {
    flex: 1;
    font-size: 0.9rem;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: inherit;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-close:hover {
    opacity: 0.7;
  }
</style>