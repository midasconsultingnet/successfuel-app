<script lang="ts">
  // Sample plugin component for demonstration
  let { pluginId = 'sample-plugin' }: { pluginId?: string; } = $props();

  console.log(`Sample plugin ${pluginId} loaded`);

  // Initialize the plugin when component mounts
  if (typeof window !== 'undefined') {
    console.log('Sample plugin initialized');
  }

  // Cleanup function when component unmounts
</script>

<div class="sample-plugin">
  <h2>Sample Plugin</h2>
  <p>This is a sample plugin component demonstrating the plugin architecture.</p>
  
  <div class="plugin-content">
    <p>Plugin ID: {pluginId}</p>
    <p>This component was loaded dynamically by the plugin system.</p>
  </div>
</div>

<style>
  .sample-plugin {
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    background-color: #f8f9fa;
  }
  
  .plugin-content {
    margin-top: 1rem;
  }
</style>