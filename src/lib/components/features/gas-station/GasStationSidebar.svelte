<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import { plugins } from '$lib/stores/plugins';
  import type { User, PluginState } from '$lib/types/auth';
  import type { PluginManifest } from '$lib/types/plugins';
  import { t } from '$lib/i18n/i18n';
  import { language } from '$lib/i18n/languageStore';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { useI18n } from '$lib/hooks/useI18n';
  import TranslationNew from '$lib/components/TranslationNew.svelte';

  let { expanded = true, currentPath = '/dashboard' }: { expanded?: boolean; currentPath?: string; } = $props<{ expanded?: boolean; currentPath?: string; }>();
  let currentUser = $state<User | null>(null);
  let activePlugins = $state<PluginState[]>([]);
  let menuItems = $state<any[]>([]);

  // Get the i18n context
  const { lang } = useI18n();

  // Create dispatcher for custom events
  const dispatch = createEventDispatcher();

  // Reactive navigation items with translations
  let defaultMenuItems = $derived([
    { id: 'dashboard', key: 'nav.dashboard', href: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'pumps', key: 'nav.pumps', href: '/pumps', icon: 'fas fa-gas-pump' },
    { id: 'inventory', key: 'nav.inventory', href: '/inventory', icon: 'fas fa-boxes' },
    { id: 'sales', key: 'nav.sales', href: '/sales', icon: 'fas fa-chart-line' },
    { id: 'reports', key: 'nav.reports', href: '/reports', icon: 'fas fa-file-alt' },
    { id: 'settings', key: 'nav.settings', href: '/settings', icon: 'fas fa-cog' }
  ]);

  // Subscribe to plugin state for plugin-based navigation
  $effect(() => {
    const unsubscribePlugins = plugins.subscribe((registry) => {
      // Get active plugins with navigation items
      const activePluginsList = Object.values(registry).filter(
        plugin => plugin.enabled && plugin.loaded && plugin.manifest.navItems
      );

      // Create navigation items from plugin manifest
      const pluginNavItems = activePluginsList.flatMap(plugin =>
        plugin.manifest.navItems?.map((item: any) => ({
          ...item,
          pluginId: plugin.manifest.id // Add plugin ID to track origin
        })) || []
      );

      // Combine default items with plugin navigation items
      menuItems = [...defaultMenuItems, ...pluginNavItems];
    });

    return unsubscribePlugins;
  });

  // Subscribe to auth state for user updates
  $effect(() => {
    const unsubscribeAuth = auth.subscribe(authState => {
      currentUser = authState.user;
    });
    return unsubscribeAuth;
  });

  function toggleSidebar() {
    expanded = !expanded;
    // Dispatch event to notify parent component about the change
    dispatch('toggle', { expanded });
  }
</script>

<aside class="gas-station-sidebar" class:expanded>
  <div class="sidebar-header">
    <div class="logo">
      <i class="fas fa-gas-pump"></i>
      {#if expanded}
        <h1>SuccessFuel</h1>
      {/if}
    </div>
  </div>

  <nav class="sidebar-nav">
    <ul>
      {#each menuItems as item (item.id)}
        <li>
          <a
            href={item.href}
            class="nav-link"
            title={item.label || ''}
            class:plugin-item={!!item.pluginId}
            class:active={currentPath.startsWith(item.href)}
          >
            <i class={item.icon}></i>
            {#if expanded}
              <span class="nav-label">
                {#if item.label}
                  {item.label}  /* For plugin items that already have translated labels */
                {:else}
                  <svelte:component this={TranslationNew} key={item.key} />
                {/if}
              </span>
              {#if item.pluginId}
                <span class="plugin-indicator" title="Plugin module">𝛙</span>
              {/if}
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="sidebar-footer">
    <button class="collapse-btn" on:click={toggleSidebar} title={expanded ? 'Collapse menu' : 'Expand menu'}>
      <i class="fas fa-{expanded ? 'times' : 'bars'}"></i>
    </button>
  </div>
</aside>

<style>
  .gas-station-sidebar {
    background-color: #2c3e50;
    color: white;
    height: 100vh;
    width: 70px;
    transition: width 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .gas-station-sidebar.expanded {
    width: 250px;
  }

  .sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #34495e;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo i {
    font-size: 1.5rem;
    color: #3498db;
  }

  .logo h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
  }

  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar-nav li {
    margin-bottom: 0.25rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #ecf0f1;
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
  }

  .nav-link:hover {
    background-color: #34495e;
    color: white;
  }

  .nav-link.active {
    background-color: #3498db;
    color: white;
  }

  .nav-link.active i {
    color: white;
  }

  .nav-link.plugin-item {
    background-color: rgba(52, 152, 219, 0.1);
  }

  .nav-link.plugin-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: #3498db;
  }

  .nav-link i {
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
    flex-shrink: 0; /* Prevent the icon from shrinking */
  }

  /* Enhance visibility of icons when sidebar is collapsed */
  .gas-station-sidebar:not(.expanded) .nav-link {
    justify-content: center; /* Center the icon when collapsed */
    padding: 1rem 0.5rem; /* Adjust padding for collapsed state */
  }

  .gas-station-sidebar:not(.expanded) .nav-label,
  .gas-station-sidebar:not(.expanded) .plugin-indicator {
    display: none; /* Hide labels and plugin indicators when collapsed */
  }

  /* Ensure icons are visible and centered when sidebar is collapsed */
  .gas-station-sidebar:not(.expanded) .nav-link i {
    font-size: 1.3rem; /* Slightly larger icons when collapsed */
    margin-right: 0; /* Remove any right margin */
    color: #3498db; /* Use a more visible color when collapsed */
  }

  /* Ensure active link icons are also visible when collapsed */
  .gas-station-sidebar:not(.expanded) .nav-link.active i {
    color: white; /* White color for active link icons */
  }

  .nav-label {
    margin-left: 1rem;
    flex: 1;
  }

  .plugin-indicator {
    background-color: #3498db;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
  }

  .sidebar-footer {
    border-top: 1px solid #34495e;
    background-color: #2c3e50; /* Match sidebar background */
    padding: 1rem;
    display: flex;
    justify-content: center; /* Center the collapse button */
    align-items: center;
    margin-top: auto; /* Push footer to bottom */
    position: relative;
  }

  .collapse-btn {
    background-color: rgba(52, 73, 94, 0.7); /* Subtle contrast from sidebar with transparency */
    border: none;
    color: #3498db; /* Use a more visible color */
    cursor: pointer;
    padding: 0.6rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .collapse-btn:hover {
    background-color: #3498db;
    color: white;
    transform: scale(1.1);
  }

  /* Make sure button is visible in both states */
  .gas-station-sidebar:not(.expanded) .collapse-btn {
    background-color: rgba(52, 73, 94, 0.7);
    color: #3498db;
  }

  .gas-station-sidebar:not(.expanded) .collapse-btn:hover {
    background-color: #3498db;
    color: white;
  }

  /* Ensure the button is centered and visible in both states */
  .collapse-btn i {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .gas-station-sidebar {
      width: 70px;
    }

    .gas-station-sidebar.expanded {
      width: 200px;
    }
  }
</style>