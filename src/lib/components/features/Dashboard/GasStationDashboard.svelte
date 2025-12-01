<script lang="ts">
  import type { PluginState } from '$lib/types/plugins';
  import { plugins } from '$lib/stores/plugins';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // Gas station specific dashboard state
  let fuelInventory = $state([
    { id: 1, name: 'Regular Unleaded', level: 85, capacity: 10000, status: 'normal' },
    { id: 2, name: 'Premium Unleaded', level: 65, capacity: 8000, status: 'normal' },
    { id: 3, name: 'Diesel', level: 45, capacity: 12000, status: 'low' }
  ]);

  let pumpStatus = $state([
    { id: 1, name: 'Pump 1', status: 'available', fuelType: 'Regular Unleaded' },
    { id: 2, name: 'Pump 2', status: 'occupied', fuelType: 'Premium Unleaded' },
    { id: 3, name: 'Pump 3', status: 'maintenance', fuelType: 'Diesel' },
    { id: 4, name: 'Pump 4', status: 'available', fuelType: 'Regular Unleaded' }
  ]);

  let salesMetrics = $state({
    today: 12450.75,
    week: 89320.50,
    month: 342150.25,
    growth: 12.5
  });

  let activePlugins = $state<PluginState[]>([]);
  let user = $state<string | null>(null);

  // Initialize dashboard data
  onMount(async () => {
    const authState = $auth;
    if (!authState.isAuthenticated) {
      await goto('/auth');
      return;
    }
    user = authState.user?.name || null;

    // Load plugin registry and filter active plugins
    await plugins.load();
    
    // Subscribe to plugin store updates
    $effect(() => {
      const registry = $plugins;
      activePlugins = Object.values(registry).filter(plugin => plugin.enabled);
    });
  });

  // Calculate fuel level percentage
  function getFuelLevelPercentage(level: number, capacity: number): number {
    return Math.round((level / capacity) * 100);
  }

  // Get status color based on level
  function getStatusColor(level: number, capacity: number): string {
    const percentage = getFuelLevelPercentage(level, capacity);
    if (percentage < 20) return 'var(--danger-color, #dc3545)';
    if (percentage < 40) return 'var(--warning-color, #ffc107)';
    return 'var(--success-color, #28a745)';
  }

  // Get pump status color
  function getPumpStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'var(--success-color, #28a745)';
      case 'occupied': return 'var(--primary-color, #007bff)';
      case 'maintenance': return 'var(--danger-color, #dc3545)';
      default: return 'var(--secondary-color, #6c757d)';
    }
  }
</script>

<div class="gas-station-dashboard">
  <div class="dashboard-header">
    <h1>Gas Station Dashboard</h1>
    <p>Welcome back, {user}! Here's your station overview.</p>
  </div>

  <!-- Sales Metrics -->
  <section class="dashboard-section">
    <h2>Sales Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${salesMetrics.today.toLocaleString()}</div>
        <div class="metric-label">Today's Sales</div>
        <div class="metric-change">+{salesMetrics.growth}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${salesMetrics.week.toLocaleString()}</div>
        <div class="metric-label">This Week</div>
        <div class="metric-change">+8.2%</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${salesMetrics.month.toLocaleString()}</div>
        <div class="metric-label">This Month</div>
        <div class="metric-change">+5.7%</div>
      </div>
    </div>
  </section>

  <!-- Fuel Inventory -->
  <section class="dashboard-section">
    <h2>Fuel Inventory</h2>
    <div class="inventory-grid">
      {#each fuelInventory as fuel (fuel.id)}
        <div class="inventory-card">
          <div class="inventory-header">
            <h3>{fuel.name}</h3>
            <span class="inventory-status" style="color: {getStatusColor(fuel.level, fuel.capacity)}">
              {getFuelLevelPercentage(fuel.level, fuel.capacity)}% remaining
            </span>
          </div>
          <div class="inventory-progress">
            <div 
              class="progress-bar" 
              style="width: {getFuelLevelPercentage(fuel.level, fuel.capacity)}%; background-color: {getStatusColor(fuel.level, fuel.capacity)}"
            ></div>
          </div>
          <div class="inventory-details">
            <span>Level: {fuel.level}L</span>
            <span>Capacity: {fuel.capacity}L</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Pump Status -->
  <section class="dashboard-section">
    <h2>Pump Status</h2>
    <div class="pumps-grid">
      {#each pumpStatus as pump (pump.id)}
        <div class="pump-card">
          <div class="pump-header">
            <h3>{pump.name}</h3>
            <span class="pump-status" style="color: {getPumpStatusColor(pump.status)}">
              {pump.status}
            </span>
          </div>
          <div class="pump-details">
            <span>Fuel Type: {pump.fuelType}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Active Plugins -->
  {#if activePlugins.length > 0}
    <section class="dashboard-section">
      <h2>Active Plugins</h2>
      <div class="plugins-grid">
        {#each activePlugins as plugin (plugin.manifest.id)}
          <div class="plugin-card">
            <div class="plugin-header">
              <h3>{plugin.manifest.name}</h3>
              <span class="plugin-version">v{plugin.manifest.version}</span>
            </div>
            <p class="plugin-description">{plugin.manifest.description}</p>
            <div class="plugin-meta">
              <span>Author: {plugin.manifest.author}</span>
              <span>Permissions: {plugin.manifest.permissions.length}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .gas-station-dashboard {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .dashboard-header {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, #dee2e6);
  }

  .dashboard-header h1 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #212529);
    font-size: 1.75rem;
  }

  .dashboard-header p {
    margin: 0;
    color: var(--text-secondary, #6c757d);
  }

  .dashboard-section {
    background: var(--card-bg, white);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .dashboard-section h2 {
    margin: 0 0 1rem 0;
    color: var(--text-primary, #212529);
    font-size: 1.25rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .metric-card {
    background: var(--card-bg, white);
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: center;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--text-primary, #212529);
    margin-bottom: 0.5rem;
  }

  .metric-label {
    color: var(--text-secondary, #6c757d);
    margin-bottom: 0.5rem;
  }

  .metric-change {
    color: var(--success-color, #28a745);
    font-weight: 500;
  }

  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .inventory-card {
    background: var(--card-bg, white);
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .inventory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .inventory-header h3 {
    margin: 0;
    color: var(--text-primary, #212529);
  }

  .inventory-status {
    font-weight: 500;
  }

  .inventory-progress {
    height: 0.75rem;
    background-color: var(--progress-bg, #e9ecef);
    border-radius: 0.375rem;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    height: 100%;
    transition: width 0.3s ease;
  }

  .inventory-details {
    display: flex;
    justify-content: space-between;
    color: var(--text-secondary, #6c757d);
    font-size: 0.875rem;
  }

  .pumps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .pump-card {
    background: var(--card-bg, white);
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .pump-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .pump-header h3 {
    margin: 0;
    color: var(--text-primary, #212529);
  }

  .pump-status {
    font-weight: 500;
    text-transform: capitalize;
  }

  .pump-details {
    color: var(--text-secondary, #6c757d);
    font-size: 0.875rem;
  }

  .plugins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .plugin-card {
    background: var(--card-bg, white);
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .plugin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .plugin-header h3 {
    margin: 0;
    color: var(--text-primary, #212529);
  }

  .plugin-version {
    background: var(--secondary-color, #6c757d);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .plugin-description {
    margin: 0.5rem 0;
    color: var(--text-secondary, #6c757d);
    line-height: 1.5;
  }

  .plugin-meta {
    display: flex;
    justify-content: space-between;
    color: var(--text-secondary, #6c757d);
    font-size: 0.75rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .gas-station-dashboard {
      padding: 0.5rem;
    }

    .dashboard-section {
      padding: 1rem;
    }

    .metrics-grid,
    .inventory-grid,
    .pumps-grid,
    .plugins-grid {
      grid-template-columns: 1fr;
    }
  }
</style>