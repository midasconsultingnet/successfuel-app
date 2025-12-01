<script lang="ts">
  import { goto } from '$app/navigation';

  let { 
    title, 
    icon = undefined, 
    path, 
    description = undefined, 
    disabled = false 
  }: { 
    title: string; 
    icon?: string; 
    path: string; 
    description?: string; 
    disabled?: boolean; 
  } = $props<{ 
    title: string; 
    icon?: string; 
    path: string; 
    description?: string; 
    disabled?: boolean; 
  }>();

  async function navigate() {
    if (!disabled) {
      await goto(path);
    }
  }
</script>

<button class="quick-action-card" class:disabled on:click={navigate}>
  {#if icon}
    <div class="icon">{icon}</div>
  {/if}
  <div class="content">
    <h3 class="title">{title}</h3>
    {#if description}
      <p class="description">{description}</p>
    {/if}
  </div>
</button>

<style>
  .quick-action-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    display: flex;
    align-items: center;
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
    border: 1px solid #e9ecef;
    cursor: pointer;
    text-align: left;
  }

  .quick-action-card:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    background-color: #f8f9fa;
  }

  .quick-action-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    font-size: 1.5rem;
    margin-right: 1rem;
    color: #007bff;
  }

  .content {
    flex: 1;
  }

  .title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.25rem 0;
  }

  .description {
    color: #6c757d;
    margin: 0;
    font-size: 0.875rem;
  }
</style>