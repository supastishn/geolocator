 // New system prompt for Gemini
const SYSTEM_PROMPT = `
You are an expert geolocation AI. 
Identify locations using satellite imagery. Respond in EXACTLY this format:

<thinking>Reasoning steps...</thinking>
<satellite>
  <latitude>Decimal coordinate</latitude>
  <longitude>Decimal coordinate</longitude>
</satellite>
<answer>
  <city>City name</city>
  <country>Country name</country>
  <confidence>0-100 confidence score</confidence>
</answer>
`.trim();

export default async ({ req, res, log, error }) => {
  if (req.path === "/ping") {
    return res.text("Pong");
  }

  try {
    // Parse body as JSON
    const body = JSON.parse(req.bodyRaw || '{}');
    const requestedModel = body.model;

    // Auth check: Only allow non-logged users to use Lite model
    const userIdHeader = req.headers['x-appwrite-user-id'];
    const authTokenHeader = req.headers['authorization'];
    if (!userIdHeader && !authTokenHeader && requestedModel !== 'gemini-2.0-flash-lite') {
      return res.json({
        error: "Unauthorized: Non-logged users can only use Lite model"
      }, 401);
    }

    // Multi-image support
    let images = [];
    if (Array.isArray(body.images)) {
      images = body.images;
      if (images.length < 2 || images.length > 5) {
        return res.json({ error: "You must provide 2-5 images for multi-image analysis" }, 400);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    if (!apiKey) {
      return res.json({ error: "GEMINI_API_KEY not set" }, 500);
    }

    let payload;
    if (images.length > 0) {
      // Multi-image payload
      payload = {
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT },
            { text: "Identify location from MULTIPLE related images" },
            ...images.map(image => ({
              inline_data: {
                mime_type: "image/jpeg",
                data: image
              }
            }))
          ]
        }],
        generationConfig: {
          temperature: 0.2
        }
      };
    } else {
      // Single image payload
      const base64Image = body.image;
      if (!base64Image) {
        return res.json({ error: "Missing 'image' field in request" }, 400);
      }
      payload = {
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT },
            {
              text: "Identify the location from this satellite image"
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2
        }
      };
    }

    const response = await fetch(
      `${baseUrl}/${requestedModel || model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const data = await response.text();
      error(`Gemini error ${response.status}: ${data}`);
      return res.json({ error: "Gemini API error" }, 502);
    }

    const result = await response.json();
    // Extract and return response text in OpenAI-like format for compatibility
    let content = '';
    if (result?.candidates?.[0]?.content?.parts) {
      content = result.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('\n\n');  // Support multi-paragraph responses
    } else if (result?.candidates?.[0]?.content?.content) {
      content = result.candidates[0].content.content;
    }
    return res.json({
      choices: [{
        message: {
          content
        }
      }]
    });
  } catch (e) {
    error(e.message);
    return res.json({ error: "Internal server error" }, 500);
  }
};
