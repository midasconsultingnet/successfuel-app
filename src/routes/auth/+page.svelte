<script lang="ts">
  import LoginForm from '$lib/components/features/auth/LoginForm.svelte';
</script>

<div class="auth-content">
  <h2>Connexion</h2>
  <p class="auth-subtitle">Veuillez vous connecter à votre compte</p>

  <div class="login-form-container">
    <LoginForm returnUrl="/dashboard" />
  </div>
</div>

<style>
  .auth-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .auth-content h2 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
  }

  .auth-subtitle {
    color: #7f8c8d;
    margin: 0 0 1.5rem 0;
    text-align: center;
    font-size: 0.9rem;
  }

  .login-form-container {
    width: 100%;
  }
</style>