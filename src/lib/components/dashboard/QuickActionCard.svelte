<script lang="ts">
  export let title: string = '';
  export let icon: string = 'info';
  export let color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray' = 'blue';
  export let href: string = '#';

  // Map color to Tailwind classes
  const colorClasses = {
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    green: 'bg-green-100 hover:bg-green-200 text-green-800',
    red: 'bg-red-100 hover:bg-red-200 text-red-800',
    yellow: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
    purple: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
    orange: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
    gray: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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

<a href={href} class="quick-action-card {colorClasses[color]}">
  <div class="action-icon">{iconDisplay}</div>
  <div class="action-title">{title}</div>
</a>

<style>
  .quick-action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .quick-action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-color: currentColor;
  }

  .action-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .action-title {
    font-weight: 500;
    text-align: center;
    color: inherit;
  }
</style>