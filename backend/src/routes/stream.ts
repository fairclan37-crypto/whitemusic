import express from 'express';
import axios from 'axios';

const router = express.Router();

/* ─── Simple in-memory cache ────────────────────────────────────────────── */
interface CachedStream { url: string; expires: number; }
const streamCache = new Map<string, CachedStream>();
const inFlight = new Map<string, Promise<string>>();

/* ─── Piped API instances (pure JS, no binary needed, works on Vercel) ──── */
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
  'https://pipedapi.mha.fi',
  'https://piped.drgns.space',
  'https://pipedapi.adminforge.de',
];

/* ─── Invidious API instances ───────────────────────────────────────────── */
const INVIDIOUS_INSTANCES = [
  'https://invidious.jing.rocks',
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://invidious.drgns.space',
];

/**
 * Fetch stream URL via Piped public API (no binary, pure HTTPS)
 */
async function fetchViaPiped(videoId: string): Promise<string> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await axios.get(`${instance}/streams/${videoId}`, { timeout: 5000 });
      if (res.data?.audioStreams?.length > 0) {
        const sorted = res.data.audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
        if (sorted[0]?.url) return sorted[0].url;
      }
    } catch { /* try next */ }
  }
  throw new Error('Piped API exhausted');
}

/**
 * Fetch stream URL via Invidious public API (no binary, pure HTTPS)
 */
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
  throw new Error('Invidious API exhausted');
}

/**
 * Master resolver: tries all methods
 */
async function fetchStreamUrl(videoId: string): Promise<string> {
  try { return await fetchViaPiped(videoId); } catch {}
  try { return await fetchViaInvidious(videoId); } catch {}
  throw new Error('All stream resolvers failed for: ' + videoId);
}

/* ─── Express Route ─────────────────────────────────────────────────────── */
router.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  // Clear cache on force=true
  if (req.query.force === 'true') streamCache.delete(videoId);

  const now = Date.now();
  let directUrl: string | undefined;

  // Cache hit
  const cached = streamCache.get(videoId);
  if (cached && cached.expires > now) directUrl = cached.url;

  // Resolve if not cached
  if (!directUrl) {
    let promise = inFlight.get(videoId);
    if (!promise) {
      promise = fetchStreamUrl(videoId).finally(() => inFlight.delete(videoId));
      inFlight.set(videoId, promise);
    }

    try {
      directUrl = await promise;
      const expiresAt = now + 2 * 60 * 60 * 1000; // 2 hours
      streamCache.set(videoId, { url: directUrl, expires: expiresAt });
      console.log(`[Stream] Resolved ${videoId}`);
    } catch (err: any) {
      console.error(`[Stream Error] ${videoId}:`, err.message);
      return res.status(500).json({ error: 'Stream unavailable', message: err.message });
    }
  }

  // Return JSON URL for frontend to play directly
  if (req.query.json === 'true' || req.headers.accept?.includes('application/json')) {
    return res.json({ url: directUrl });
  }

  // 302 redirect to direct CDN URL (fastest, no proxy overhead)
  res.redirect(302, directUrl);
});

export default router;
