<script lang="ts">
  let { 
    title, 
    value, 
    subtitle, 
    icon = undefined, 
    color = 'blue', 
    loading = false 
  }: { 
    title: string; 
    value: string | number; 
    subtitle: string; 
    icon?: string; 
    color?: 'blue' | 'green' | 'yellow' | 'red'; 
    loading?: boolean; 
  } = $props<{ 
    title: string; 
    value: string | number; 
    subtitle: string; 
    icon?: string; 
    color?: 'blue' | 'green' | 'yellow' | 'red'; 
    loading?: boolean; 
  }>();
</script>

<div class="kpi-card" class:loading class:color>
  {#if icon}
    <div class="icon">{icon}</div>
  {/if}
  <div class="content">
    <h3 class="title">{title}</h3>
    {#if loading}
      <div class="value loading-placeholder"></div>
    {:else}
      <div class="value">{value}</div>
    {/if}
    <p class="subtitle">{subtitle}</p>
  </div>
</div>

<style>
  .kpi-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    display: flex;
    align-items: center;
    transition: transform 0.2s, box-shadow 0.2s;
    border-left: 4px solid var(--color-blue);
    position: relative;
  }

  .kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }

  .kpi-card.color.green {
    border-left-color: var(--color-green);
  }

  .kpi-card.color.yellow {
    border-left-color: var(--color-yellow);
  }

  .kpi-card.color.red {
    border-left-color: var(--color-red);
  }

  .icon {
    font-size: 2rem;
    margin-right: 1rem;
    color: var(--color-blue);
  }

  .kpi-card.color.green .icon {
    color: var(--color-green);
  }

  .kpi-card.color.yellow .icon {
    color: var(--color-yellow);
  }

  .kpi-card.color.red .icon {
    color: var(--color-red);
  }

  .content {
    flex: 1;
  }

  .title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  .loading-placeholder {
    height: 2.5rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    animation: pulse 1.5s infinite;
  }

  .subtitle {
    color: #6c757d;
    margin: 0;
    font-size: 0.875rem;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  :global(:root) {
    --color-blue: #007bff;
    --color-green: #28a745;
    --color-yellow: #ffc107;
    --color-red: #dc3545;
  }
</style>