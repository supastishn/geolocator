<script>
  import { settings } from '$lib/stores.js';
  import { getLocation } from '$lib/geolocator';
  import MapView from '$lib/MapView.svelte';

  let imageFile;
  let result = null;
  let isLoading = false;
  let error = null;
  let streamingXml = '';
  let finalXml = '';
  let streaming = false;

  const handleSubmit = async () => {
    if (!imageFile) return;
    
    isLoading = true;
    error = null;
    result = null;
    streamingXml = '';
    streaming = true;
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile[0]);
      reader.onload = async () => {
        const imageData = reader.result;
        const location = await getLocation(
          imageData,
          5,
          (xml) => {
            streamingXml = xml;
          }
        );
        finalXml = streamingXml;
        result = location;
        isLoading = false;
        streaming = false;

        if (!location) {
          error = "Failed to identify location. Please try another image.";
        }
      };
    } catch (err) {
      error = err.message;
      isLoading = false;
      streaming = false;
    }
  };
</script>

<svelte:head>
  <title>AI Geolocator</title>
</svelte:head>

<main class="container">
  <h1>
    <span class="emoji">🛰️</span> AI Geolocator
  </h1>
  
  <div class="upload-area">
    <label class="file-label">
      <input 
        type="file" 
        accept="image/*" 
        bind:files={imageFile}
        disabled={isLoading}
      />
      <span>{imageFile && imageFile.length ? imageFile[0].name : 'Choose an image...'}</span>
    </label>
    <button on:click={handleSubmit} disabled={isLoading || !imageFile}>
      {isLoading ? 'Analyzing Location...' : 'Find Location'}
    </button>
  </div>

  {#if streaming && streamingXml}
    <div class="streaming-xml">
      <div class="streaming-title">Streaming XML output:</div>
      <pre>{streamingXml.split('\n').slice(-8).join('\n')}</pre>
    </div>
  {/if}
  
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
    max-width: 700px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
    background: rgba(255,255,255,0.85);
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(64,117,166,0.08);
    margin-top: 2.5rem;
  }

  h1 {
    color: var(--color-theme-2);
    margin-bottom: 2.5rem;
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
  }
  .emoji {
    font-size: 2.2rem;
    vertical-align: middle;
  }

  .upload-area {
    background: #fafdff;
    padding: 2rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(64,117,166,0.07);
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
  }

  .file-label {
    display: flex;
    align-items: center;
    gap: 1em;
    background: #fff;
    border: 1.5px solid #c3d0e0;
    border-radius: 6px;
    padding: 0.7em 1.2em;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-theme-3);
    transition: border 0.2s;
    width: 100%;
    max-width: 350px;
    justify-content: center;
  }
  .file-label input[type="file"] {
    display: none;
  }
  .file-label span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
    display: inline-block;
  }

  button {
    min-width: 180px;
    font-size: 1.1rem;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(64,117,166,0.07);
  }

  .xml-output {
    background: #23272e;
    color: #e0e0e0;
    border-radius: 8px;
    margin: 1.5rem 0 0.5rem 0;
    padding: 1rem 1.2rem;
    font-size: 1rem;
    box-shadow: 0 1px 4px rgba(64,117,166,0.10);
    text-align: left;
    max-width: 100%;
    overflow-x: auto;
    word-break: break-all;
  }
  .xml-output .title {
    color: #ffb86c;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.5em;
  }
  .xml-output pre {
    background: none;
    color: #e0e0e0;
    margin: 0;
    padding: 0;
    font-size: 1em;
    font-family: var(--font-mono);
    white-space: pre-wrap;
  }
  .xml-output.debug-xml pre {
    max-height: 300px;
    overflow-y: auto;
    padding: 0.5rem;
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
  }

  .error {
    color: #fff;
    background: #ff3e00;
    padding: 1rem;
    border-radius: 6px;
    margin: 1.5rem 0;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 1px 4px rgba(255,62,0,0.08);
  }

  .result {
    background: #fafdff;
    padding: 2rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(64,117,166,0.07);
    margin-top: 2rem;
    text-align: center;
  }

  .location {
    font-size: 1.4rem;
    color: var(--color-theme-2);
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .coordinates {
    color: var(--color-theme-3);
    font-family: var(--font-mono);
    margin-bottom: 1.5rem;
  }
</style>
