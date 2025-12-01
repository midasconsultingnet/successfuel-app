<script lang="ts">
  import { onMount } from 'svelte';
  import { plugins } from '$lib/stores/plugins';
  import { auth } from '$lib/stores/auth';
  import type { PluginState } from '$lib/types/plugins';
  
  // Gas station specific dashboard widgets
  let activePlugins = $state<PluginState[]>([]);
  let salesData = $state({ today: 0, week: 0, month: 0 });
  let fuelInventory = $state([
    { type: 'Regular', capacity: 10000, current: 7800, percentage: 78 },
    { type: 'Premium', capacity: 8000, current: 5600, percentage: 70 },
    { type: 'Diesel', capacity: 12000, current: 9200, percentage: 77 }
  ]);
  let pumpStatus = $state([
    { id: 1, status: 'available', fuelType: 'Regular' },
    { id: 2, status: 'available', fuelType: 'Regular' },
    { id: 3, status: 'in-use', fuelType: 'Premium' },
    { id: 4, status: 'maintenance', fuelType: 'Diesel' },
    { id: 5, status: 'available', fuelType: 'Premium' },
    { id: 6, status: 'available', fuelType: 'Diesel' }
  ]);
  
  onMount(() => {
    // Subscribe to plugins store to get active plugins
    const unsubscribe = plugins.subscribe(pluginRegistry => {
      activePlugins = Object.values(pluginRegistry).filter(plugin => plugin.enabled);
    });
    
    // Load initial data
    loadDashboardData();
    
    // Cleanup subscription
    return () => unsubscribe();
  });
  
  async function loadDashboardData() {
    // Simulate loading dashboard data
    // In a real implementation, this would call API endpoints
    salesData = {
      today: 12450.75,
      week: 89230.50,
      month: 387650.25
    };
  }
  
  function getPumpStatusColor(status: string): string {
    switch(status) {
      case 'available': return 'bg-success';
      case 'in-use': return 'bg-warning';
      case 'maintenance': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
  
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<div class="gas-station-dashboard">
  <h1 class="dashboard-title">Gas Station Dashboard</h1>
  
  <!-- Sales Overview Cards -->
  <div class="sales-overview">
    <div class="card">
      <h3>Today's Sales</h3>
      <p class="metric">{formatCurrency(salesData.today)}</p>
      <div class="trend positive">↑ 12% from yesterday</div>
    </div>
    
    <div class="card">
      <h3>Week's Sales</h3>
      <p class="metric">{formatCurrency(salesData.week)}</p>
      <div class="trend positive">↑ 8% from last week</div>
    </div>
    
    <div class="card">
      <h3>Month's Sales</h3>
      <p class="metric">{formatCurrency(salesData.month)}</p>
      <div class="trend positive">↑ 5% from last month</div>
    </div>
  </div>
  
  <!-- Fuel Inventory Section -->
  <div class="inventory-section">
    <h2>Fuel Inventory</h2>
    <div class="inventory-grid">
      {#each fuelInventory as fuel (fuel.type)}
        <div class="inventory-card">
          <h4>{fuel.type} Fuel</h4>
          <div class="fuel-level">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                style={`width: ${fuel.percentage}%; background-color: ${fuel.percentage > 30 ? '#28a745' : '#ffc107'};`}
              ></div>
            </div>
            <div class="fuel-stats">
              <span>{fuel.current}L / {fuel.capacity}L</span>
              <span>{fuel.percentage}%</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Pump Status Section -->
  <div class="pump-status-section">
    <h2>Pump Status</h2>
    <div class="pump-grid">
      {#each pumpStatus as pump (pump.id)}
        <div class="pump-card">
          <div class="pump-id">Pump #{pump.id}</div>
          <div class="pump-fuel-type">{pump.fuelType}</div>
          <div class={`pump-status ${getPumpStatusColor(pump.status)}`}>
            {pump.status}
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Active Plugins Section -->
  <div class="plugins-section">
    <h2>Active Modules</h2>
    <div class="plugins-grid">
      {#each activePlugins as plugin (plugin.manifest.id)}
        <div class="plugin-card">
          <h4>{plugin.manifest.name}</h4>
          <p>{plugin.manifest.description}</p>
          <div class="plugin-meta">
            <span class="version">v{plugin.manifest.version}</span>
            <span class="author">by {plugin.manifest.author}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .gas-station-dashboard {
    padding: 1.5rem;
  }
  
  .dashboard-title {
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-size: 1.75rem;
  }
  
  .sales-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid #e9ecef;
  }
  
  .card h3 {
    margin: 0 0 0.75rem 0;
    color: #495057;
    font-size: 1rem;
  }
  
  .metric {
    font-size: 1.75rem;
    font-weight: bold;
    color: #007bff;
    margin: 0.25rem 0;
  }
  
  .trend {
    font-size: 0.875rem;
    margin: 0.5rem 0 0 0;
  }
  
  .trend.positive {
    color: #28a745;
  }
  
  .trend.negative {
    color: #dc3545;
  }
  
  .inventory-section, .pump-status-section, .plugins-section {
    margin-bottom: 2rem;
  }
  
  .inventory-section h2, 
  .pump-status-section h2, 
  .plugins-section h2 {
    margin-bottom: 1rem;
    color: #2c3e50;
    border-bottom: 2px solid #dee2e6;
    padding-bottom: 0.5rem;
  }
  
  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .inventory-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid #e9ecef;
  }
  
  .fuel-level {
    margin-top: 1rem;
  }
  
  .progress-bar {
    width: 100%;
    height: 1.25rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  
  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .fuel-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .pump-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .pump-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
  }
  
  .pump-id {
    font-weight: bold;
    color: #495057;
    margin-bottom: 0.5rem;
  }
  
  .pump-fuel-type {
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .pump-status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .plugins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .plugin-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
  }
  
  .plugin-card h4 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }
  
  .plugin-card p {
    margin: 0 0 0.75rem 0;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .plugin-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6c757d;
  }
</style>