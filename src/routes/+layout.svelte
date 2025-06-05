<script>
	import Header from './Header.svelte';
	import ThreeBackground from '$lib/ThreeBackground.svelte';
	import '../app.css';
	import { theme } from '$lib/stores';
	import { browser } from '$app/environment';
	import { dev } from '$app/environment';

	if (browser) {
		theme.subscribe(theme => {
			document.body.setAttribute('data-theme', theme);
		});

		// Initialize Eruda in development or when debug flag is present
		const urlParams = new URLSearchParams(window.location.search);
		const debugMode = dev || urlParams.get('debug') === 'true';

		if (debugMode) {
			import('eruda').then(eruda => eruda.init());
		}
	}
</script>

<div class="app">
	<ThreeBackground />
	<Header />

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
