<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import type { User } from '$lib/types/auth';

  let user = $state<User | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const authService = await getAuthService();
      await authService.getProfile(); // Use cached version if available

      // Get updated user from auth store
      user = auth.user;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load profile';
    } finally {
      loading = false;
    }
  });
</script>

<div class="profile-page">
  <h1>User Profile</h1>
  
  {#if loading}
    <p>Loading profile...</p>
  {/if}
  
  {#if error}
    <div class="error">
      <p>Error: {error}</p>
    </div>
  {/if}
  
  {#if user && !loading && !error}
    <div class="profile-info">
      <div class="info-item">
        <label>Name:</label>
        <span>{user.nom}</span>
      </div>
      <div class="info-item">
        <label>Email:</label>
        <span>{user.email}</span>
      </div>
      <div class="info-item">
        <label>ID:</label>
        <span>{user.id}</span>
      </div>
      <div class="info-item">
        <label>Login:</label>
        <span>{user.login}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .profile-page {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .profile-page h1 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .profile-info {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .info-item {
    display: flex;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .info-item label {
    font-weight: bold;
    width: 100px;
    color: #666;
  }

  .info-item span {
    flex: 1;
  }

  .error {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #f5c6cb;
  }
</style>