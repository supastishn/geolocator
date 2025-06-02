import fetch from 'node-fetch';

export default async ({ req, res, log, error }) => {
  const apiKey = process.env.MAPBOX_TOKEN;
  const baseUrl = 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static';

  if (!apiKey) {
    error("MAPBOX_TOKEN is not set");
    return res.json({ error: "MAPBOX_TOKEN environment variable not configured" }, 500);
  }

  try {
    const { lat, lon, zoom = 14, width = 800, height = 600 } = req.query;
    if (!lat || !lon) {
      return res.json({ error: "Missing required parameters: lat and lon" }, 400);
    }

    const marker = `pin-s+ff0000(${lon},${lat})`;
    const mapboxUrl = `${baseUrl}/${marker}/${lon},${lat},${zoom}/${width}x${height}?access_token=${apiKey}`;

    const imageResponse = await fetch(mapboxUrl);
    if (!imageResponse.ok) {
      return res.json({
        error: `Mapbox API error: ${imageResponse.statusText}`,
        status: imageResponse.status
      }, imageResponse.status);
    }

    const buffer = await imageResponse.buffer();
    return res.binary(buffer, imageResponse.status, {
      'Content-Type': 'image/png'
    });
  } catch (e) {
    error(e.message);
    return res.json({ error: 'Internal server error' }, 500);
  }
};
