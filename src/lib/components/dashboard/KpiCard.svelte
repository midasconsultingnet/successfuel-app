<script lang="ts">
  export let title: string = '';
  export let value: string = '';
  export let description: string = '';
  export let icon: string = 'info';
  export let color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray' = 'blue';
  export let trend: string = '';

  // Map color to Tailwind classes
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  // Map icon to actual icons
  const iconMap: Record<string, string> = {
    'gas-pump': '⛽',
    'gas': '⛽',
    'dollar-sign': '💵',
    'receipt': '🧾',
    'users': '👥',
    'chart': '📊',
    'info': 'ℹ️',
    'settings': '⚙️',
    'package': '📦',
    'wrench': '🔧',
    'file-text': '📄'
  };

  const iconDisplay = iconMap[icon] || iconMap['info'];
</script>

<div class="kpi-card {colorClasses[color]}">
  <div class="kpi-header">
    <div class="kpi-icon">{iconDisplay}</div>
    <div class="kpi-title">{title}</div>
  </div>
  <div class="kpi-value">{value}</div>
  <div class="kpi-description">{description}</div>
  {#if trend}
    <div class="kpi-trend">{trend}</div>
  {/if}
</div>

<style>
  .kpi-card {
    border: 1px solid;
    border-radius: 0.5rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .kpi-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .kpi-icon {
    font-size: 1.5rem;
  }

  .kpi-title {
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .kpi-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .kpi-description {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .kpi-trend {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    background-color: rgba(255, 255, 255, 0.5);
    display: inline-block;
    width: fit-content;
  }
</style>