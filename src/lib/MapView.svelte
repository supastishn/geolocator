<script>
  import { onMount } from 'svelte';
  import { Loader } from '@googlemaps/js-api-loader';
  import { settings } from './stores.js';
  
  export let lat;
  export let lng;
  
  let mapContainer;
  let map;
  
  onMount(async () => {
    const { mapsKey } = $settings;
    
    const loader = new Loader({
      apiKey: mapsKey,
      version: "weekly"
    });
    
    const google = await loader.load();
    
    map = new google.maps.Map(mapContainer, {
      center: { lat: Number(lat), lng: Number(lng) },
      zoom: 14,
      mapTypeId: 'satellite'
    });
    
    new google.maps.Marker({
      position: { lat: Number(lat), lng: Number(lng) },
      map,
      title: "Identified Location"
    });
  });
</script>

<div bind:this={mapContainer} class="map-container" />

<style>
  .map-container {
    height: 400px;
    width: 100%;
    margin-top: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>