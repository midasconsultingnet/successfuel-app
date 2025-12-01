<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ComponentProps } from 'svelte';

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    class: className = ''
  } = $props<{
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
  }>();

  let buttonClass = $derived(
    `btn btn-${variant} btn-${size} ${disabled ? 'btn-disabled' : ''} ${className}`.trim()
  );

  // Create event dispatcher for click events
  const dispatch = createEventDispatcher<{ click: MouseEvent }>();

  function handleClick(e: MouseEvent) {
    dispatch('click', e);
  }
</script>

<button
  type={type}
  class={buttonClass}
  disabled={disabled}
  onclick={handleClick}
>
  <slot />
</button>

<style>
  .btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    font-size: 1rem;
    line-height: 1.5;
    transition: all 0.2s ease-in-out;
    outline: none;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  
  .btn-danger {
    background-color: #dc3545;
    color: white;
  }
  
  .btn-success {
    background-color: #28a745;
    color: white;
  }
  
  .btn-sm { font-size: 0.875rem; padding: 0.25rem 0.5rem; }
  .btn-lg { font-size: 1.25rem; padding: 0.5rem 1rem; }
  
  .btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn:hover:not(.btn-disabled) {
    opacity: 0.9;
  }
</style>