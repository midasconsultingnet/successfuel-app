<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import type { User } from '$lib/types/auth';
  import KpiCard from '$lib/components/KpiCard.svelte';
  import QuickActionCard from '$lib/components/QuickActionCard.svelte';
  import RecentActivity from '$lib/components/RecentActivity.svelte';
  import TranslationNew from '$lib/components/TranslationNew.svelte';
  import { t, translationStore } from '$lib/i18n/i18n';
  import { language } from '$lib/i18n/languageStore';

  // Subscribe to auth changes
  let user = $state<User | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Dashboard data
  let activePumps = $state(0);
  let fuelLevel = $state(0);
  let dailySales = $state(0);
  let transactions = $state(0);
  let recentActivity = $state<any[]>([]);
  let kpiLoading = $state(true);

  // Reactive translation state variables
  let activePumpsTitle = $state('');
  let activePumpsSubtitle = $state('');
  let fuelLevelsTitle = $state('');
  let fuelLevelsSubtitle = $state('');
  let dailySalesTitle = $state('');
  let dailySalesSubtitle = $state('');
  let transactionsTitle = $state('');
  let transactionsSubtitle = $state('');
  let quickActions = $state('');
  let viewReports = $state('');
  let reports = $state('');
  let manageInventory = $state('');
  let inventory = $state('');
  let checkMaintenance = $state('');
  let maintenance = $state('');
  let manageUsers = $state('');
  let users = $state('');
  let recentActivityTitle = $state('');

  // Update translations when language changes
  $effect(() => {
    const unsubscribe = language.subscribe(() => {
      // Update all translation state variables when language changes
      activePumpsTitle = t('dashboard.activePumps');
      activePumpsSubtitle = t('gasStation.pumps') + ' ' + t('dashboard.activePumps');
      fuelLevelsTitle = t('dashboard.fuelLevels');
      fuelLevelsSubtitle = t('gasStation.fuelLevel') + ' ' + t('dashboard.fuelLevels');
      dailySalesTitle = t('dashboard.dailySales');
      dailySalesSubtitle = t('gasStation.sales') + ' ' + t('dashboard.dailySales');
      transactionsTitle = t('dashboard.transactions');
      transactionsSubtitle = t('gasStation.transactions') + ' ' + t('dashboard.transactions');
      quickActions = t('dashboard.quickActions');
      viewReports = t('dashboard.viewReports');
      reports = t('nav.reports');
      manageInventory = t('dashboard.manageInventory');
      inventory = t('nav.inventory');
      checkMaintenance = t('dashboard.checkMaintenance');
      maintenance = t('nav.maintenance');
      manageUsers = t('dashboard.manageUsers');
      users = t('nav.users');
      recentActivityTitle = t('dashboard.recentActivity');
    });

    return unsubscribe;
  });

  onMount(async () => {
    console.log('Dashboard mounted, checking authentication...');
    try {
      // Check authentication status and refresh if needed
      const authService = await getAuthService();
      const isTokenValid = await authService.refreshTokenIfNeeded();

      console.log('Token validation result:', isTokenValid);
      console.log('Current auth state in dashboard:', get(auth));

      if (!isTokenValid) {
        // If token is not valid, redirect to login
        console.log('Token not valid, redirecting to auth...');
        goto('/auth');
        return;
      }

      // Get profile to ensure we have up-to-date user info
      // The optimized service will use cached data if available
      console.log('Getting user profile...');
      await authService.getProfile();

      // Get current user from auth store
      user = get(auth).user;
      console.log('Current user in dashboard:', user);

      // Simulate loading dashboard data
      await loadDashboardData();

      // Initialize translation state variables
      activePumpsTitle = t('dashboard.activePumps');
      activePumpsSubtitle = t('gasStation.pumps') + ' ' + t('dashboard.activePumps');
      fuelLevelsTitle = t('dashboard.fuelLevels');
      fuelLevelsSubtitle = t('gasStation.fuelLevel') + ' ' + t('dashboard.fuelLevels');
      dailySalesTitle = t('dashboard.dailySales');
      dailySalesSubtitle = t('gasStation.sales') + ' ' + t('dashboard.dailySales');
      transactionsTitle = t('dashboard.transactions');
      transactionsSubtitle = t('gasStation.transactions') + ' ' + t('dashboard.transactions');
      quickActions = t('dashboard.quickActions');
      viewReports = t('dashboard.viewReports');
      reports = t('nav.reports');
      manageInventory = t('dashboard.manageInventory');
      inventory = t('nav.inventory');
      checkMaintenance = t('dashboard.checkMaintenance');
      maintenance = t('nav.maintenance');
      manageUsers = t('dashboard.manageUsers');
      users = t('nav.users');
      recentActivityTitle = t('dashboard.recentActivity');
    } catch (err) {
      console.error('Dashboard load error:', err);
      error = err instanceof Error ? err.message : 'Failed to load dashboard';
    } finally {
      loading = false;
      console.log('Dashboard loading completed.');
    }
  });

  async function loadDashboardData() {
    // In a real implementation, this would call APIs to get dashboard data
    // For now, we'll simulate the data loading
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

    activePumps = 4;
    fuelLevel = 68;
    dailySales = 12450;
    transactions = 142;

    // Sample recent activity
    recentActivity = [
      { id: '1', title: 'New sale completed', description: 'Transaction #T001 for $85.20', time: '2 min ago', type: 'success' },
      { id: '2', title: 'Tank refilled', description: 'Diesel tank refilled to 95%', time: '15 min ago', type: 'info' },
      { id: '3', title: 'Maintenance completed', description: 'Pump #3 maintenance finished', time: '1 hour ago', type: 'info' },
      { id: '4', title: 'Low fuel alert', description: 'Unleaded tank at 15% capacity', time: '2 hours ago', type: 'warning' },
    ];

    kpiLoading = false;
  }

  async function handleLogout() {
    const authService = await getAuthService();
    await authService.logout();

    // Redirect to login page after logout
    goto('/auth');
  }

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

</script>

<main class="dashboard">
  <header class="dashboard-header">
    <div>
      <h1><TranslationNew key="dashboard.title" /></h1>
      <p><TranslationNew key="dashboard.welcome" params={{ name: user?.nom || user?.login || 'User' }} /></p>
    </div>
    <button class="logout-btn" on:click={handleLogout}>
      <TranslationNew key="common.logout" />
    </button>
  </header>

  {#if loading}
    <div class="loading">{t('common.loading')}</div>
  {/if}

  {#if error}
    <div class="error">Error: {error}</div>
  {/if}

  {#if !loading && !error}
    <section class="dashboard-content">
      <!-- KPIs Section -->
      <div class="dashboard-kpis">
        <KpiCard
          title={activePumpsTitle}
          value={activePumps + '/6'}
          subtitle={activePumpsSubtitle}
          icon="⛽"
          color="blue"
          loading={kpiLoading}
        />

        <KpiCard
          title={fuelLevelsTitle}
          value={fuelLevel + '%'}
          subtitle={fuelLevelsSubtitle}
          icon="🛢️"
          color="green"
          loading={kpiLoading}
        />

        <KpiCard
          title={dailySalesTitle}
          value={formatCurrency(dailySales)}
          subtitle={dailySalesSubtitle}
          icon="💰"
          color="yellow"
          loading={kpiLoading}
        />

        <KpiCard
          title={transactionsTitle}
          value={transactions}
          subtitle={transactionsSubtitle}
          icon="📋"
          color="blue"
          loading={kpiLoading}
        />
      </div>

      <!-- Quick Actions & Recent Activity -->
      <div class="dashboard-main">
        <div class="dashboard-actions">
          <h2>{quickActions}</h2>
          <div class="quick-actions-grid">
            <QuickActionCard
              title={viewReports}
              description={reports}
              path="/reports"
              icon="📊"
            />

            <QuickActionCard
              title={manageInventory}
              description={inventory}
              path="/inventory"
              icon="📦"
            />

            <QuickActionCard
              title={checkMaintenance}
              description={maintenance}
              path="/maintenance"
              icon="🔧"
            />

            <QuickActionCard
              title={manageUsers}
              description={users}
              path="/users"
              icon="👥"
            />
          </div>
        </div>

        <div class="dashboard-activity">
          <RecentActivity
            title={recentActivityTitle}
            activities={recentActivity}
            loading={kpiLoading}
          />
        </div>
      </div>
    </section>
  {/if}
</main>

<style>
  .dashboard {
    padding: 0;
    background-color: #f8f9fa;
    min-height: 100vh;
  }

  .dashboard-header {
    background: white;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .dashboard-header h1 {
    color: #333;
    margin: 0;
    font-size: 1.75rem;
  }

  .dashboard-header p {
    margin: 0.25rem 0 0;
    color: #6c757d;
    font-size: 1.1rem;
  }

  .logout-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: 500;
  }

  .logout-btn:hover {
    background-color: #c82333;
  }

  .loading, .error {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
  }

  .error {
    color: #dc3545;
  }

  .dashboard-content {
    padding: 2rem;
  }

  .dashboard-kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .dashboard-main {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }

  .dashboard-actions {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .dashboard-actions h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .dashboard-activity {
    /* RecentActivity component handles its own styling */
  }

  @media (max-width: 992px) {
    .dashboard-main {
      grid-template-columns: 1fr;
    }
  }
</style>