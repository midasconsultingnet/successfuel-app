<script lang="ts">
  import GasStationDashboard from '$lib/components/features/Dashboard/GasStationDashboard.svelte';
  import { plugins } from '$lib/stores/plugins';
  import { onMount } from 'svelte';

  // Mock plugin data for the story
  const mockPlugins = [
    {
      manifest: {
        id: 'fuel-pricing',
        name: 'Fuel Pricing Manager',
        version: '1.0.0',
        description: 'Manage fuel pricing and promotions',
        author: 'SuccessFuel Team',
        entry: './FuelPricingPlugin.svelte',
        routes: [
          { path: '/pricing', component: './FuelPricing.svelte' }
        ],
        permissions: ['read:pricing', 'write:pricing'],
        dependencies: [],
        hooks: {}
      },
      enabled: true,
      loaded: true
    },
    {
      manifest: {
        id: 'loyalty-program',
        name: 'Loyalty Program',
        version: '2.1.0',
        description: 'Customer loyalty and rewards system',
        author: 'SuccessFuel Team',
        entry: './LoyaltyPlugin.svelte',
        routes: [
          { path: '/loyalty', component: './LoyaltyProgram.svelte' }
        ],
        permissions: ['read:customers', 'write:rewards'],
        dependencies: [],
        hooks: {}
      },
      enabled: true,
      loaded: true
    }
  ];

  onMount(() => {
    // Initialize mock plugins
    plugins.load();
    mockPlugins.forEach(plugin => {
      plugins.add(plugin);
    });
  });
</script>

<div class="storybook-wrapper">
  <GasStationDashboard />
</div>

<style>
  .storybook-wrapper {
    padding: 1rem;
    background-color: #f8f9fa;
    min-height: 100vh;
  }
</style>