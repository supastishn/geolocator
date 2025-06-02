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

export async function getLocation(imageData, iterations = 5) {
  const settingsValue = get(settings);
  const messages = [{
    role: "system",
    content: SYSTEM_PROMPT
  }, {
    role: "user",
    content: [
      { type: "text", text: "Identify this location:" },
      { type: "image_url", url: imageData }
    ]
  }];
  
  let locationData = null;
  
  for (let i = 0; i < iterations; i++) {
    const response = await fetch(`${settingsValue.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settingsValue.apiKey}`
      },
      body: JSON.stringify({
        model: settingsValue.model,
        messages,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get location');
    }
    
    const content = data.choices[0].message.content;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    if (xmlDoc.querySelector('answer')) {
      locationData = {
        city: xmlDoc.querySelector('city')?.textContent || 'Unknown',
        country: xmlDoc.querySelector('country')?.textContent || 'Unknown',
        latitude: xmlDoc.querySelector('latitude')?.textContent || '0',
        longitude: xmlDoc.querySelector('longitude')?.textContent || '0'
      };
      break;
    }
    
    if (xmlDoc.querySelector('satellite')) {
      const lat = xmlDoc.querySelector('latitude')?.textContent;
      const lng = xmlDoc.querySelector('longitude')?.textContent;
      
      const mapUrl = await getSatelliteImage(lat, lng, settingsValue.mapsKey);
      
      messages.push({
        role: "assistant",
        content: content
      }, {
        role: "user",
        content: [
          { type: "text", text: "Satellite view:" },
          { type: "image_url", url: mapUrl }
        ]
      });
    }
  }
  
  return locationData;
}

function getSatelliteImage(lat, lng, apiKey) {
  // No longer using Google Maps API, return a placeholder or OSM static map
  // OpenStreetMap does not provide free static satellite images, so we return a standard map
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x400&markers=${lat},${lng},red-pushpin`;
}
