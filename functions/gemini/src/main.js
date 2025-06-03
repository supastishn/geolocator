import fetch from 'node-fetch';

const SYSTEM_PROMPT = `
You are an expert geolocation AI. Your task is to identify locations using satellite imagery.
Respond EXCLUSIVELY using these XML tags: 
<thinking>[Reasoning]</thinking>
<satellite>
  <latitude>[Decimal]</latitude>
  <longitude>[Decimal]</longitude>
</satellite>
<answer>
  <city>[City]</city>
  <country>[Country]</country>
</answer>
`.trim();

export default async ({ req, res, log, error }) => {
  // Handle /ping for health check
  if (req.path === "/ping") {
    return res.text("Pong");
  }

  // Parse JSON body for image data
  if (!req.bodyRaw || !req.body) {
    return res.json({ error: "Missing request body" }, 400);
  }

  try {
    const { image: base64Image } = req.body;
    if (!base64Image) {
      return res.json({ error: "Missing 'image' field in request" }, 400);
    }

    // Prepare OpenAI request
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({ error: "OPENAI_API_KEY not set in environment" }, 500);
    }
    const openaiUrl = `${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`;

    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4-vision-preview',
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify the location from this satellite image"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const data = await response.text();
      error(`OpenAI error ${response.status}: ${data}`);
      return res.json({ error: "OpenAI API error" }, 502);
    }

    const result = await response.json();
    return res.json(result);
  } catch (e) {
    error(e.message);
    return res.json({ error: "Internal server error" }, 500);
  }
};
