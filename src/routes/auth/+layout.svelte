<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  let isAuthenticated = $state(false);
  let isInitialized = $state(false);

  // Vérifier l'état d'authentification au montage du composant
  onMount(async () => {
    // Get initial auth state
    const initialAuthState = get(auth);
    isAuthenticated = initialAuthState.isAuthenticated;

    // If user is already authenticated when this layout loads, redirect immediately
    // This handles cases where a user navigates directly to /auth when already logged in
    if (initialAuthState.isAuthenticated) {
      goto('/dashboard');
      return;
    }

    isInitialized = true;
  });
</script>

{#if isInitialized}
  <div class="auth-layout">
    <div class="auth-container">
      <header class="auth-header">
        <h1>SuccessFuel ERP</h1>
        <p>Gestion Intégrée de Station-Service</p>
      </header>

      <main class="auth-main">
        <div class="auth-content">
          <slot />
        </div>
      </main>

      <footer class="auth-footer">
        <p>© {new Date().getFullYear()} SuccessFuel - Tous droits réservés</p>
      </footer>
    </div>
  </div>
{:else}
  <div class="auth-layout-loading">
    <p>Chargement...</p>
  </div>
{/if}

<style>
  .auth-layout {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  .auth-container {
    width: 100%;
    max-width: 450px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .auth-header {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 1rem;
  }

  .auth-header h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
  }

  .auth-header p {
    margin: 0.5rem 0 0;
    opacity: 0.8;
    font-size: 1rem;
  }

  .auth-main {
    padding: 2rem;
  }

  .auth-content {
    width: 100%;
  }

  .auth-footer {
    text-align: center;
    padding: 1.5rem;
    border-top: 1px solid #eee;
    font-size: 0.8rem;
    color: #666;
  }

  .auth-layout-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
  }
</style>