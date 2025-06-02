import { writable } from 'svelte/store';

export const settings = writable({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-4-vision-preview'
});

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('ai-geolocator-settings');
  if (saved) {
    settings.set(JSON.parse(saved));
  }
  settings.subscribe(value => {
    localStorage.setItem('ai-geolocator-settings', JSON.stringify(value));
  });
}
