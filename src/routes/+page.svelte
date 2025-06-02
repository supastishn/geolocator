<script>
  import { settings } from '$lib/stores.js';
  import { getLocation } from '$lib/geolocator';
  import MapView from '$lib/MapView.svelte';

  let imageFile;
  let result = null;
  let isLoading = false;
  let error = null;

  const handleSubmit = async () => {
    if (!imageFile) return;
    
    isLoading = true;
    error = null;
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile[0]);
      reader.onload = async () => {
        const imageData = reader.result;
        result = await getLocation(imageData);
        isLoading = false;
      };
    } catch (err) {
      error = err.message;
      isLoading = false;
    }
  };
</script>

<svelte:head>
  <title>AI Geolocator</title>
</svelte:head>

<main class="container">
  <h1>AI Geolocator</h1>
  
  <div class="upload-area">
    <input 
      type="file" 
      accept="image/*" 
      bind:files={imageFile}
      disabled={isLoading}
    />
    <button on:click={handleSubmit} disabled={isLoading || !imageFile}>
      {isLoading ? 'Analyzing Location...' : 'Find Location'}
    </button>
  </div>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  {#if result}
    <div class="result">
      <h2>Location Found:</h2>
      <p class="location">{result.city}, {result.country}</p>
      <p class="coordinates">Coordinates: {result.latitude}, {result.longitude}</p>
      
      <MapView 
        lat={result.latitude} 
        lng={result.longitude} 
      />
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: var(--color-theme-1);
    margin-bottom: 2rem;
  }

  .upload-area {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  input[type="file"] {
    width: 100%;
    margin-bottom: 1rem;
  }

  button {
    background: var(--color-theme-1);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error {
    color: red;
    background: #fff;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .result {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .location {
    font-size: 1.25rem;
    color: var(--color-theme-2);
    margin-bottom: 0.5rem;
  }

  .coordinates {
    color: #666;
    font-family: var(--font-mono);
  }
</style>