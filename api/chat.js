// Vercel serverless proxy: keeps GROQ_API_KEY on the server.
// Set GROQ_API_KEY in Vercel -> Project Settings -> Environment Variables.
// index.html calls POST /api/chat automatically when no browser-side key is set.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({ error: { message: 'GROQ_API_KEY is not configured on the server.' } });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  // Only forward the fields we expect, and cap abuse-prone values.
  const payload = {
    model: body.model || 'llama-3.3-70b-versatile',
    messages: Array.isArray(body.messages) ? body.messages.slice(-30) : [],
    stream: body.stream !== false,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
    max_tokens: Math.min(Number(body.max_tokens) || 1800, 2500),
  };

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
    });

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-transform');

    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (e) {
    res.status(502).json({ error: { message: 'Upstream request failed.' } });
  }
}
