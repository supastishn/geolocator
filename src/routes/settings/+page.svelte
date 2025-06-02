<script>
  import { settings } from '$lib/stores.js';

  let apiKey = $settings.apiKey;
  let baseUrl = $settings.baseUrl;
  let model = $settings.model;

  const saveSettings = () => {
    $settings = { apiKey, baseUrl, model };
  };
</script>

<div class="settings-container">
  <h2>API Settings</h2>
  
  <label>
    OpenAI API Key:
    <input type="password" bind:value={apiKey} />
  </label>
  
  <label>
    Base URL:
    <input type="text" bind:value={baseUrl} 
           placeholder="https://api.openai.com/v1" />
  </label>
  
  <label>
    Model:
    <input type="text" bind:value={model} 
           placeholder="gpt-4-vision-preview" />
  </label>
  
  <button on:click={saveSettings}>Save Settings</button>
</div>

<style>
  .settings-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: white;
  }
  
  label {
    display: block;
    margin-bottom: 1rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    background: #4075a6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #2c5282;
  }
</style>
