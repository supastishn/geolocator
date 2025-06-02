<script>
	import { page } from '$app/stores';
	import { theme } from '$lib/stores';

	const toggleTheme = () => {
		$theme = $theme === 'light' ? 'dark' : 'light';
	};
</script>

<header>
  <nav>
    <div class="nav-content">
      <div class="nav-left">
        <a class="logo" href="/">
          <img src="/favicon.png" alt="AI Geolocator" class="logo-img" />
        </a>
      </div>
      <ul class="nav-links nav-links-center">
        <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
          <a href="/">Home</a>
        </li>
        <li aria-current={$page.url.pathname === '/settings' ? 'page' : undefined}>
          <a href="/settings">Settings</a>
        </li>
      </ul>
      <div class="nav-right">
        <button on:click={toggleTheme} class="theme-toggle">
          {$theme === 'light' ? '🌙' : '☀️'}
        </button>
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
	display: flex;
	align-items: center;
	justify-content: center;
}

.theme-toggle:hover {
	background: var(--border-color);
	transform: scale(1.05);
}
</style>
