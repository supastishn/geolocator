<script>
  import { settings } from '$lib/stores.js';
  import { getLocation } from '$lib/geolocator';
  import MapView from '$lib/MapView.svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';

  marked.setOptions({ breaks: true }); // Convert newlines to <br>
  // Initialize purify only in the browser
  let purify;
  if (browser) {
    purify = DOMPurify(window);
  }

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
    mapImage = null; // stores the satellite image URL for iteration
    imageBase64 = null; // stores the original image base64 for iteration

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
          }
        }
      );
      finalXml = streamingXml;
      result = location;
      isLoading = false;
      streaming = false;

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
          }
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
  <title>Geobot</title>
</svelte:head>

<main class="container">
  <div class="card">
    <h1>
      <span class="emoji">🛰️</span> Geobot
    </h1>
    
    <!-- Upload section -->
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

    <!-- Analysis results -->
    {#if !isLoading && (thinking || latitude || longitude)}
      <div class="ai-info card">
        <h2>AI Reasoning</h2>
        {#if thinking}
          <div class="thinking">
            <strong>Thinking:</strong>
            <article class="thinking-box markdown">
              {@html purify?.sanitize(marked.parse(thinking || ''))}
            </article>
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

    <!-- Satellite image preview -->
    {#if !isLoading && mapImage && !result}
      <div class="satellite-card card">
        <img src={mapImage} alt="Satellite view" />
      </div>
    {/if}

    <!-- Result card -->
    {#if result}
      <div class="result-card card">
        <h2>Location Found:</h2>
        <p class="location">{result.city}, {result.country}</p>
        <p class="coordinates">Coordinates: {result.latitude}, {result.longitude}</p>
        <MapView 
          lat={result.latitude} 
          lng={result.longitude} 
        />
      </div>
    {/if}
  </div>
</main>

<style>
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
}

.card {
  background: var(--color-surface);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  padding: 2rem;
}

.upload-area {
  border-radius: var(--border-radius);
  border: 1px dashed var(--border-color);
  background: var(--color-surface-2);
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text);
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
}

.file-label:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.file-label:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.file-label input[type="file"] {
  display: none;
}

.ai-info {
  background: var(--color-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-sm);
}

.ai-info h2 {
  color: var(--color-primary);
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.thinking-box {
  background: var(--color-surface-2);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
  font-size: 1.05rem;
  line-height: 1.7;
  border-left: 4px solid var(--color-primary);
  margin-top: 0.5rem;
}

.coords-row, .city-country-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.coords-row span, .city-country-row span {
  background: var(--color-surface-2);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
}

.xml-output {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: var(--border-radius-sm);
  margin: 1.5rem 0;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  box-shadow: var(--shadow-md);
}

[data-theme="light"] .xml-output {
  background: #2d3748;
}

.xml-output .title {
  color: #ffd166;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error {
  color: white;
  background: var(--color-danger);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  margin: 1.5rem 0;
  font-weight: 500;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.result-card {
  overflow: visible;
  position: relative;
  background: var(--color-surface);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  margin-top: 2rem;
  text-align: center;
  border: 1px solid var(--border-color);
}

.location {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.coordinates {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.satellite-card {
  padding: 0;
  overflow: hidden;
  margin-top: 1.5rem;
  text-align: center;
  background: transparent;
}

.satellite-card img {
  width: 100%;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  display: block;
}

.markdown h1, .markdown h2, .markdown h3 {
  margin-top: 1.5rem;
}

.markdown p {
  margin: 1rem 0;
}
</style>
