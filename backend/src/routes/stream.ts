import express from 'express';
import { spawn } from 'child_process';
import https from 'https';
import http from 'http';

const router = express.Router();

/* ─── In-memory cache ─────────────────────────────────────────────────── */
interface CachedStream { url: string; expires: number; }
const streamCache = new Map<string, CachedStream>();

/**
 * In-flight deduplication: if two requests arrive for the same videoId
 * while yt-dlp is already running, the second one waits on the same promise.
 */
const inFlight = new Map<string, Promise<string>>();

/* ─── Player clients to try (in order) ────────────────────────────────── */
const PLAYER_CLIENTS = [
  'android_vr',  // android VR  – fastest, skips SABR, reliable audio formats
  'mweb',        // mobile web  – fallback
  'ios',         // iOS client  – very reliable
  'tv_embedded', // TV embed    – no JS runtime needed
  'android',     // android client
  'web',         // fallback
];

/* ─── Spawn yt-dlp for one player client ──────────────────────────────── */
function tryClient(videoId: string, client?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'bestaudio/best',
      '-g',
      '--no-playlist',
      ...(client ? ['--extractor-args', `youtube:player_client=${client}`] : []),
      '--socket-timeout', '15',
      '--no-warnings',
      `https://www.youtube.com/watch?v=${videoId}`,
    ];

    console.log(`[yt-dlp] client=${client || 'default'} → ${videoId}`);

    let stdout = '';
    let stderr = '';
    let done   = false;

    const proc = spawn('yt-dlp', args);

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        proc.kill('SIGKILL');
        reject(new Error(`Timed out after 15s (client=${client || 'default'})`));
      }
    }, 15_000);

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      const url = stdout.trim().split('\n')[0].trim();
      if (code === 0 && url && url.startsWith('http')) {
        resolve(url);
      } else {
        reject(new Error(stderr.trim().slice(-300) || `exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

/* ─── Try all clients in sequence ─────────────────────────────────────── */
async function fetchStreamUrl(videoId: string): Promise<string> {
  let lastError = '';
  for (const client of PLAYER_CLIENTS) {
    try {
      return await tryClient(videoId, client);
    } catch (err: any) {
      lastError = err.message || String(err);
      console.warn(`[yt-dlp] client=${client} failed: ${lastError.slice(0, 100)}`);
    }
  }

  // Final fallback without extractor-args
  try {
    return await tryClient(videoId);
  } catch (err: any) {
    lastError = err.message || String(err);
  }

  throw new Error(`All streaming methods failed: ${lastError.slice(0, 150)}`);
}

/* ─── Express route (HTTP Proxy to prevent 403 / CORS breaks) ──────────── */
router.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  // Handle force refresh from frontend retry
  if (req.query.force === 'true') {
    streamCache.delete(videoId);
  }

  const now = Date.now();

  // 1. Cache hit?
  let directUrl: string | undefined;
  const cached = streamCache.get(videoId);
  if (cached && cached.expires > now) {
    console.log(`[Cache Hit] ${videoId}`);
    directUrl = cached.url;
  }

  // 2. Cache miss or forced refresh
  if (!directUrl) {
    let promise = inFlight.get(videoId);
    if (!promise) {
      promise = fetchStreamUrl(videoId).finally(() => inFlight.delete(videoId));
      inFlight.set(videoId, promise);
    } else {
      console.log(`[In-Flight] Sharing yt-dlp promise for ${videoId}`);
    }

    try {
      directUrl = await promise;
      let expiresAt = now + 4 * 60 * 60 * 1000; // default 4 h
      try {
        const expireStr = new URL(directUrl).searchParams.get('expire');
        if (expireStr) expiresAt = parseInt(expireStr) * 1000 - 15 * 60 * 1000;
      } catch { /* keep default */ }

      streamCache.set(videoId, { url: directUrl, expires: expiresAt });
      console.log(`[Cache Write] ${videoId} — expires in ${Math.round((expiresAt - now) / 60000)} min`);
    } catch (err: any) {
      console.error(`[Stream Error] ${videoId}: ${err.message}`);
      return res.status(500).json({
        error:   'Streaming failed',
        message: err.message || 'yt-dlp could not fetch stream URL',
      });
    }
  }

  // 3. Proxy Google Video stream to browser (eliminates 403 Forbidden & CORS errors)
  const httpModule = directUrl.startsWith('https') ? https : http;
  const proxyHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };
  if (req.headers.range) {
    proxyHeaders['range'] = req.headers.range;
  }

  const proxyReq = httpModule.get(directUrl, { headers: proxyHeaders }, (proxyRes) => {
    // If link expired (403/410), invalidate cache so next attempt fetches fresh link
    if (proxyRes.statusCode === 403 || proxyRes.statusCode === 410) {
      console.warn(`[Proxy 403] ${videoId} expired link. Invalidating cache.`);
      streamCache.delete(videoId);
      return res.status(500).json({ error: 'Stream link expired', retry: true });
    }

    res.status(proxyRes.statusCode || 200);
    if (proxyRes.headers['content-type'])   res.setHeader('Content-Type',   proxyRes.headers['content-type']);
    if (proxyRes.headers['content-length']) res.setHeader('Content-Length', proxyRes.headers['content-length']);
    if (proxyRes.headers['content-range'])  res.setHeader('Content-Range',  proxyRes.headers['content-range']);
    if (proxyRes.headers['accept-ranges'])  res.setHeader('Accept-Ranges',  proxyRes.headers['accept-ranges']);
    res.setHeader('Access-Control-Allow-Origin', '*');

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Request Error] ${videoId}: ${err.message}`);
    streamCache.delete(videoId);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy request error', message: err.message });
    }
  });
});

export default router;
