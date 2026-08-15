import express from 'express';
const yts = require('yt-search');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = (req.query.q || req.query.query || '') as string;
    if (!query.trim()) return res.status(400).json({ error: 'Missing query' });

    // Using yt-search (Extremely reliable and fast alternative for queries)
    const results = await yts(query);
    
    const videos = results.videos.slice(0, 15).map((item: any) => ({
      _id: item.videoId,
      title: item.title,
      artist: item.author?.name || 'Unknown Artist',
      cover: item.thumbnail || 'https://picsum.photos/seed/music/300/300',
      audioUrl: `/api/stream/${item.videoId}`,
      duration: item.duration.timestamp,
    }));

    res.json({ results: videos });
  } catch (error: any) {
    console.error('yt-search error:', error.message);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

export default router;
