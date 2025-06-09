<script>
  import { settings } from '$lib/stores';
  import { get } from 'svelte/store';
  import { getLocation, getLocationMulti } from '$lib/geolocator';
  import MapView from '$lib/MapView.svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { auth } from '$lib/authStore';
  import { onMount } from 'svelte';

  marked.setOptions({ breaks: true }); // Convert newlines to <br>
  // Initialize purify only in the browser
  let purify;
  if (browser) {
    purify = DOMPurify(window);
  }

  // Auto-select Lite model for non-auth users
  onMount(() => {
    if ($settings.provider === 'gemini' && !$auth) {
      $settings.geminiModel = 'gemini-2.0-flash-lite';
    }
  });

  // Multi-image state
  const MAX_IMAGES = 5;
  let imageFiles = [];
  let previewImageUrls = [];
  let canAnalyze = false;
  let multiResult = null;

  $: canAnalyze = imageFiles.length > 1 && imageFiles.length <= MAX_IMAGES;

  // Single image state (legacy)
  let imageFile;
  let previewImageUrl = null;
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
  let confidence = '';
  let xmlDoc = null;
  let mapImage = null; // stores the satellite image URL for iteration
  let imageBase64 = null; // stores the original image base64 for iteration

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
        confidence: doc.querySelector('confidence')?.textContent || '',
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

  // Multi-image handler
  function handleImagesChange(e) {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES);
    // Validate all files
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        error = "One or more images too large (max 5MB each)";
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        error = "Unsupported format (use JPEG, PNG or WEBP)";
        return;
      }
    }
    // Revoke old previews
    previewImageUrls.forEach(url => URL.revokeObjectURL(url));
    imageFiles = files;
    previewImageUrls = files.map(file => URL.createObjectURL(file));
    error = null;
  }

  function removeImage(i) {
    if (previewImageUrls[i]) URL.revokeObjectURL(previewImageUrls[i]);
    imageFiles = imageFiles.slice(0, i).concat(imageFiles.slice(i + 1));
    previewImageUrls = previewImageUrls.slice(0, i).concat(previewImageUrls.slice(i + 1));
  }

  // Multi-image analysis
  async function analyzeMultiImages() {
    isLoading = true;
    error = null;
    multiResult = null;
    try {
      const base64Images = await Promise.all(
        imageFiles.map(file => readFileAsBase64(file))
      );
      multiResult = await getLocationMulti(base64Images);
    } catch (e) {
      error = e.message;
    }
    isLoading = false;
  }

  // Handle file input change for preview and validation (legacy single)
  function handleImageChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Security: validate file size and type
    if (files[0].size > 5 * 1024 * 1024) { // 5MB limit
      error = "Image too large (max 5MB)";
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(files[0].type)) {
      error = "Unsupported format (use JPEG, PNG or WEBP)";
      return;
    }

    imageFile = files;
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
    previewImageUrl = URL.createObjectURL(files[0]);
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
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      previewImageUrl = null;
    }

    try {
      imageBase64 = await readFileAsBase64(imageFile[0]);
      // Capture current value
      const modelName = $settings.geminiModel;
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
          confidence = fields.confidence;

          // If satellite is requested, store coordinates
          if (fields.hasSatellite && latitude && longitude) {
            mapImage = await getSatelliteImage(latitude, longitude);
          }
        },
        null, // mapUrl
        modelName // Pass selected model
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

    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      previewImageUrl = null;
    }

    try {
      // Use stored imageBase64 and mapImage for dual-image iteration
      if (!imageBase64 || !mapImage) {
        error = "Missing image or satellite data for iteration.";
        isLoading = false;
        streaming = false;
        return;
      }
      // Capture current value
      const modelName = $settings.geminiModel;
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
          confidence = fields.confidence;

          if (fields.hasSatellite && latitude && longitude) {
            mapImage = await getSatelliteImage(latitude, longitude);
          }
        },
        mapImage, // satellite image
        modelName // Pass selected model
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

  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
    previewImageUrls.forEach(url => URL.revokeObjectURL(url));
  });
</script>

<svelte:head>
  <title>Geobot</title>
</svelte:head>

<main class="container">
  <div class="card">
    <h1>
      <span class="emoji">🛰️</span> GeoBot
    </h1>

    <!-- Model selector dropdown -->
    <div class="model-selector">
      <label for="model">Model:</label>
      <select 
        id="model" 
        bind:value={$settings.model}
        disabled={isLoading}
      >
        <option value="gemini-2.0-flash-lite">Lite</option>
        <option value="gemini-2.0-flash">Medium</option>
        <option value="gemini-2.5-flash-preview-05-20">Pro</option>
      </select>
    </div>
    
    <!-- Multi-image upload section -->
    <div class="upload-area">
      <label class="file-label" for="image-uploads">
        Select Multiple Images (max 5)
      </label>
      <input 
        id="image-uploads"
        type="file" 
        multiple
        accept="image/*" 
        bind:files={imageFiles}
        on:change={handleImagesChange}
        disabled={isLoading}
      />
      <div class="previews">
        {#each previewImageUrls as url, i}
          <div class="preview-card">
            <img src={url} alt="Preview {i+1}" />
            <button on:click={() => removeImage(i)} type="button">×</button>
          </div>
        {/each}
      </div>
      <button on:click={analyzeMultiImages} disabled={!canAnalyze || isLoading}>
        {isLoading ? 'Analyzing Images...' : 'Combine & Analyze Images'}
      </button>
    </div>

    <!-- Legacy single image upload (optional, can be removed if not needed) -->
    <div class="upload-area" style="margin-top:2rem;">
      <label class="file-label">
        <input 
          type="file" 
          accept="image/*" 
          on:change={handleImageChange}
          disabled={isLoading}
        />
        <span>{imageFile && imageFile.length ? imageFile[0].name : 'Choose an image...'}</span>
      </label>
      <button on:click={handleSubmit} disabled={isLoading || !imageFile}>
        {isLoading ? 'Analyzing Location...' : 'Find Location'}
      </button>
    </div>

    {#if previewImageUrl}
      <div class="image-preview-card card">
        <h3>Image Preview</h3>
        <img src={previewImageUrl} alt="Upload preview" class="preview-image" />
        <br />
        <button on:click={() => {
          if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
          previewImageUrl = null;
          imageFile = null;
        }} class="remove-button">
          Remove Image
        </button>
      </div>
    {/if}
    {#if streaming && streamingXml}
      <div class="xml-output">
        <div class="title">Streaming XML output:</div>
        <pre>{streamingXml.split('\n').slice(-8).join('\n')}</pre>
      </div>
    {/if}

    {#if error}
      <div class="error">
        {#if error.includes('Unauthorized')}
          <div>Non-logged users can only use Lite model. Please <a href="{base}/login">login</a> or switch to Lite model</div>
        {:else}
          {error}
        {/if}
      </div>
    {/if}

    <!-- Multi-image result -->
    {#if multiResult}
      <div class="result-card card">
        <h2>Combined Location Result:</h2>
        <p class="location">{multiResult.city}, {multiResult.country}</p>
        <p class="coordinates">Coordinates: {multiResult.latitude}, {multiResult.longitude}</p>
        <p class="confidence">Confidence: {multiResult.confidence}%</p>
        <MapView 
          lat={multiResult.latitude} 
          lng={multiResult.longitude} 
        />
      </div>
    {/if}

    <!-- Analysis results -->
    {#if !isLoading && (thinking || latitude || longitude)}
      <div class="ai-info card">
        <h2>AI Reasoning</h2>
        <div class="location-identity">
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
          <div class="confidence-row">
            {#if confidence}
              <span><strong>Confidence:</strong> {confidence}%</span>
            {/if}
          </div>
        </div>
        
        {#if thinking}
          <div class="thinking">
            <strong>Analysis:</strong>
            <article class="thinking-box markdown">
              {@html purify?.sanitize(marked.parse(thinking || ''))}
            </article>
          </div>
        {/if}
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
        <p class="confidence">Confidence: {result.confidence}%</p>
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
  color: var(--color-text);
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
  color: var(--color-text);
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
  color: var(--color-text);
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

.result-card h2,
.result-card .location,
.result-card .coordinates {
  color: var(--color-text);
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
  .image-preview-card {
    margin-top: 1.5rem;
    text-align: center;
    padding: 1rem;
  }

  .model-selector {
    display: flex;
    justify-content: center;
    width: fit-content;
    margin: 0 auto 1.5rem;
    align-items: center;
    gap: 0.75rem;
    border-radius: var(--border-radius-sm);
    padding: 0.8rem 1.2rem;
    background: var(--color-surface-2);
    border: 1px solid var(--border-color);
  }

  .model-selector label {
    font-weight: 500;
    margin-right: 0.5rem;
    color: var(--color-text);
  }

  .model-selector select {
    background: var(--color-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    padding: 0.5rem 1rem;
    color: var(--color-text);
    font-size: 1rem;
  }

  .model-selector select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }

  button[disabled], select[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .preview-image {
    max-width: 100%;
    max-height: 300px;
    border-radius: var(--border-radius-sm);
    margin: 1rem 0;
    border: 1px solid var(--border-color);
  }

  .remove-button {
    background: var(--color-danger);
    color: white;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
  }
  /* Add style for confidence row */
  .confidence-row {
    margin-top: 1rem;
  }
  
  .confidence-row span {
    background: var(--color-surface-2);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-sm);
    font-weight: 500;
    border: 1px solid var(--border-color);
  }

  .confidence {
    margin-top: 0.5rem;
    font-weight: 600;
    color: var(--color-primary);
    font-size: 1.1rem;
  }

  /* Add this at the end of the style tag */
  .result-card p.location,
  .result-card p.coordinates {
    max-width: 100%;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
    padding: 0 1rem;
  }

  .result-card p.coordinates {
    word-break: break-word;
  }
/* Multi-image preview styles */
.preview-card {
  position: relative;
  display: inline-block;
  margin: 10px;
}

.preview-card img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 2px solid var(--color-primary);
  border-radius: var(--border-radius-sm);
}

.preview-card button {
  position: absolute;
  top: -5px;
  right: -5px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 0;
  background: var(--color-danger);
  color: white;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}

.previews {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
}
</style>
