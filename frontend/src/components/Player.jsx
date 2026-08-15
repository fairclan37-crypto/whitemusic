import { useContext, useRef, useState, useEffect } from 'react';
import { MusicContext } from '../context/MusicContext';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart, Music2
} from 'lucide-react';

export default function Player() {
  const {
    currentSong, isPlaying, togglePlay, nextSong, prevSong,
    shuffle, setShuffle, repeatMode, setRepeatMode,
    favorites, toggleFavorite
  } = useContext(MusicContext);

  const audioRef      = useRef(null);
  const progressRef   = useRef(null);
  const isDraggingRef = useRef(false);
  const retryRef      = useRef(0);
  const ytPlayerRef   = useRef(null);

  const [progress,    setProgress]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(0.75);
  const [isMuted,     setIsMuted]     = useState(false);
  const [error,       setError]       = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);

  const isFav = favorites.includes(currentSong?._id);
  const fmt = s => (!s || !isFinite(s)) ? '0:00'
    : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ─── HTML5 Audio Timeupdate listener ────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a || useEmbedFallback) return;
    const onTime = () => {
      if (isDraggingRef.current) return;
      const t = a.currentTime;
      const d = a.duration;
      if (!isFinite(d) || d === 0) return;
      setCurrentTime(t);
      setProgress((t / d) * 100);
      setDuration(d);
    };
    a.addEventListener('timeupdate', onTime);
    return () => a.removeEventListener('timeupdate', onTime);
  }, [useEmbedFallback]);

  // ─── Song Change Loader ─────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!currentSong) return;

    let isMounted = true;
    setUseEmbedFallback(false);
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    retryRef.current = 0;

    if (!a) return;

    a.src = `${currentSong.audioUrl}?t=${Date.now()}`;
    a.volume = isMuted ? 0 : volume;
    a.load();

    const onCanPlay  = () => {
      if (!isMounted || useEmbedFallback) return;
      setIsLoading(false);
      setError(null);
      if (isFinite(a.duration)) setDuration(a.duration);
      if (isPlaying) a.play().catch(() => {});
    };
    const onDuration = () => { if (isMounted && isFinite(a.duration)) setDuration(a.duration); };
    const onWaiting  = () => { if (isMounted) setIsLoading(true); };
    const onPlaying  = () => { if (isMounted) { setIsLoading(false); setError(null); } };

    a.addEventListener('canplay',        onCanPlay);
    a.addEventListener('durationchange', onDuration);
    a.addEventListener('waiting',        onWaiting);
    a.addEventListener('playing',        onPlaying);
    return () => {
      isMounted = false;
      a.removeEventListener('canplay',        onCanPlay);
      a.removeEventListener('durationchange', onDuration);
      a.removeEventListener('waiting',        onWaiting);
      a.removeEventListener('playing',        onPlaying);
    };
  }, [currentSong]);

  // ─── Play / Pause sync ──────────────────────────────────────────
  useEffect(() => {
    if (useEmbedFallback && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try {
        if (isPlaying) ytPlayerRef.current.playVideo();
        else ytPlayerRef.current.pauseVideo();
      } catch {}
      return;
    }

    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [isPlaying, useEmbedFallback]);

  // ─── Volume sync ────────────────────────────────────────────────
  useEffect(() => {
    if (useEmbedFallback && ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(isMuted ? 0 : volume * 100);
      } catch {}
    } else if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted, useEmbedFallback]);

  // ─── YouTube IFrame Engine Sync & Time Polling ─────────────────
  useEffect(() => {
    if (!useEmbedFallback || !currentSong) return;

    let timer;
    const initYT = () => {
      if (window.YT && window.YT.Player) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          try {
            ytPlayerRef.current.loadVideoById(currentSong._id);
            if (isPlaying) ytPlayerRef.current.playVideo();
          } catch {}
        } else {
          ytPlayerRef.current = new window.YT.Player('yt-player-container', {
            height: '1',
            width: '1',
            videoId: currentSong._id,
            playerVars: { autoplay: 1, controls: 0 },
            events: {
              onReady: (event) => {
                if (isPlaying) event.target.playVideo();
                event.target.setVolume(isMuted ? 0 : volume * 100);
                setIsLoading(false);
                setError(null);
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextSong();
                } else if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsLoading(false);
                  setError(null);
                }
              }
            }
          });
        }
      }
    };

    initYT();

    timer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const t = ytPlayerRef.current.getCurrentTime() || 0;
          const d = ytPlayerRef.current.getDuration() || 0;
          if (d > 0 && !isDraggingRef.current) {
            setCurrentTime(t);
            setDuration(d);
            setProgress((t / d) * 100);
          }
        } catch {}
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [useEmbedFallback, currentSong]);

  // ─── Seek / Volume Handlers ─────────────────────────────────────
  const handleSeek = e => {
    if (!duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const targetTime = x * duration;

    if (useEmbedFallback && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(targetTime, true); } catch {}
    } else if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }

    setProgress(x * 100);
    setCurrentTime(targetTime);
  };

  const handleVolume = e => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleAudioError = () => {
    console.warn('[Player] Switching to YouTube IFrame JS Engine for:', currentSong?._id);
    setUseEmbedFallback(true);
    setError(null);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setUseEmbedFallback(true);
  };

  const audioEl = (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={nextSong}
        onError={handleAudioError}
      />
      <div id="yt-player-container" style={{ width: 1, height: 1, position: 'absolute', opacity: 0, pointerEvents: 'none', overflow: 'hidden' }} />
    </>
  );

  if (!currentSong) {
    return (
      <div>
        {audioEl}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />
        <div style={{
          background: 'rgba(8,12,20,0.96)', padding: '14px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Music2 size={18} color="#3a5070" />
          </div>
          <p style={{ fontSize: 13, color: '#3a5070', fontWeight: 600, margin: 0 }}>
            Select a song to start playing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flexShrink: 0 }}>
      {audioEl}

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.7), transparent)' }} />

      <div style={{ background: 'rgba(8,12,20,0.97)', padding: '8px 24px 14px', position: 'relative' }}>

        {error && (
          <div style={{
            position: 'absolute', top: -46, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(200,40,40,0.92)', color: '#fff',
            padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(12px)', zIndex: 10, whiteSpace: 'nowrap',
          }}>
            ⚠ {error}
            <button onClick={handleRetry} style={{
              background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff',
              padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
            }}>Retry</button>
          </div>
        )}

        {/* Seek bar */}
        <div
          ref={progressRef}
          className="seek-bar"
          onClick={handleSeek}
          onMouseDown={() => { isDraggingRef.current = true; }}
          onMouseUp={()   => { isDraggingRef.current = false; }}
          onMouseLeave={() => { isDraggingRef.current = false; }}
          style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginBottom: 5 }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${progress}%`, borderRadius: 2,
            background: 'linear-gradient(90deg, #00d4ff, #0055cc)',
            boxShadow: '0 0 8px rgba(0,212,255,0.9)',
            transition: 'width 0.25s linear',
          }} />
          <div className="seek-thumb" style={{ left: `${progress}%` }} />
        </div>

        {/* Timestamps */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: 9,
          fontSize: 11, color: '#3a5070', fontVariantNumeric: 'tabular-nums', fontWeight: 500,
        }}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Song info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', display: 'block', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
                onError={e => { e.target.src = 'https://placehold.co/44x44/131b2a/00d4ff?text=♪'; }}
              />
              {isPlaying && (
                <div style={{
                  position: 'absolute', inset: -3, borderRadius: 13,
                  border: '1.5px solid rgba(0,212,255,0.5)',
                  animation: 'pulse-ring 2s ease-out infinite', pointerEvents: 'none',
                }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: '#fff', fontSize: 13, fontWeight: 700, margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {currentSong.title}
              </p>
              <p style={{
                color: '#3a5070', fontSize: 11, fontWeight: 600, margin: '2px 0 0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Center Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShuffle(!shuffle)}
              className="ctrl-btn"
              style={{ color: shuffle ? '#00d4ff' : '#3a5070', padding: 6 }}
              title="Shuffle"
            >
              <Shuffle size={15} />
            </button>

            <button onClick={prevSong} className="ctrl-btn" style={{ padding: 6 }}>
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0055cc 100%)',
                border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 16px rgba(0,212,255,0.5)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isLoading ? (
                <div style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : isPlaying ? (
                <Pause size={18} fill="#fff" />
              ) : (
                <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button onClick={nextSong} className="ctrl-btn" style={{ padding: 6 }}>
              <SkipForward size={18} />
            </button>

            <button
              onClick={() => setRepeatMode((repeatMode + 1) % 3)}
              className="ctrl-btn"
              style={{ color: repeatMode > 0 ? '#00d4ff' : '#3a5070', padding: 6 }}
              title="Repeat"
            >
              {repeatMode === 1 ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </button>

            <button
              onClick={() => toggleFavorite(currentSong._id)}
              className="ctrl-btn"
              style={{ color: isFav ? '#ff4757' : '#3a5070', padding: 6 }}
              title="Favorite"
            >
              <Heart size={15} fill={isFav ? '#ff4757' : 'none'} />
            </button>
          </div>

          {/* Right Volume */}
          <div className="volume-container" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
            <button onClick={toggleMute} className="ctrl-btn" style={{ padding: 4 }}>
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <input
              type="range" min="0" max="1" step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              style={{ width: 70, accentColor: '#00d4ff', cursor: 'pointer', height: 4 }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
