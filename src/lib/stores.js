import { writable } from 'svelte/store';

export const settings = writable({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-4-vision-preview',
  provider: 'openai'
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

// Theme store with localStorage persistence
export const theme = writable(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('theme') || 'light'
    : 'light'
);

theme.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', value);
  }
});
