<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  let currentUser = $state<string | null>(null);
  let userEmail = $state<string | null>(null);
  let showUserMenu = $state(false);
  let showNotifications = $state(false);
  let notifications = $state([
    { id: 1, title: 'Low fuel inventory', message: 'Regular unleaded is at 15%', time: '2 min ago', read: false },
    { id: 2, title: 'System update', message: 'New version available', time: '1 hour ago', read: true },
    { id: 3, title: 'Maintenance reminder', message: 'Pump 3 needs maintenance', time: '3 hours ago', read: false }
  ]);

  // Subscribe to auth store to get current user
  $effect(() => {
    const authState = $auth;
    if (authState && authState.user) {
      currentUser = authState.user.name || null;
      userEmail = authState.user.email || null;
    }
  });

  function handleLogout() {
    dispatch('logout');
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
    showNotifications = false; // Close notifications when opening user menu
  }

  function toggleNotifications() {
    showNotifications = !showNotifications;
    showUserMenu = false; // Close user menu when opening notifications
  }

  function markNotificationAsRead(id: number) {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
    }
  }

  function getUnreadCount(): number {
    return notifications.filter(n => !n.read).length;
  }

  const dispatch = createEventDispatcher();
</script>

<header class="header">
  <div class="header-container">
    <div class="logo">
      <h1>SuccessFuel ERP</h1>
    </div>
    
    <nav class="nav">
      <ul class="nav-list">
        <li>
          <button 
            class="notification-btn" 
            on:click={toggleNotifications}
            aria-label="Notifications"
          >
            <span class="notification-icon">🔔</span>
            {#if getUnreadCount() > 0}
              <span class="notification-badge">{getUnreadCount()}</span>
            {/if}
          </button>
          
          {#if showNotifications}
            <div class="dropdown notifications-dropdown">
              <div class="dropdown-header">
                <h3>Notifications</h3>
                <button class="mark-all-read">Mark all read</button>
              </div>
              <ul class="notifications-list">
                {#each notifications as notification (notification.id)}
                  <li 
                    class="notification-item {notification.read ? '' : 'unread'}"
                    on:click={() => markNotificationAsRead(notification.id)}
                  >
                    <div class="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span class="notification-time">{notification.time}</span>
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </li>
        
        {#if currentUser}
          <li class="user-menu-container">
            <button 
              class="user-menu-btn" 
              on:click={toggleUserMenu}
              aria-label="User menu"
            >
              <span class="user-initial">{currentUser?.charAt(0) || 'U'}</span>
              {#if showUserMenu}
                <span class="user-name">{currentUser}</span>
              {/if}
            </button>
            
            {#if showUserMenu}
              <div class="dropdown user-dropdown">
                <div class="user-profile">
                  <span class="user-initial-large">{currentUser?.charAt(0) || 'U'}</span>
                  <div class="user-info">
                    <h3>{currentUser}</h3>
                    <p>{userEmail}</p>
                  </div>
                </div>
                
                <ul class="user-menu-list">
                  <li><a href="/profile">Profile</a></li>
                  <li><a href="/settings">Settings</a></li>
                  <li><a href="/help">Help & Support</a></li>
                  <li class="divider"></li>
                  <li><button on:click={handleLogout} class="logout-btn">Logout</button></li>
                </ul>
              </div>
            {/if}
          </li>
        {/if}
      </ul>
    </nav>
  </div>
</header>

<style>
  .header {
    background-color: var(--header-bg, #f8f9fa);
    border-bottom: 1px solid var(--border-color, #dee2e6);
    padding: 0.5rem 1rem;
    position: sticky;
    top: 0;
    z-index: 800;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--primary-color, #007bff);
  }

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;
    align-items: center;
  }

  .notification-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    color: var(--text-secondary, #6c757d);
  }

  .notification-btn:hover {
    background-color: var(--hover-bg, #e9ecef);
    color: var(--text-primary, #212529);
  }

  .notification-icon {
    font-size: 1.25rem;
  }

  .notification-badge {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    background-color: var(--danger-color, #dc3545);
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

  .user-menu-container {
    position: relative;
  }

  .user-menu-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .user-menu-btn:hover {
    background-color: var(--hover-bg, #e9ecef);
  }

  .user-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background-color: var(--primary-color, #007bff);
    color: white;
    border-radius: 50%;
    font-weight: bold;
  }

  .user-name {
    display: none;
    margin-left: 0.25rem;
    color: var(--text-primary, #212529);
  }

  .user-menu-container:hover .user-name {
    display: block;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 250px;
  }

  .notifications-dropdown {
    min-width: 350px;
  }

  .dropdown-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color, #dee2e6);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dropdown-header h3 {
    margin: 0;
    color: var(--text-primary, #212529);
  }

  .mark-all-read {
    background: none;
    border: none;
    color: var(--primary-color, #007bff);
    cursor: pointer;
    font-weight: 500;
  }

  .notifications-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
  }

  .notification-item {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color, #dee2e6);
    cursor: pointer;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-item:hover {
    background-color: var(--hover-bg, #f8f9fa);
  }

  .notification-item.unread {
    background-color: rgba(0, 123, 255, 0.05);
    border-left: 3px solid var(--primary-color, #007bff);
  }

  .notification-content h4 {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary, #212529);
  }

  .notification-content p {
    margin: 0 0 0.25rem 0;
    color: var(--text-secondary, #6c757d);
    font-size: 0.875rem;
  }

  .notification-time {
    font-size: 0.75rem;
    color: var(--text-muted, #868e96);
  }

  .user-profile {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color, #dee2e6);
  }

  .user-initial-large {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background-color: var(--primary-color, #007bff);
    color: white;
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: bold;
    margin-right: 1rem;
  }

  .user-info h3 {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary, #212529);
  }

  .user-info p {
    margin: 0;
    color: var(--text-secondary, #6c757d);
    font-size: 0.875rem;
  }

  .user-menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .user-menu-list li {
    padding: 0;
  }

  .user-menu-list a,
  .user-menu-list button {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: var(--text-primary, #212529);
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
  }

  .user-menu-list a:hover,
  .user-menu-list button:hover {
    background-color: var(--hover-bg, #f8f9fa);
  }

  .divider {
    height: 1px;
    background-color: var(--border-color, #dee2e6);
    margin: 0.25rem 0;
  }

  .logout-btn {
    color: var(--danger-color, #dc3545);
    font-weight: 500;
  }

  .logout-btn:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .header-container {
      padding: 0 0.5rem;
    }

    .nav-list {
      gap: 0.5rem;
    }

    .notifications-dropdown {
      min-width: 300px;
      right: -50px;
    }

    .dropdown {
      min-width: 200px;
    }
  }
</style>