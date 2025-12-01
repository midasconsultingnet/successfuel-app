<script lang="ts">
  import type { Message } from '$lib/types/error';

  let { message }: { message: Message } = $props();
  let shouldDisplay = $state(false);
  let translatedMessage = $state('');

  $effect(() => {
    // Only display if message exists and has content
    if (message && message.message) {
      translatedMessage = message.message;
      shouldDisplay = true;
    } else {
      shouldDisplay = false;
    }
  });
</script>

{#if shouldDisplay}
<div class="error-display">
  <div class="error-content">
    <h3>{translatedMessage}</h3>
    {#if message?.action}
      <button class="action-button" on:click={message.action.onClick}>
        {message.action.label}
      </button>
    {/if}
  </div>
</div>
{/if}

<style>
  .error-display {
    padding: 1rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    border-radius: 0.375rem;
    margin: 0.5rem 0;
  }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .action-button {
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .action-button:hover {
    background-color: #c82333;
  }
</style>