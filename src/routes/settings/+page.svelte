<script>
  import { settings } from '$lib/stores.js';

  let apiKey = $settings.apiKey;
  let baseUrl = $settings.baseUrl;
  let model = $settings.model;
  let saved = false;
  let saveTimeout;

  const saveSettings = () => {
    $settings = { apiKey, baseUrl, model };
    saved = true;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saved = false;
    }, 1800);
  };
</script>

<div class="settings-container">
  <h2>API Settings</h2>
  
  <label>
    OpenAI API Key:
    <input type="password" bind:value={apiKey} class="centered-input" />
  </label>
  
  <label>
    Base URL:
    <input type="text" bind:value={baseUrl} 
           placeholder="https://api.openai.com/v1"
           class="centered-input" />
  </label>
  
  <label>
    Model:
    <input type="text" bind:value={model} 
           placeholder="gpt-4-vision-preview"
           class="centered-input" />
  </label>

  
  <div class="button-row">
    <button on:click={saveSettings}>Save Settings</button>
  </div>
  {#if saved}
    <div class="save-feedback">Settings saved!</div>
  {/if}
</div>

<style>
.settings-container {
	max-width: 600px;
	margin: 2rem auto;
	padding: 2rem;
	background: var(--color-surface);
	border-radius: var(--border-radius);
	box-shadow: var(--shadow-lg);
	border: 1px solid var(--border-color);
	font-family: var(--font-body);
	font-size: 1.2rem;
}

.settings-container label {
	font-family: var(--font-body);
	font-size: 1.2rem;
}

h2 {
	color: var(--color-text);
	margin-bottom: 2rem;
	font-size: 1.75rem;
	font-weight: 700;
	text-align: center;
}

label {
	display: block;
	margin-bottom: 1.5rem;
	font-weight: 500;
	color: var(--color-text);
}

.centered-input {
	width: 100%;
	margin-top: 0.5rem;
	padding: 0.5rem 0.75rem;
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius-sm);
	background: var(--color-surface);
	color: var(--color-text);
	font-size: 0.8rem;
	transition: all 0.2s ease;
	box-shadow: var(--shadow-sm);
}

.centered-input:focus {
	border-color: var(--color-primary);
	outline: none;
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.button-row {
	display: flex;
	justify-content: center;
	margin-top: 2rem;
	margin-bottom: 1rem;
}

.save-feedback {
	background: var(--color-accent);
	color: white;
	border-radius: var(--border-radius-sm);
	padding: 0.75rem 1.5rem;
	display: inline-block;
	font-weight: 500;
	font-size: 0.875rem;
	margin-top: 1rem;
	box-shadow: var(--shadow-md);
	animation: slideIn 0.3s ease;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
