const MODELS = new Set(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-pro']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Add GEMINI_API_KEY in Vercel Project Settings before using the assistant.' });
  const { image, mimeType = 'image/jpeg', model = 'gemini-3.8-flash', question = '' } = req.body || {};
  if (!image || image.length > 18_000_000) return res.status(400).json({ error: 'Upload an image smaller than 13 MB for AI analysis.' });
  const selectedModel = MODELS.has(model) ? model : 'gemini-3.8-flash';
  const prompt = `You are CharPixel Studio, an expert in making recognisable social-ready ASCII images. Analyse the image and answer the user briefly. Then include exactly one JSON object with these keys: width (integer 55-120), charset (one of standard, blocks, minimal, matrix), brightness (integer -40 to 40), contrast (integer 60 to 180), invert (boolean), reason (short string). Prefer a clear face or subject silhouette. For Instagram Stories recommend a PNG, not pasted text. User request: ${question || 'Recommend the best recognisable ASCII settings.'}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: image } }, { text: prompt }] }] })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || 'Gemini could not analyse that image.');
    res.status(200).json({ text: body?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || 'No response returned.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
}
