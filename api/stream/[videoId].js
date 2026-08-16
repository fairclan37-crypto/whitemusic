// Vercel Serverless Function: /api/stream/:videoId
// On Vercel, yt-dlp is not available so we return 503 to trigger iframe fallback

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  // yt-dlp is unavailable on Vercel serverless.
  // Return 503 so the frontend audio element fires onerror -> iframe fallback kicks in.
  res.status(503).json({
    error: 'direct_stream_unavailable',
    message: 'Use YouTube iframe fallback',
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
  });
};