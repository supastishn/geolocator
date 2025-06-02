import { get } from 'svelte/store';
import { settings } from './stores.js';

const SYSTEM_PROMPT = `
You are an expert geolocation AI. Your task is to identify locations using satellite imagery.
Respond EXCLUSIVELY using these XML tags:

<thinking>[Your reasoning process]</thinking>
<satellite>
  <latitude>[Decimal coordinate]</latitude>
  <longitude>[Decimal coordinate]</longitude>
</satellite>
<answer>
  <city>[City name]</city>
  <country>[Country name]</country>
</answer>

Rules:
1. First analyze the image features
2. Request satellite views using <satellite> when needed
3. Final answer MUST include both <satellite> and <answer>
`.trim();

/**
 * Helper to build the user message for OpenAI API.
 * If isIterate is true, sends both the original and satellite images.
 */
function buildMessage(imageData, mapUrl, isIterate = false) {
  if (!isIterate || !mapUrl) {
    return [
      { type: "text", text: "Identify this location:" },
      { type: "image_url", image_url: { url: imageData } }
    ];
  }
  return [
    { type: "text", text: "Original photo and satellite view:" },
    { type: "image_url", image_url: { url: imageData } },
    { type: "image_url", image_url: { url: mapUrl } }
  ];
}

/**
 * getLocation with streaming support.
 * @param {string} imageData
 * @param {(xmlChunk: string) => void} onStreamChunk - callback for streaming XML output
 * @param {string|null} mapUrl - optional satellite image url for iteration
 * @returns {Promise<object|null>}
 */
export async function getLocation(imageData, onStreamChunk = null, mapUrl = null) {
  const settingsValue = get(settings);
  const messages = [{
    role: "system",
    content: SYSTEM_PROMPT
  }, {
    role: "user",
    content: buildMessage(imageData, mapUrl, !!mapUrl)
  }];

  // Use OpenAI streaming API
  const response = await fetch(`${settingsValue.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settingsValue.apiKey}`
    },
    body: JSON.stringify({
      model: settingsValue.model,
      messages,
      max_tokens: 1000,
      stream: true
    })
  });

  if (!response.ok) {
    let err = 'Failed to get location';
    try {
      const data = await response.json();
      err = data.error?.message || err;
    } catch {}
    throw new Error(err);
  }

  // Stream the response
  let content = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      // OpenAI streams as "data: ..." lines
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              if (onStreamChunk) onStreamChunk(content);
            }
          } catch {}
        }
      }
    }
  }

  // Parse the streamed content as XML
  const parser = new DOMParser();
  const wrappedContent = `<root>${content}</root>`;
  const xmlDoc = parser.parseFromString(wrappedContent, "text/xml");

  if (xmlDoc.querySelector('answer')) {
    return {
      city: xmlDoc.querySelector('city')?.textContent || 'Unknown',
      country: xmlDoc.querySelector('country')?.textContent || 'Unknown',
      latitude: xmlDoc.querySelector('latitude')?.textContent || '0',
      longitude: xmlDoc.querySelector('longitude')?.textContent || '0'
    };
  }

  return null;
}

function getSatelliteImage(lat, lng, apiKey) {
  // No longer using Google Maps API, return a placeholder or OSM static map
  // OpenStreetMap does not provide free static satellite images, so we return a standard map
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x400&markers=${lat},${lng},red-pushpin`;
}
