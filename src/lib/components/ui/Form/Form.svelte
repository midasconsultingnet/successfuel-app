<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let {
    onSubmit,
    class: className = ''
  } = $props<{
    onSubmit?: (event: Event) => void;
    class?: string;
  }>();

  let formClass = $derived(
    ['form', className].filter(Boolean).join(' ')
  );

  const dispatch = createEventDispatcher();

  function handleSubmit(event: Event) {
    if (onSubmit) {
      onSubmit(event);
    }
    dispatch('submit', event);
  }
</script>

<form class={formClass} onsubmit={handleSubmit}>
  <slot />
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>