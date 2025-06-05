<script>
	import { page } from '$app/stores';
	import { theme } from '$lib/stores';
	import { auth, logout } from '$lib/authStore';
	import { base } from '$app/paths';

	const toggleTheme = () => {
		$theme = $theme === 'light' ? 'dark' : 'light';
	};
</script>

<header>
  <div class="container">
    <nav>
      <a href="/" class="logo">
        <img src="./favicon.png" alt="GeoLocator Logo" />
        <span>GeoLocator</span>
      </a>
      <div class="nav-links">
        <ul>
          <li aria-current={$page.url.pathname === `${base}/` ? 'page' : undefined}>
            <a href="{base}/">Home</a>
          </li>
          <li aria-current={$page.url.pathname === `${base}/app` ? 'page' : undefined}>
            <a href="{base}/app">App</a>
          </li>
          <li aria-current={$page.url.pathname === `${base}/settings` ? 'page' : undefined}>
            <a href="{base}/settings">Settings</a>
          </li>
        </ul>
      </div>
      <div class="right-aligned-container">
        <div class="theme-container">
          <button on:click={toggleTheme} class="theme-toggle">
            {$theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div class="user-section">
          {#if $auth}
            <span class="user-email">{$auth.email}</span>
            <button on:click={() => logout()} class="auth-button logout">Logout</button>
          {:else}
            <a href="{base}/login" class="auth-button login">Login</a>
            <a href="{base}/register" class="auth-button register">Register</a>
          {/if}
        </div>
      </div>
    </nav>
  </div>
</header>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

header {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s;
}

[data-theme="dark"] header {
  background: rgba(30,41,59,0.85);
  border-bottom: 1px solid #0f172a;
}

nav {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1.5rem;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  color: var(--color-primary);
}

.logo img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.nav-links ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
}

.nav-links a {
  color: var(--color-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  position: relative;
}

.nav-links a:hover, .nav-links a[aria-current] {
  background: var(--color-primary);
  color: #fff !important;
}

.theme-container, .user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.right-aligned-container {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 1.5rem;
}

.theme-toggle {
  background: var(--color-surface-2);
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: var(--color-primary);
  color: #fff;
  transform: scale(1.05);
}

.user-email {
  margin-right: 1rem;
  font-size: 0.95rem;
  color: var(--color-text);
}

.auth-button {
  transition: all 0.2s;
  padding: 0.5rem 1rem;
  background: var(--color-surface-2);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  font-weight: 500;
}

.auth-button:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.login {
  background: var(--color-surface-2);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.login:hover {
  background: var(--color-primary-hover);
  color: white;
  border-color: transparent;
}

.register {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(67, 97, 238, 0.12);
}

.register:hover {
  background: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(114, 9, 183, 0.18);
}

.logout {
  background: var(--color-surface-2);
  border: 1px solid var(--border-color);
  color: var(--color-text);
}

[data-theme="dark"] .logout {
  background: #1e293b;
  border-color: #334155;
}

.logout:hover {
  background: var(--color-danger);
  color: white;
  border-color: transparent;
}
</style>
