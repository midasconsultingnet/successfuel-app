<script lang="ts">
  import BrickRegistry from '$lib/components/bricks/BrickRegistry.svelte';
</script>

<div class="plugins-layout">
  <header class="plugins-header">
    <h1>Plugin Management</h1>
  </header>

  <main class="plugins-main">
    <BrickRegistry />
    <div class="plugins-content">
      <slot />
    </div>
  </main>
</div>

<style>
  .plugins-layout {
    padding: 1rem;
  }
  
  .plugins-header {
    margin-bottom: 1rem;
  }
  
  .plugins-main {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
</style>