<script lang="ts">
  export interface ActivityItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    icon?: string;
  }

  export let activities: ActivityItem[] = [];
  export let title: string = 'Recent Activity';
  export let loading: boolean = false;
</script>

<div class="recent-activity">
  <h2 class="title">{title}</h2>

  {#if loading}
    <div class="loading-container">
      {#each [1, 2, 3] as _}
        <div class="activity-item loading">
          <div class="activity-icon loading-placeholder"></div>
          <div class="activity-content">
            <div class="activity-title loading-placeholder"></div>
            <div class="activity-description loading-placeholder"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if activities.length > 0}
    <div class="activities-list">
      {#each activities as activity (activity.id)}
        <div class="activity-item" class:type-info={activity.type === 'info'} class:type-success={activity.type === 'success'} class:type-warning={activity.type === 'warning'} class:type-error={activity.type === 'error'}>
          {#if activity.icon}
            <div class="activity-icon">{activity.icon}</div>
          {/if}
          <div class="activity-content">
            <h3 class="activity-title">{activity.title}</h3>
            <p class="activity-description">{activity.description}</p>
            <span class="activity-time">{activity.time}</span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-activities">
      <p>No recent activity</p>
    </div>
  {/if}
</div>

<style>
  .recent-activity {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .title {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem;
    border-radius: 0.25rem;
    border-left: 3px solid #007bff;
  }

  .activity-item.type-success {
    border-left-color: #28a745;
  }

  .activity-item.type-warning {
    border-left-color: #ffc107;
  }

  .activity-item.type-error {
    border-left-color: #dc3545;
  }

  .activity-icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
    color: #007bff;
    min-width: 24px;
    text-align: center;
  }

  .activity-item.type-success .activity-icon {
    color: #28a745;
  }

  .activity-item.type-warning .activity-icon {
    color: #ffc107;
  }

  .activity-item.type-error .activity-icon {
    color: #dc3545;
  }

  .activity-content {
    flex: 1;
  }

  .activity-title {
    margin: 0 0 0.25rem 0;
    font-weight: 600;
    color: #333;
  }

  .activity-description {
    margin: 0 0 0.25rem 0;
    color: #6c757d;
    font-size: 0.875rem;
  }

  .activity-time {
    font-size: 0.75rem;
    color: #adb5bd;
    text-transform: uppercase;
  }

  .no-activities {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .loading .activity-item {
    opacity: 0.7;
  }

  .loading-placeholder {
    height: 1rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    animation: pulse 1.5s infinite;
  }

  .activity-title.loading-placeholder {
    width: 70%;
  }

  .activity-description.loading-placeholder {
    width: 90%;
    margin-top: 0.5rem;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
</style>