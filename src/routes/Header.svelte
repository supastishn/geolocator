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
	  background: var(--nav-color);
	  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
	  padding: 0 1.5em;
	}

	.nav-content {
	  display: flex;
	  justify-content: space-between; /* Ensure left and right alignment */
	  align-items: center;
	  max-width: 900px;
	  margin: 0 auto;
	  height: 60px;
	}

	/* Removed flex: 1 from .nav-left, .nav-right */

	.nav-left {
	  width: 60px; /* Fixed width for logo */
	}

	.nav-links {
	  display: flex;
	  list-style: none;
	  padding: 0;
	  margin: 0;
	}

	.nav-links-center {
	  flex-grow: 1;
	  display: flex;
	  justify-content: center;
	}

	.logo {
	  font-weight: 700;
	  font-size: 1.2rem;
	  color: white;
	}

	/* Add logo image styles */
	.logo-img {
	  height: 40px;
	  width: auto;
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
