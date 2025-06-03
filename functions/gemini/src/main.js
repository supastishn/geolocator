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
</answer>
`.trim();

// Remove the req.bodyRaw check since we're using body parsing
export default async ({ req, res, log, error }) => {
  if (req.path === "/ping") {
    return res.text("Pong");
  }

  try {
    // Parse body as JSON
    const body = JSON.parse(req.bodyRaw || '{}');
    const base64Image = body.image; // Direct access to image field

    if (!base64Image) {
      return res.json({ error: "Missing 'image' field in request" }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    if (!apiKey) {
      return res.json({ error: "GEMINI_API_KEY not set" }, 500);
    }

    const response = await fetch(
      `${baseUrl}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          }]
        })
      }
    );

    if (!response.ok) {
      const data = await response.text();
      error(`Gemini error ${response.status}: ${data}`);
      return res.json({ error: "Gemini API error" }, 502);
    }

    const result = await response.json();
    // Extract and return response text in OpenAI-like format for compatibility
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
