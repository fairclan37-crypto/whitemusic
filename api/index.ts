import express from 'express';
import cors from 'cors';
import axios from 'axios';
const yts = require('yt-search');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

/* ──────────────────────────────────────────────────────────────────
   SEARCH ROUTE
   Uses yt-search (pure JS, no binary, works on Vercel)
────────────────────────────────────────────────────────────────── */
app.get('/api/search', async (req: any, res: any) => {
  try {
    const query = (req.query.q || req.query.query || '') as string;
    if (!query.trim()) return res.status(400).json({ error: 'Missing query' });

    const results = await yts(query);
    const videos = results.videos.slice(0, 15).map((item: any) => ({
      _id: item.videoId,
      title: item.title,
      artist: item.author?.name || 'Unknown Artist',
      cover: item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
      audioUrl: `/api/stream/${item.videoId}`,
      duration: item.duration?.timestamp || '0:00',
    }));

    res.json({ results: videos });
  } catch (error: any) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

/* ──────────────────────────────────────────────────────────────────
   STREAM ROUTE
   Uses Piped / Invidious public APIs — no binary, works on Vercel
────────────────────────────────────────────────────────────────── */
const streamCache = new Map<string, { url: string; expires: number }>();
const inFlight = new Map<string, Promise<string>>();

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
  'https://pipedapi.mha.fi',
  'https://piped.drgns.space',
  'https://pipedapi.adminforge.de',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.jing.rocks',
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
];

async function fetchViaPiped(videoId: string): Promise<string> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await axios.get(`${instance}/streams/${videoId}`, { timeout: 5000 });
      if (res.data?.audioStreams?.length > 0) {
        const sorted = [...res.data.audioStreams].sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
        if (sorted[0]?.url) return sorted[0].url;
      }
    } catch { /* try next */ }
  }
  throw new Error('Piped exhausted');
}

async function fetchViaInvidious(videoId: string): Promise<string> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await axios.get(`${instance}/api/v1/videos/${videoId}`, { timeout: 5000 });
      if (res.data?.adaptiveFormats) {
        const audioFormats = res.data.adaptiveFormats
          .filter((f: any) => f.type?.includes('audio') && f.url)
          .sort((a: any, b: any) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));
        if (audioFormats[0]?.url) return audioFormats[0].url;
      }
    } catch { /* try next */ }
  }
  throw new Error('Invidious exhausted');
}

async function fetchStreamUrl(videoId: string): Promise<string> {
  try { return await fetchViaPiped(videoId); } catch {}
  try { return await fetchViaInvidious(videoId); } catch {}
  throw new Error('All resolvers failed for: ' + videoId);
}

app.get('/api/stream/:videoId', async (req: any, res: any) => {
  const { videoId } = req.params;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  if (req.query.force === 'true') streamCache.delete(videoId);

  const now = Date.now();
  let directUrl: string | undefined;

  const cached = streamCache.get(videoId);
  if (cached && cached.expires > now) directUrl = cached.url;

  if (!directUrl) {
    let promise = inFlight.get(videoId);
    if (!promise) {
      promise = fetchStreamUrl(videoId).finally(() => inFlight.delete(videoId));
      inFlight.set(videoId, promise);
    }

    try {
      directUrl = await promise;
      streamCache.set(videoId, { url: directUrl, expires: now + 2 * 60 * 60 * 1000 });
    } catch (err: any) {
      console.error(`[Stream Error] ${videoId}:`, err.message);
      return res.status(500).json({ error: 'Stream unavailable', message: err.message });
    }
  }

  // 302 redirect to CDN — browser plays directly (fastest approach)
  res.redirect(302, directUrl);
});

/* ──────────────────────────────────────────────────────────────────
   HEALTH CHECK
────────────────────────────────────────────────────────────────── */
app.get('/api/health', (_req: any, res: any) => res.json({ status: 'ok', app: 'White Music' }));

export default app;
