export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // GET: Redirect to original URL
    if (request.method === 'GET' && path) {
      const originalUrl = await env.URLS.get(path);
      if (originalUrl) {
        return Response.redirect(originalUrl, 301);
      }
      return new Response('URL not found', { status: 404 });
    }

    // POST: Create short URL
    if (request.method === 'POST' && path === 'shorten') {
      try {
        const { url: longUrl } = await request.json();
        
        // Validasi URL
        if (!longUrl || !longUrl.startsWith('http')) {
          return new Response(JSON.stringify({ error: 'Invalid URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Generate short code
        const shortCode = generateShortCode();
        
        // Simpan ke KV dengan TTL 30 hari
        await env.URLS.put(shortCode, longUrl, { expirationTtl: 2592000 });
        
        const baseUrl = url.origin;
        return new Response(JSON.stringify({
          shortUrl: `${baseUrl}/${shortCode}`,
          shortCode,
          originalUrl: longUrl,
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

// Generate short code (6 karakter)
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
