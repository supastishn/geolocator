import { writable } from 'svelte/store';

export const settings = writable({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-4-vision-preview',
  mapsKey: import.meta.env.VITE_MAPS_KEY || ''
});

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('ai-geolocator-settings');
  if (saved) {
    // Remove mapsKey if present in old settings
    const parsed = JSON.parse(saved);
    if ('mapsKey' in parsed) delete parsed.mapsKey;
    settings.set(parsed);
  }
  settings.subscribe(value => {
    // Remove mapsKey before saving
    const { mapsKey, ...rest } = value;
    localStorage.setItem('ai-geolocator-settings', JSON.stringify(rest));
  });
}
