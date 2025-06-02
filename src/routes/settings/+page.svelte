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
    max-width: 500px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: white;
    text-align: center;
  }
  
  label {
    display: block;
    margin-bottom: 1.2rem;
    text-align: center;
  }
  
  .centered-input {
    width: 70%;
    margin: 0.5rem auto 0 auto;
    display: block;
    text-align: center;
  }

  .button-row {
    display: flex;
    justify-content: center;
    margin-top: 1.2rem;
    margin-bottom: 0.5rem;
  }

  button {
    background: #4075a6;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 auto;
    display: block;
  }

  button:hover {
    background: #2c5282;
  }

  .save-feedback {
    margin-top: 0.7rem;
    color: #fff;
    background: #4caf50;
    border-radius: 4px;
    padding: 0.4rem 1rem;
    display: inline-block;
    font-weight: 600;
    font-size: 1rem;
    animation: fadeInOut 1.8s;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
