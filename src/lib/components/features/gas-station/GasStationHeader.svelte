<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { t } from '$lib/i18n/i18n';
  import { language, setLanguage } from '$lib/i18n/languageStore';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import type { User } from '$lib/types/auth';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import TranslationNew from '$lib/components/TranslationNew.svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { useI18n } from '$lib/hooks/useI18n';

  let { currentUser = null }: { currentUser?: User | null } = $props<{ currentUser?: User | null }>();

  // Get the i18n context
  const { lang } = useI18n();
  let notifications = $state<any[]>([]);
  let showNotifications = $state(false);
  let showUserProfile = $state(false);
  let activePumpCount = $state(0);
  let lowFuelAlerts = $state(0);

  // Track current language
  let currentLanguage = $state('en');

  $effect(() => {
    currentLanguage = get(language);
  });

  // Reactive translation variables
  let t_reports = $derived(t('nav.reports'));
  let t_settings = $derived(t('nav.settings'));
  let t_notifications = $derived(t('common.notifications'));
  let t_userProfile = $derived(t('common.userProfile'));
  let t_profile = $derived(t('nav.profile'));
  let t_logout = $derived(t('common.logout'));
  let t_markAsRead = $derived(t('common.markAsRead'));
  let t_noNewNotifications = $derived(t('common.noNewNotifications'));

  onMount(() => {
    // Load initial data
    loadNotifications();
    loadSystemStatus();
  });

  function loadNotifications() {
    // Simulate loading notifications
    // In a real implementation, this would call an API
    notifications = [
      { id: 1, message: 'Diesel tank at 20% capacity', type: 'warning', timestamp: new Date() },
      { id: 2, message: 'Pump #4 requires maintenance', type: 'error', timestamp: new Date(Date.now() - 3600000) },
      { id: 3, message: 'Daily sales report ready', type: 'info', timestamp: new Date(Date.now() - 7200000) }
    ];
  }

  function loadSystemStatus() {
    // Simulate loading system status
    // In a real implementation, this would call an API
    activePumpCount = 4;
    lowFuelAlerts = 1;
  }

  async function handleLogout() {
    const authService = await getAuthService();
    await authService.logout();

    // Redirect to login page after logout
    goto('/auth');
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getNotificationIcon(type: string): string {
    switch(type) {
      case 'error': return 'fas fa-exclamation-circle text-danger';
      case 'warning': return 'fas fa-exclamation-triangle text-warning';
      case 'info': return 'fas fa-info-circle text-info';
      default: return 'fas fa-bell text-primary';
    }
  }

  function toggleNotifications() {
    showNotifications = !showNotifications;
    showUserProfile = false; // Close profile dropdown when opening notifications
  }

  function toggleUserProfile() {
    showUserProfile = !showUserProfile;
    showNotifications = false; // Close notifications dropdown when opening profile
  }

  function markAsRead(notificationId: number) {
    // In a real implementation, mark notification as read via API
    notifications = notifications.filter(n => n.id !== notificationId);
  }
</script>

<header class="gas-station-header">
  <div class="header-left">
    <div class="system-status">
      <div class="status-item">
        <i class="fas fa-gas-pump"></i>
        <span class="status-value">{activePumpCount}</span>
        <span class="status-label"><TranslationNew key="gasStation.pumps" /></span>
      </div>
      <div class="status-item warning" class:active={lowFuelAlerts > 0}>
        <i class="fas fa-exclamation-triangle"></i>
        <span class="status-value">{lowFuelAlerts}</span>
        <span class="status-label"><TranslationNew key="gasStation.fuelLevel" /></span>
      </div>
    </div>
  </div>

  <div class="header-right">
    <!-- Quick Actions -->
    <div class="header-actions">
      <button class="action-btn" title={t_reports}>
        <i class="fas fa-file-invoice-dollar"></i>
        <span class="action-label"><TranslationNew key="nav.reports" /></span>
      </button>

      <button class="action-btn" title={t_settings}>
        <i class="fas fa-tachometer-alt"></i>
        <span class="action-label"><TranslationNew key="nav.settings" /></span>
      </button>
    </div>

    <!-- Language Switcher -->
    <div class="language-switcher-container">
      <LanguageSwitcher />
    </div>

    <!-- Notifications -->
    <div class="notification-dropdown" class:open={showNotifications}>
      <button class="notification-btn" onclick={toggleNotifications} title={t_notifications}>
        <i class="fas fa-bell"></i>
        {#if notifications.length > 0}
          <span class="notification-badge">{notifications.length}</span>
        {/if}
      </button>

      {#if showNotifications}
        <div class="notification-panel">
          <div class="panel-header">
            <h3><TranslationNew key="common.notifications" /></h3>
            <button class="panel-close" onclick={() => showNotifications = false}>
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="notification-list">
            {#if notifications.length > 0}
              {#each notifications as notification (notification.id)}
                <div class="notification-item" class:active={notification.type === 'active'} class:warning={notification.type === 'warning'} class:error={notification.type === 'error'} class:info={notification.type === 'info'}>
                  <div class="notification-icon">
                    <i class={getNotificationIcon(notification.type)}></i>
                  </div>
                  <div class="notification-content">
                    <p>{notification.message}</p>
                    <small>{formatTime(notification.timestamp)}</small>
                  </div>
                  <button
                    class="mark-read-btn"
                    onclick={() => markAsRead(notification.id)}
                    title={t_markAsRead}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              {/each}
            {:else}
              <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p><TranslationNew key="common.noNewNotifications" /></p>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- User Profile -->
    <div class="profile-dropdown" class:open={showUserProfile}>
      <button class="profile-btn" onclick={toggleUserProfile} title={t_userProfile}>
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
        {#if currentUser}
          <span class="user-name" class:hidden={!showUserProfile}>{currentUser.login}</span>
        {/if}
        <i class="fas fa-caret-down"></i>
      </button>

      {#if showUserProfile}
        <div class="profile-panel">
          <div class="panel-header">
            <div class="user-info">
              <div class="user-avatar large">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <div class="user-name">{currentUser?.nom || currentUser?.login}</div>
                <div class="user-role"><TranslationNew key="gasStation.userRole" /></div>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <a href="/profile" class="profile-link">
              <i class="fas fa-user-circle"></i>
              <span><TranslationNew key="nav.profile" /></span>
            </a>

            <a href="/settings" class="profile-link">
              <i class="fas fa-cog"></i>
              <span><TranslationNew key="nav.settings" /></span>
            </a>

            <button class="profile-link logout-btn" onclick={handleLogout}>
              <i class="fas fa-sign-out-alt"></i>
              <span><TranslationNew key="common.logout" /></span>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .gas-station-header {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 999;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .system-status {
    display: flex;
    gap: 1.5rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
  }

  .status-item.warning.active {
    background-color: #fff3cd;
    border-color: #ffeaa7;
  }

  .status-item i {
    font-size: 1.25rem;
    color: #6c757d;
  }

  .status-item.warning.active i {
    color: #ffc107;
  }

  .status-value {
    font-weight: bold;
    font-size: 1.1rem;
    color: #495057;
  }

  .status-item.warning.active .status-value {
    color: #ffc107;
  }

  .status-label {
    font-size: 0.75rem;
    color: #6c757d;
    text-transform: uppercase;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }

  .action-btn:hover {
    background-color: #f8f9fa;
    color: #007bff;
  }

  .action-btn i {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .action-label {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .language-switcher-container {
    display: flex;
    align-items: center;
  }

  .notification-dropdown, .profile-dropdown {
    position: relative;
  }

  .notification-btn, .profile-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: #495057;
    cursor: pointer;
    gap: 0.5rem;
    transition: all 0.2s;
    position: relative;
  }

  .notification-btn:hover, .profile-btn:hover {
    background-color: #f8f9fa;
    color: #007bff;
  }

  .notification-badge {
    position: absolute;
    top: -0.25rem;
    right: -0.25rem;
    background-color: #dc3545;
    color: white;
    border-radius: 50%;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #007bff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.875rem;
  }

  .user-avatar.large {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .user-name {
    font-weight: 500;
    margin-right: 0.25rem;
  }

  .notification-panel, .profile-panel {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    width: 300px;
    z-index: 1000;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
  }

  .panel-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .panel-close {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
  }

  .panel-close:hover {
    background-color: #e9ecef;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .notification-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .notification-item {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid #f1f3f5;
    align-items: flex-start;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-item.error {
    border-left: 3px solid #dc3545;
  }

  .notification-item.warning {
    border-left: 3px solid #ffc107;
  }

  .notification-item.info {
    border-left: 3px solid #17a2b8;
  }

  .notification-icon {
    margin-top: 0.25rem;
  }

  .notification-content {
    flex: 1;
  }

  .notification-content p {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
  }

  .notification-content small {
    color: #6c757d;
    font-size: 0.75rem;
  }

  .mark-read-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    margin-top: 0.25rem;
  }

  .mark-read-btn:hover {
    background-color: #e9ecef;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  .empty-state i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
  }

  .profile-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: #495057;
    transition: all 0.2s;
  }

  .profile-link:hover {
    background-color: #f8f9fa;
  }

  .profile-link i {
    width: 20px;
    text-align: center;
  }

  .logout-btn {
    color: #dc3545;
  }

  .logout-btn:hover {
    background-color: #f8d7da;
  }

  .hidden {
    display: none;
  }

  @media (max-width: 768px) {
    .status-label {
      display: none;
    }

    .action-label {
      display: none;
    }

    .user-name:not(.large) {
      display: none;
    }
  }
</style>