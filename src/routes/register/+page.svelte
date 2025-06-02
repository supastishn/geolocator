<script>
  import { register } from '$lib/authStore';
  import { goto } from '$app/navigation';
  
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
      goto('/');
    } catch (err) {
      error = err.message;
    }
    loading = false;
  };
</script>

<main class="auth-container">
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
  <p>Already have an account? <a href="/login">Login</a></p>
</main>
