import express from 'express';
const yts = require('yt-search');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = (req.query.q || req.query.query || '') as string;
    if (!query.trim()) return res.status(400).json({ error: 'Missing query' });

    const results = await yts(query);
    
    const videos = results.videos.slice(0, 20).map((item: any) => ({
      _id: item.videoId,
      title: item.title,
      artist: item.author?.name || 'Unknown Artist',
      cover: item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      audioUrl: `/api/stream/${item.videoId}`,
      duration: item.duration?.timestamp || '0:00',
      durationSeconds: item.seconds || 0,
    }));

    res.json({ results: videos });
  } catch (error: any) {
    console.error('yt-search error:', error.message);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

export default router;