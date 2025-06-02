<script>
  import { login } from '$lib/authStore';
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const handleLogin = async () => {
    loading = true;
    error = '';
    try {
      await login(email, password);
      goto('/');
    } catch (err) {
      error = err.message;
    }
    loading = false;
  };
</script>

<main class="auth-container">
  <h2>Login</h2>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <form on:submit|preventDefault={handleLogin}>
    <label>
      Email:
      <input type="email" bind:value={email} required />
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} required />
    </label>
    <button type="submit" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>
  <p>Don't have an account? <a href="/register">Register</a></p>
</main>

<style>
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: var(--color-surface);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
  }
</style>
