import express from 'express';
import Song from '../models/Song';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ plays: -1 });
    res.json(songs);
  } catch (err) {
    // fallback dummy data
    res.json([
      { _id: '1', title: 'Blinding Lights', artist: 'The Weeknd', category: 'hollywood', cover: 'https://picsum.photos/seed/bl/200/200', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { _id: '2', title: 'Levitating', artist: 'Dua Lipa', category: 'hollywood', cover: 'https://picsum.photos/seed/dua/200/200', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { _id: '3', title: 'Kesariya', artist: 'Arijit Singh', category: 'bollywood', cover: 'https://picsum.photos/seed/kes/200/200', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    ]);
  }
});

export default router;