<script>
  import { register } from '$lib/authStore';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  
  let name = '';
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const handleRegister = async () => {
    loading = true;
    error = '';
    try {
      await register(email, password, name);
      // Fix redirect
      goto(`${base}/`);
    } catch (err) {
      error = err.message;
    }
    loading = false;
  };
</script>

<main>
  <div class="auth-card">
    <h2>Register</h2>
    {#if error}
      <div class="error">{error}</div>
    {/if}
    <form on:submit|preventDefault={handleRegister}>
      <label>
        Name:
        <input type="text" bind:value={name} required />
      </label>
      <label>
        Email:
        <input type="email" bind:value={email} required />
      </label>
      <label>
        Password:
        <input type="password" bind:value={password} required />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
    <p>Already have an account? <a href="{base}/login">Login</a></p>
  </div>
</main>
<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: var(--color-bg-1);
  }
  
  .auth-card {
    background: rgba(var(--color-surface-rgb), 0.7);
    padding: 2.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--border-color);
  }

  .auth-card h2 {
    font-size: 2rem;
    letter-spacing: -0.5px;
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--color-text);
  }

  .auth-card p, .auth-card a {
    font-size: 1.1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
  }

  button {
    margin-top: 0.5rem;
  }

  .error {
    color: white;
    background: var(--color-danger);
    padding: 0.75rem;
    border-radius: var(--border-radius-sm);
    text-align: center;
    font-weight: 500;
  }

  p {
    text-align: center;
    margin-top: 1.5rem;
    color: var(--color-text-secondary);
  }

  a {
    color: var(--color-primary);
    font-weight: 500;
  }
</style>
