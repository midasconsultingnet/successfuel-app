<script lang="ts">
  import { plugins } from '$lib/stores/plugins';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  let { expanded = false } = $props();

  // Default menu items
  const defaultMenuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: '📊' },
    { id: 'sales', label: 'Sales', href: '/sales', icon: '💰' },
    { id: 'inventory', label: 'Inventory', href: '/inventory', icon: '📦' },
    { id: 'customers', label: 'Customers', href: '/customers', icon: '👥' },
    { id: 'reports', label: 'Reports', href: '/reports', icon: '📈' },
    { id: 'plugins', label: 'Plugins', href: '/plugins', icon: '🔌' },
  ];

  let menuItems = $state([...defaultMenuItems]);

  // Load plugins and update menu items
  onMount(async () => {
    await plugins.load();

    // Subscribe to plugin navigation items
    $effect(() => {
      const navItems = $plugins.navigationItems;
      // Combine default items with plugin navigation items
      menuItems = [...defaultMenuItems, ...navItems];
    });
  });

  const dispatch = createEventDispatcher();
</script>

<aside class={`sidebar ${expanded ? 'expanded' : ''}`}>
  <div class="sidebar-header">
    <div class="logo">
      {#if expanded}
        <h2>SuccessFuel ERP</h2>
      {:else}
        <span class="logo-initial">S</span>
      {/if}
    </div>

    <button
      class="toggle-btn"
      on:click={() => dispatch('toggle')}
      aria-label="Toggle sidebar"
    >
      {#if expanded}
        «
      {:else}
        »
      {/if}
    </button>
  </div>

  <nav class="sidebar-nav">
    <ul class="menu-list">
      {#each menuItems as item (item.id)}
        <li class="menu-item">
          <a href={item.href} class="menu-link">
            <span class="menu-icon">{item.icon}</span>
            {#if expanded}
              <span class="menu-label">{item.label}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="sidebar-footer">
    {#if expanded}
      <div class="footer-info">
        <p>SuccessFuel ERP v0.1.0</p>
      </div>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: var(--sidebar-width-collapsed, 60px);
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    color: white;
    height: 100vh;
    position: fixed;
    transition: width 0.3s ease;
    z-index: 900;
    display: flex;
    flex-direction: column;
  }

  .sidebar.expanded {
    width: var(--sidebar-width-expanded, 250px);
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .logo h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .logo-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: #3498db;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
  }

  .toggle-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    width: 2rem;
    height: 2rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .toggle-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .menu-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    flex: 1;
  }

  .menu-item {
    margin: 0.25rem 0.5rem;
  }

  .menu-link {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
    gap: 0.75rem;
  }

  .menu-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .menu-link.active {
    background-color: #3498db;
    color: white;
  }

  .menu-icon {
    font-size: 1.25rem;
    min-width: 24px;
    text-align: center;
  }

  .menu-label {
    flex: 1;
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-info {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .footer-info p {
    margin: 0.25rem 0;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .sidebar {
      width: var(--sidebar-width-collapsed, 60px);
    }
    
    .sidebar.expanded {
      width: 70vw; /* On mobile, expanded sidebar takes most of the screen */
      max-width: 300px;
    }
  }
</style>