import { get } from 'svelte/store';
import { settings } from './stores.js';
import { functions, auth } from './authStore';

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
  <confidence>[0-100 confidence score]</confidence>
</answer>

Rules:
1. First analyze the image features
2. Request satellite views using <satellite> when needed
3. Final answer MUST include both <satellite> and <answer>
4. Include confidence score (0-100) based on your certainty
`.trim();

const MULTI_IMAGE_PROMPT = SYSTEM_PROMPT + `
6. Analyze features across ALL provided images
7. Identify geographical relationships between images
8. Improve confidence using combined evidence
`;

/**
 * Helper to build the user message for OpenAI API.
 * If isIterate is true, sends both the original and satellite images.
 * Accepts context string.
 */
function buildMessage(imageData, mapUrl, isIterate = false, context = '') {
  const confidenceInstruction = "\n5. Confidence score (0-100) based on your certainty MUST be provided in <confidence> tag";
  if (!isIterate || !mapUrl) {
    const baseText = "Identify this location";
    const contextText = context ? ` with context: "${context}"` : '';
    return [
      { 
        type: "text", 
        text: `${baseText}${contextText}.${confidenceInstruction}` 
      },
      { type: "image_url", image_url: { url: imageData } }
    ];
  }
  // For iteration, include context as well
  const baseText = "Original photo and satellite view";
  const contextText = context ? ` with context: "${context}"` : '';
  return [
    { 
      type: "text", 
      text: `${baseText}${contextText}.${confidenceInstruction}` 
    },
    { type: "image_url", image_url: { url: imageData } },
    { type: "image_url", image_url: { url: mapUrl } }
  ];
}

/**
 * getLocation with streaming support.
 * @param {string} imageData
 * @param {(xmlChunk: string) => void} onStreamChunk - callback for streaming XML output
 * @param {string|null} mapUrl - optional satellite image url for iteration
 * @param {string} modelName - Gemini model name to use (optional, defaults to 'gemini-2.0-flash')
 * @param {string} context - optional user context
 * @returns {Promise<object|null>}
 */
export async function getLocation(imageData, onStreamChunk = null, mapUrl = null, modelName = 'gemini-2.0-flash', context = '') {
  const settingsValue = get(settings);
  const authState = get(auth);

  // ENSURE ONLY LITE IS USED FOR NON-AUTH
  if (settingsValue.provider === 'gemini' && !authState) {
    modelName = 'gemini-2.0-flash-lite';
  }

  if (settingsValue.provider === 'gemini') {
    // Handle Gemini function call
    const response = await callGeminiFunction(
      imageData,
      modelName, // Pass selected model
      context // Pass context
    );
    if (!response.ok) {
      let err = 'Failed to get location (Gemini)';
      try {
        const data = response.json;
        err = data.error || err;
      } catch {}
      throw new Error(err);
    }
    const data = response.json; // Use directly parsed JSON object
    // Try to extract the XML content from Gemini's response
    let content = '';
    // Try to find the XML in the response (OpenAI format: choices[0].message.content)
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      content = data.choices[0].message.content;
      if (onStreamChunk) onStreamChunk(content);
    } else if (typeof data === 'string') {
      content = data;
      if (onStreamChunk) onStreamChunk(content);
    } else {
      throw new Error('Unexpected Gemini function response');
    }

    // Parse the content as XML
    const parser = new DOMParser();
    const wrappedContent = `<root>${content}</root>`;
    const xmlDoc = parser.parseFromString(wrappedContent, "text/xml");

    if (xmlDoc.querySelector('answer')) {
      return {
        city: xmlDoc.querySelector('city')?.textContent || 'Unknown',
        country: xmlDoc.querySelector('country')?.textContent || 'Unknown',
        latitude: xmlDoc.querySelector('latitude')?.textContent || '0',
        longitude: xmlDoc.querySelector('longitude')?.textContent || '0',
        confidence: xmlDoc.querySelector('confidence')?.textContent || '0'
      };
    }
    return null;
  } else {
    // Existing OpenAI API call
    const messages = [{
      role: "system",
      content: SYSTEM_PROMPT
    }, {
      role: "user",
      content: buildMessage(imageData, mapUrl, !!mapUrl, context)
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
        longitude: xmlDoc.querySelector('longitude')?.textContent || '0',
        confidence: xmlDoc.querySelector('confidence')?.textContent || '0'
      };
    }

    return null;
  }
}

async function getSatelliteImage(lat, lon) {
  // Use Appwrite Functions SDK to execute the get-mapbox function
  const execution = await functions.createExecution(
    'get-mapbox',
    '', // No body needed for GET
    false,
    '/', // Path should be '/'
    'GET',
    {},
    { lat: String(lat), lon: String(lon), zoom: '15', width: '800', height: '600' }
  );
  // Use the correct output URL pattern for Appwrite
  return `https://fra.cloud.appwrite.io/v1/projects/geolocatr/functions/get-mapbox/executions/${execution.$id}/output`;
}

/**
 * Multi-image geolocation function
 * @param {string[]} imageDatas
 * @param {(xmlChunk: string) => void} onStreamChunk
 * @param {string} modelName
 * @param {string} context
 */
export async function getLocationMulti(imageDatas, onStreamChunk = null, modelName = 'gemini-2.0-flash', context = '') {
  const settingsValue = get(settings);
  const authState = get(auth);

  // ENSURE ONLY LITE IS USED FOR NON-AUTH
  if (settingsValue.provider === 'gemini' && !authState) {
    modelName = 'gemini-2.0-flash-lite';
  }

  if (settingsValue.provider === 'gemini') {
    // Gemini multi-image function call
    const response = await callGeminiFunctionMulti(
      imageDatas,
      modelName, // Pass selected model
      context // Pass context
    );
    if (!response.ok) {
      let err = 'Failed to get location (Gemini Multi)';
      try {
        const data = response.json;
        err = data.error || err;
      } catch {}
      throw new Error(err);
    }
    const data = response.json;
    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      content = data.choices[0].message.content;
      if (onStreamChunk) onStreamChunk(content);
    } else if (typeof data === 'string') {
      content = data;
      if (onStreamChunk) onStreamChunk(content);
    } else {
      throw new Error('Unexpected Gemini function response');
    }

    // Parse the content as XML
    const parser = new DOMParser();
    const wrappedContent = `<root>${content}</root>`;
    const xmlDoc = parser.parseFromString(wrappedContent, "text/xml");

    if (xmlDoc.querySelector('answer')) {
      return {
        city: xmlDoc.querySelector('city')?.textContent || 'Unknown',
        country: xmlDoc.querySelector('country')?.textContent || 'Unknown',
        latitude: xmlDoc.querySelector('latitude')?.textContent || '0',
        longitude: xmlDoc.querySelector('longitude')?.textContent || '0',
        confidence: xmlDoc.querySelector('confidence')?.textContent || '0'
      };
    }
    return null;
  } else {
    // OpenAI multi-image call
    const messages = [{
      role: "system",
      content: MULTI_IMAGE_PROMPT
    }, {
      role: "user",
      content: [
        { 
          type: "text", 
          text: `Analyze these RELATED location images${context ? ` with context: "${context}"` : ''}:` 
        },
        ...imageDatas.map(data => ({
          type: "image_url",
          image_url: { url: data }
        }))
      ]
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
        longitude: xmlDoc.querySelector('longitude')?.textContent || '0',
        confidence: xmlDoc.querySelector('confidence')?.textContent || '0'
      };
    }

    return null;
  }
}

/**
 * Gemini function call helper for multi-image using Appwrite Functions SDK.
 * @param {string[]} base64Images
 * @param {string} modelName
 * @param {string} context
 * @returns {Promise<{ok: boolean, json: function(): Promise<any>}>}
 */
async function callGeminiFunctionMulti(base64Images, modelName, context = '') {
  // Remove data URL prefix for each image
  const images = base64Images.map(img =>
    img.startsWith('data:') ? img.split(',')[1] : img
  );

  const payload = JSON.stringify({
    images,
    model: modelName, // Use selected model
    context
  });

  try {
    const execution = await functions.createExecution(
      'gemini',
      payload,
      false,
      '/', // Path should be '/'
      'POST',
      {
        'Content-Type': 'application/json',
        'Content-Length': String(payload.length)
      }
    );

    // Error handling for unauthorized use
    if (execution.responseStatusCode === 401) {
      throw new Error("Unauthorized: Non-logged users can only use Lite model");
    }

    return {
      ok: execution.status === 'completed',
      json: JSON.parse(execution.responseBody || '{}')
    };
  } catch (e) {
    // If error is thrown, return error object in OpenAI-like format
    return {
      ok: false,
      json: async () => ({ error: e.message })
    };
  }
}

/**
 * Gemini function call helper using Appwrite Functions SDK.
 * @param {string} base64Image
 * @param {string} modelName
 * @param {string} context
 * @returns {Promise<{ok: boolean, json: function(): Promise<any>}>}
 */
async function callGeminiFunction(base64Image, modelName, context = '') {
  // Remove data URL prefix
  const base64Data = base64Image.startsWith('data:')
    ? base64Image.split(',')[1]
    : base64Image;

  const payload = JSON.stringify({
    image: base64Data,
    model: modelName, // Use selected model
    context
  });

  try {
    const execution = await functions.createExecution(
      'gemini',
      payload,
      false,
      '/', // Path should be '/'
      'POST',
      {
        'Content-Type': 'application/json',
        'Content-Length': String(payload.length)
      }
    );

    // Error handling for unauthorized use
    if (execution.responseStatusCode === 401) {
      throw new Error("Unauthorized: Non-logged users can only use Lite model");
    }

    return {
      ok: execution.status === 'completed',
      json: JSON.parse(execution.responseBody || '{}')
    };
  } catch (e) {
    // If error is thrown, return error object in OpenAI-like format
    return {
      ok: false,
      json: async () => ({ error: e.message })
    };
  }
}
