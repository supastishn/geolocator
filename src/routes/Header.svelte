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
          🛰️ AI Geolocator
        </a>
      </div>
      <ul class="nav-links">
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
	.theme-toggle {
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0 10px;
	}

	.corner {
		display: none;
	}

	nav {
	  background: linear-gradient(90deg, var(--color-theme-2) 0%, var(--color-theme-1) 100%);
	  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
	  padding: 0 1.5em;
	}

	.nav-content {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  max-width: 900px;
	  margin: 0 auto;
	  height: 60px;
	}

	.nav-left, .nav-right {
	  flex: 1;
	}

	.nav-links {
	  display: flex;
	  list-style: none;
	  padding: 0;
	  margin: 0;
	}

	.logo {
	  font-weight: 700;
	  font-size: 1.2rem;
	  color: white;
	}

	li::before {
	  display: none;
	}

	nav a {
	  color: #fff !important;
	  opacity: 0.8;
	  transition: opacity 0.2s;
	  display: flex;
	  align-items: center;
	  padding: 0 1.2rem;
	  font-weight: 700;
	  font-size: 1rem;
	  text-transform: uppercase;
	  letter-spacing: 0.1em;
	  text-decoration: none;
	  border-radius: 0;
	  height: 60px;
	}

	nav a:hover, nav a[aria-current] {
	  opacity: 1;
	  background: transparent !important;
	}

	@media (max-width: 600px) {
	  .nav-content {
	    flex-direction: column;
	    height: auto;
	    padding: 0.5em 0;
	  }
	  .nav-links {
	    flex-direction: column;
	    width: 100%;
	    align-items: center;
	  }
	  .nav-links li {
	    width: 100%;
	  }
	  nav a {
	    font-size: 0.9rem;
	    padding: 0 0.7rem;
	    height: 40px;
	  }
	}
</style>
