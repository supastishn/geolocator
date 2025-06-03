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
  <nav>
    <div class="nav-content">
      <div class="nav-left">
        <a class="logo" href="{base}/">
          <img src="{base}/favicon.png" alt="Geobot" class="logo-img" />
        </a>
      </div>
      <ul class="nav-links nav-links-center">
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
      <!-- Theme toggle container -->
      <div class="theme-container">
        <button on:click={toggleTheme} class="theme-toggle">
          {$theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      <!-- Auth container -->
      <div class="auth-container">
        {#if $auth}
          <span class="user-email">{$auth.email}</span>
          <button on:click={logout} class="auth-button">Logout</button>
        {:else}
          <a href="/login" class="auth-button login">Login</a>
          <a href="/register" class="auth-button register">Register</a>
        {/if}
      </div>
    </div>
  </nav>
</header>

<style>
header {
	backdrop-filter: blur(16px);
	background: var(--color-secondary);
	border-bottom: 1px solid var(--border-color);
	position: sticky;
	top: 0;
	z-index: 50;
	transition: all 0.3s ease;
}

[data-theme="dark"] header {
	background: var(--color-secondary);
	border-bottom: 1px solid #0f172a;
}

.nav-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 1200px;
	margin: 0 auto;
	height: 4rem;
	padding: 0 1.5rem;
	gap: 1rem;
}

/* Add styles for new direct containers */
.theme-container, .auth-container {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.user-email {
	padding: 0 0.5rem;
}

.nav-left {
	width: 60px;
}

.logo-img {
	height: 32px;
	width: auto;
	border-radius: 6px;
}

.nav-links {
	display: flex;
	list-style: none;
	padding: 0;
	margin: 0;
	gap: 0.5rem;
}

.nav-links-center {
	flex-grow: 1;
	justify-content: center;
}

nav a {
	color: var(--color-text) !important;
	text-decoration: none;
	padding: 0.5rem 1rem;
	border-radius: var(--border-radius-sm);
	font-weight: 500;
	font-size: 0.875rem;
	transition: all 0.2s ease;
	position: relative;
}

nav a:hover, nav a[aria-current] {
	background: var(--color-secondary);
	color: var(--color-primary) !important;
}

.theme-toggle {
  background: var(--color-secondary);
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--border-color);
  transform: scale(1.05);
}

.nav-right {
  min-width: 180px;
  justify-content: flex-end;
}

.user-email {
  margin-right: 1rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.auth-button {
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  background: var(--color-secondary);
  border-radius: var(--border-radius-sm);
}

.auth-button:hover {
  background: var(--border-color);
}

.login {
  background: var(--color-secondary);
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
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.register:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}
</style>
