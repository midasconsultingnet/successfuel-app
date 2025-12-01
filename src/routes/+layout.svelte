<script lang="ts">
  import { page } from '$app/stores';
  import GasStationHeader from '$lib/components/features/gas-station/GasStationHeader.svelte';
  import GasStationSidebar from '$lib/components/features/gas-station/GasStationSidebar.svelte';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import { initI18nContext } from '$lib/hooks/useI18n';
  import { loadAllModuleTranslations } from '$lib/i18n/loadModuleTranslations';

  // Initialize i18n context
  initI18nContext();

  // Load all module translations
  onMount(async () => {
    await loadAllModuleTranslations();
  });

  let sidebarExpanded = $state(false);
  let isAuthorized = $state(false);
  let checkingAuth = $state(true);
  let showMainLayout = $state(true);
  let currentPath = $state('');

  // Use derived value to react to page changes
  const pagePath = $derived($page.url.pathname);

  // Update current path and showMainLayout based on pagePath
  $effect(() => {
    currentPath = pagePath;
    showMainLayout = !currentPath.startsWith('/auth') && !currentPath.startsWith('/login');
  });

  // Function to check if user has access to current route (for protected routes)
  async function checkRouteAccess() {
    console.log('Checking route access for:', currentPath);
    console.log('showMainLayout:', showMainLayout);

    if (!showMainLayout) {
      // For auth routes, skip route access check
      console.log('Not main layout, setting isAuthorized to true');
      checkingAuth = false;
      isAuthorized = true;
      return;
    }

    // Check authentication status
    const authState = get(auth);
    console.log('Current auth state:', authState);

    if (authState.isAuthenticated) {
      console.log('User is authenticated, checking profile...');
      // If authenticated, check if profile is loaded
      if (!authState.user || authState.permissions.length === 0) {
        console.log('Profile not loaded, attempting to load...');
        // Load profile if not already loaded
        try {
          const authService = await getAuthService();
          await authService.getProfile();

          // After loading profile, update auth state again to ensure it's up to date
          const updatedAuthState = get(auth);
          console.log('Profile loaded, updated auth state:', updatedAuthState);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // If we can't load the profile, the user is still authenticated,
          // just with limited access since permissions are unknown
          console.warn('Proceeding with limited access due to profile loading failure');
        }
      } else {
        console.log('Profile already loaded');
      }

      // The user is authenticated, so they should have basic access to the main layout
      console.log('Setting isAuthorized to true');
      isAuthorized = true;
      checkingAuth = false;
    } else {
      console.log('User is not authenticated, redirecting to /auth');
      // Redirect to auth page if not authenticated
      goto('/auth');
      isAuthorized = false;
      checkingAuth = false;
    }
  }

  // Watch for authentication state changes
  $effect(() => {
    const currentAuth = get(auth);
    console.log('Auth state changed in layout:', currentAuth);

    // Check if user just got logged out (was authenticated but now is not)
    if (currentAuth.isAuthenticated === false && isAuthorized === true) {
      console.log('User logged out, redirecting to auth page');
      isAuthorized = false;
      goto('/auth');
      return;
    }

    // Only run authorization check if we're on a main layout route
    if (showMainLayout && !checkingAuth) {
      // Re-check authentication if the auth state changes
      if (currentAuth.isAuthenticated !== (isAuthorized && !checkingAuth)) {
        console.log('Auth state changed, re-checking route access');
        checkRouteAccess();
      }
    }
  });

  function toggleSidebar() {
    sidebarExpanded = !sidebarExpanded;
  }

  // Initialize any global state or services
  onMount(async () => {
    console.log('Layout mounted, showMainLayout:', showMainLayout, 'currentPath:', currentPath);
    if (showMainLayout) {
      // Only check route access for protected routes that need the main layout
      await checkRouteAccess();
      console.log('Route access checked, isAuthorized:', isAuthorized, 'checkingAuth:', checkingAuth);

      // Check if sidebar should be expanded by default on larger screens
      if (browser) {
        // Set initial state based on screen size
        sidebarExpanded = window.innerWidth >= 1024;

        // Add resize listener to adjust sidebar on screen size changes
        const handleResize = () => {
          if (window.innerWidth < 768) {
            sidebarExpanded = false; // Always collapsed on mobile
          } else if (window.innerWidth >= 1024 && !sidebarExpanded) {
            sidebarExpanded = true; // Expanded on desktop
          }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup listener on unmount
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }
    } else {
      // For auth routes, we skip the main layout and route protection
      checkingAuth = false;
      isAuthorized = true; // Auth routes are accessible by definition
      console.log('On auth route, setting isAuthorized to true');
    }
  });
</script>

{#if checkingAuth}
  <div class="checking-auth">
    <div class="spinner"></div>
    <p>Vérification de l'authentification...</p>
  </div>
{:else if !showMainLayout}
  <!-- For auth routes, render the page content directly without main layout -->
  <slot />
{:else if isAuthorized}
  <div class="app-layout">
    <GasStationSidebar
      expanded={sidebarExpanded}
      on:toggle={(e) => sidebarExpanded = e.detail.expanded}
    />

    <main class="main-content" class:sidebar-expanded={sidebarExpanded}>
      <GasStationHeader />
      <div class="page-content">
        <slot />
      </div>
    </main>
  </div>
{:else}
  <div class="unauthorized">
    <h1>Accès refusé</h1>
    <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
  </div>
{/if}

<ErrorDisplay />

<style>
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    margin-left: 70px;  /* Updated to match sidebar width when collapsed */
    transition: margin-left 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .main-content.sidebar-expanded {
    margin-left: 250px;  /* Updated to match sidebar width when expanded */
  }

  .page-content {
    flex: 1;
    padding: 0;
    overflow: auto;
  }

  /* Override default styles for dashboard */
  .page-content > :global(*) {
    padding: 1.5rem;
  }

  .checking-auth {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .unauthorized {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    padding: 2rem;
  }
</style>