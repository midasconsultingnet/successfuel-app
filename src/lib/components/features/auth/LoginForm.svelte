<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import type { LoginCredentials } from '$lib/services/api/auth';

  // Props for the LoginForm
  let { errorMessage = null, returnUrl = '/dashboard' } = $props<{
    errorMessage?: string | null;
    returnUrl?: string;
  }>();

  // Events
  const dispatch = createEventDispatcher();

  // State
  let credentials = $state<LoginCredentials>({ login: '', password: '' });
  let loading = $state(false);
  let localErrorMessage = $state<string | null>(null);

  // Handle form submission
  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    localErrorMessage = null;

    try {
      const authService = await getAuthService();
      await authService.login(credentials);

      // Dispatch login success event
      dispatch('loginSuccess');

      // Ensure the auth store is fully updated before redirecting
      // Wait for the auth store to reflect the authenticated state
      await new Promise(resolve => {
        const checkAuthState = () => {
          const authState = get(auth);
          if (authState.isAuthenticated && authState.user && authState.user.id) {
            resolve();
          } else {
            setTimeout(checkAuthState, 50); // Check again in 50ms
          }
        };
        checkAuthState();
      });

      // Redirect to return URL or default
      goto(returnUrl);
    } catch (error) {
      localErrorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch('loginError', { error });
    } finally {
      loading = false;
    }
  }

  // Handle input changes
  function handleLoginChange(e: Event) {
    const target = e.target as HTMLInputElement;
    credentials = { ...credentials, login: target.value };
  }

  function handlePasswordChange(e: Event) {
    const target = e.target as HTMLInputElement;
    credentials = { ...credentials, password: target.value };
  }
</script>

<form class="login-form" on:submit={handleSubmit}>
  <div class="form-group">
    <label for="login">Login</label>
    <input
      id="login"
      type="text"
      class="form-control"
      placeholder="Enter your login"
      required
      bind:value={credentials.login}
      on:input={handleLoginChange}
    />
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      class="form-control"
      placeholder="Enter your password"
      required
      bind:value={credentials.password}
      on:input={handlePasswordChange}
    />
  </div>

  {#if errorMessage || localErrorMessage}
    <div class="error-message">
      {errorMessage || localErrorMessage}
    </div>
  {/if}

  <button
    type="submit"
    class="btn btn-primary btn-block"
    disabled={loading}
  >
    {loading ? 'Logging in...' : 'Login'}
  </button>
</form>

<style>
  .login-form {
    width: 100%;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .form-control:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .error-message {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .btn-primary {
    color: white;
    background-color: #007bff;
    border-color: #007bff;
  }

  .btn-primary:hover {
    background-color: #0069d9;
    border-color: #0062cc;
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .btn-block {
    width: 100%;
  }
</style>