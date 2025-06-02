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

  // New state for parsed info
  let thinking = '';
  let latitude = '';
  let longitude = '';
  let city = '';
  let country = '';
  let xmlDoc = null;
  let mapImage = null; // stores the satellite image URL for iteration
  let imageBase64 = null; // stores the original image base64 for iteration

  // Manual iteration workflow state
  // let iterationPhase = 'initial'; // Removed: no longer needed

  // Helper to parse XML for <thinking>, <latitude>, <longitude>, <city>, <country>
  function parseXmlFields(xml) {
    try {
      // Wrap XML content in a root element
      const wrappedXml = `<root>${xml}</root>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(wrappedXml, "text/xml");
      return {
        thinking: doc.querySelector('thinking')?.textContent || '',
        latitude: doc.querySelector('latitude')?.textContent || '',
        longitude: doc.querySelector('longitude')?.textContent || '',
        city: doc.querySelector('city')?.textContent || '',
        country: doc.querySelector('country')?.textContent || '',
        hasSatellite: !!doc.querySelector('satellite'),
        hasAnswer: !!doc.querySelector('answer'),
        xmlDoc: doc
      };
    } catch {
      return {};
    }
  }

  // Helper to get satellite image URL (should match geolocator.js)
  async function getSatelliteImage(lat, lon) {
    return `https://fra.cloud.appwrite.io/v1/functions/get-mapbox/executions?lat=${lat}&lon=${lon}&zoom=15&width=800&height=600`;
  }

  // Helper to read file as base64
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Initial submit: only 1 iteration, show info, allow user to iterate
  const handleSubmit = async () => {
    if (!imageFile) return;

    isLoading = true;
    error = null;
    result = null;
    streamingXml = '';
    finalXml = '';
    streaming = true;
    thinking = '';
    latitude = '';
    longitude = '';
    city = '';
    country = '';
    xmlDoc = null;
    mapImage = null;
    imageBase64 = null;
    // Removed: iterationPhase

    try {
      imageBase64 = await readFileAsBase64(imageFile[0]);
      // Only do 1 iteration for initial run
      const location = await getLocation(
        imageBase64,
        async (xml) => {
          streamingXml = xml;
          const fields = parseXmlFields(xml);
          thinking = fields.thinking;
          latitude = fields.latitude;
          longitude = fields.longitude;
          city = fields.city;
          country = fields.country;
          xmlDoc = fields.xmlDoc;

          // If satellite is requested, store coordinates
          if (fields.hasSatellite && latitude && longitude) {
            mapImage = await getSatelliteImage(latitude, longitude);
            // Removed: iterationPhase
          } // Removed: else if (fields.hasAnswer) { iterationPhase = 'done'; }
        }
      );
      finalXml = streamingXml;
      result = location;
      isLoading = false;
      streaming = false;

      // Automated iteration if satellite is needed and result not found
      if (mapImage && !result) {
        try {
          await handleIterate();
        } catch (err) {
          error = err?.message || 'Iteration failed automatically';
        }
      }

      if (!location && !mapImage) {
        error = "Failed to identify location. Please try another image.";
      }
    } catch (err) {
      error = err?.message || 'An error occurred during location analysis.';
      isLoading = false;
      streaming = false;
    }
  };

  // User triggers next iteration (satellite)
  const handleIterate = async () => {
    isLoading = true;
    error = null;
    streaming = true;
    // Removed: iterationPhase

    try {
      // Use stored imageBase64 and mapImage for dual-image iteration
      if (!imageBase64 || !mapImage) {
        error = "Missing image or satellite data for iteration.";
        isLoading = false;
        streaming = false;
        return;
      }
      const location = await getLocation(
        imageBase64,
        async (xml) => {
          streamingXml = xml;
          const fields = parseXmlFields(xml);
          thinking = fields.thinking;
          latitude = fields.latitude;
          longitude = fields.longitude;
          city = fields.city;
          country = fields.country;
          xmlDoc = fields.xmlDoc;

          if (fields.hasSatellite && latitude && longitude) {
            mapImage = await getSatelliteImage(latitude, longitude);
          } // Removed: else if (fields.hasAnswer) { iterationPhase = 'done'; }
        },
        mapImage // pass satellite image url for dual-image
      );
      finalXml = streamingXml;
      result = location;
      isLoading = false;
      streaming = false;

      if (!location && !result) {
        error = "Failed to identify location. Please try another image.";
      }
    } catch (err) {
      error = err?.message || 'An error occurred during satellite iteration.';
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
    <div class="xml-output">
      <div class="title">Streaming XML output:</div>
      <pre>{streamingXml.split('\n').slice(-8).join('\n')}</pre>
    </div>
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if !isLoading && (thinking || latitude || longitude)}
    <div class="ai-info">
      <h2>AI Reasoning</h2>
      {#if thinking}
        <div class="thinking">
          <strong>Thinking:</strong>
          <div class="thinking-box">{thinking}</div>
        </div>
      {/if}
      <div class="coords-row">
        {#if latitude}
          <span><strong>Latitude:</strong> {latitude}</span>
        {/if}
        {#if longitude}
          <span><strong>Longitude:</strong> {longitude}</span>
        {/if}
      </div>
      {#if city || country}
        <div class="city-country-row">
          {#if city}
            <span><strong>City:</strong> {city}</span>
          {/if}
          {#if country}
            <span><strong>Country:</strong> {country}</span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if !isLoading && finalXml}
    <div class="xml-output debug-xml">
      <div class="title">Final XML Output:</div>
      <pre>{finalXml}</pre>
    </div>
  {/if}

  {#if !isLoading && mapImage && !result}
    <div class="satellite-view">
      <img src={mapImage} alt="Satellite view" class="satellite-image" />
    </div>
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
  .ai-info {
    background: #fafdff;
    border: 1.5px solid #c3d0e0;
    border-radius: 10px;
    padding: 1.2rem 1.5rem;
    margin: 1.5rem 0 1rem 0;
    box-shadow: 0 1px 4px rgba(64,117,166,0.07);
  }
  .ai-info h2 {
    color: var(--color-theme-2);
    font-size: 1.2rem;
    margin-bottom: 0.7rem;
    font-weight: 700;
  }
  .thinking {
    margin-bottom: 0.7rem;
  }
  .thinking-box {
    background: #f6fafd;
    border-radius: 6px;
    padding: 0.7em 1em;
    font-family: var(--font-mono);
    color: #1a2636;
    font-size: 1.05em;
    margin-top: 0.2em;
    word-break: break-word;
  }
  .coords-row {
    display: flex;
    gap: 2em;
    font-size: 1.1em;
    margin-top: 0.5em;
    color: var(--color-theme-3);
  }

  .city-country-row {
    display: flex;
    gap: 2em;
    font-size: 1.1em;
    margin-top: 0.5em;
    color: var(--color-theme-3);
  }

  .ai-info .city-country-row span {
    padding: 0.2em 0.5em;
    background-color: #f6fafd;
    border-radius: 4px;
  }
  .iterate-row {
    display: flex;
    justify-content: center;
    margin: 1.2rem 0 0.5rem 0;
  }

  .satellite-view {
    margin-top: 1.5rem;
    text-align: center;
  }

  .satellite-image {
    max-width: 350px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .satellite-view button {
    margin: 0 auto;
  }
</style>
