<script>
  import { onMount } from 'svelte';

  export let lat;
  export let lng;

  let mapContainer;
  let map;

  onMount(async () => {
    // Dynamically import Leaflet only on client
    const L = await import('leaflet');
    // Fix for default icon path in many bundlers
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    map = L.map(mapContainer).setView([Number(lat), Number(lng)], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([Number(lat), Number(lng)]).addTo(map)
      .bindPopup('Identified Location')
      .openPopup();
  });
</script>

<div bind:this={mapContainer} class="map-container" />

<style>
  @import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

  .map-container {
    height: 400px;
    width: 100%;
    margin-top: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 0;
  }

  .map-container :global(.leaflet-popup-content) {
    color: var(--color-text) !important;
  }
</style>
