// Vercel Serverless Function: /api/search
const yts = require('yt-search');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const query = (req.query.q || req.query.query || '').toString().trim();
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const results = await yts(query);
    const videos = results.videos.slice(0, 20).map(item => ({
      _id: item.videoId,
      title: item.title,
      artist: item.author?.name || 'Unknown Artist',
      cover: item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      audioUrl: `/api/stream/${item.videoId}`,
      duration: item.duration?.timestamp || '0:00',
      durationSeconds: item.seconds || 0,
    }));

    res.status(200).json({ results: videos });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
};