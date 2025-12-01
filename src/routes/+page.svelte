<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { auth } from '$lib/stores/auth';

  onMount(() => {
    const authState = get(auth);
    
    // Si l'utilisateur est authentifié, le rediriger vers le dashboard
    if (authState.isAuthenticated) {
      goto('/dashboard');
    } else {
      // Sinon, le rediriger vers la page de connexion
      goto('/auth');
    }
  });
</script>

<!-- Cette page ne s'affiche que brièvement pendant la redirection -->
<div class="redirect-page">
  <p>Redirection...</p>
</div>

<style>
  .redirect-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    font-size: 1.2rem;
  }
</style>