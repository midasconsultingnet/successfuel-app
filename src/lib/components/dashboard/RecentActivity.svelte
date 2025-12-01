<script lang="ts">
  import { language } from '$lib/stores/language';
  
  export let title: string = '';
  export let activities: any[] = [];
  export let formatCurrency: (amount: number) => string = (amount) => `$${amount}`;
  export let formatDate: (date: Date) => string = (date) => date.toLocaleTimeString();

  let currentLanguage = $state('en');

  // Subscribe to language changes
  $effect(() => {
    const unsubscribe = language.subscribe(lang => {
      currentLanguage = lang;
    });
    return () => unsubscribe();
  });

  const activityIcons: Record<string, string> = {
    sale: '💰',
    maintenance: '🔧',
    alert: '⚠️',
    fuel: '⛽',
    payment: '💳'
  };

  function getActivityIcon(type: string): string {
    return activityIcons[type] || 'ℹ️';
  }

  function getActivityColor(type: string): string {
    switch (type) {
      case 'sale': return 'text-green-600';
      case 'maintenance': return 'text-blue-600';
      case 'alert': return 'text-red-600';
      case 'fuel': return 'text-yellow-600';
      case 'payment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  }
</script>

<div class="recent-activity-card">
  <h3 class="activity-title">{title}</h3>
  <div class="activity-list">
    {#if activities.length > 0}
      {#each activities as activity (activity.id)}
        <div class="activity-item">
          <div class="activity-icon {getActivityColor(activity.type)}">
            {getActivityIcon(activity.type)}
          </div>
          <div class="activity-content">
            <div class="activity-message">{activity.message}</div>
            <div class="activity-time">{formatDate(activity.time)}</div>
          </div>
          {#if activity.amount !== null}
            <div class="activity-amount">{formatCurrency(activity.amount)}</div>
          {/if}
        </div>
      {/each}
    {:else}
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No recent activity</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .recent-activity-card {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .activity-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 1rem 0;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .activity-icon {
    font-size: 1.5rem;
    min-width: 2rem;
  }

  .activity-content {
    flex: 1;
  }

  .activity-message {
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .activity-time {
    font-size: 0.75rem;
    color: #64748b;
  }

  .activity-amount {
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 0;
    color: #64748b;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin: 0;
  }
</style>