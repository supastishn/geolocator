<script>
  import { settings } from '$lib/stores.js';
  import { auth } from '$lib/authStore';
  
  let provider = $settings.provider;
  let apiKey = $settings.apiKey;
  let baseUrl = $settings.baseUrl;
  let model = $settings.model;
  let saved = false;
  let saveTimeout;
  let saveError = '';

  // No saveDisabled logic needed

  const saveSettings = () => {
    $settings = { provider, apiKey, baseUrl, model };
    saved = true;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saved = false;
    }, 1800);
  };
</script>

<svelte:head>
  <title>Settings - Geobot</title>
</svelte:head>

<div class="settings-container">
  <h2>API Settings</h2>
  
  <!-- Add provider selection -->
  <div class="provider-selection">
    <label>
      <input type="radio" name="provider" bind:group={provider} value="openai" />
      OpenAI (Bring Your Own Key)
    </label>
    <label>
      <input type="radio" name="provider" bind:group={provider} value="gemini" />
      Gemini Function
    </label>
  </div>

  <!-- Conditionally show API fields -->
  {#if provider === 'openai'}
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
  {:else}
    <div class="gemini-models">
      <h3>Gemini Model Selection</h3>
      <p>Model selection is now available only in the app interface.</p>
    </div>
  {/if}

  <div class="button-row">
    <button on:click={saveSettings}>Save Settings</button>
  </div>
  {#if saved}
    <div class="save-feedback">Settings saved!</div>
  {/if}
  {#if saveError}
    <div class="save-feedback error">{saveError}</div>
  {/if}
</div>

<style>
.settings-container {
	max-width: 600px;
	margin: 2rem auto;
	padding: 2rem;
	background: rgba(var(--color-surface-rgb), 0.7);
	border-radius: var(--border-radius);
	box-shadow: var(--shadow-lg);
	border: 1px solid var(--border-color);
	font-size: 1.2rem;
	color: var(--color-text);
}

.settings-container label {
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
	/* Remove fixed width constraint */
	max-width: 100%; /* Add this to make responsive */
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
	display: block; /* Change from inline-block */
	text-align: center;
	margin: 1rem auto; /* Center horizontally */
	font-weight: 500;
	font-size: 0.875rem;
	box-shadow: var(--shadow-md);
	animation: slideIn 0.3s ease;
}

.provider-selection {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.provider-selection label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.info-note {
  text-align: center;
  padding: 1rem;
  background-color: var(--color-bg-1);
  border-radius: var(--border-radius-sm);
  margin: 1.5rem 0;
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

.theme-aware {
  color: var(--color-text);
}

.centered-input::placeholder {
  color: var(--color-text-secondary);
}
  .login-note {
    color: var(--color-danger);
    font-weight: 600;
    margin-left: 0.5rem;
    font-size: 0.9rem;
  }
</style>
