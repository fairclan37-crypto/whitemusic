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

  const [progress,    setProgress]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(0.75);
  const [isMuted,     setIsMuted]     = useState(false);
  const [error,       setError]       = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const isFav = favorites.includes(currentSong?._id);
  const fmt = s => (!s || !isFinite(s)) ? '0:00'
    : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ─── Timeupdate listener (always attached) ─────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
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
  }, []);

  // ─── Load song ──────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentSong) return;

    setError(null);
    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    retryRef.current = 0;

    a.src = `${currentSong.audioUrl}?t=${Date.now()}`;
    a.volume = isMuted ? 0 : volume;
    a.load();

    const onCanPlay  = () => {
      setIsLoading(false);
      setError(null);
      if (isFinite(a.duration)) setDuration(a.duration);
      if (isPlaying) a.play().catch(() => {});
    };
    const onDuration = () => { if (isFinite(a.duration)) setDuration(a.duration); };
    const onWaiting  = () => setIsLoading(true);
    const onPlaying  = () => { setIsLoading(false); setError(null); };

    a.addEventListener('canplay',        onCanPlay);
    a.addEventListener('durationchange', onDuration);
    a.addEventListener('waiting',        onWaiting);
    a.addEventListener('playing',        onPlaying);
    return () => {
      a.removeEventListener('canplay',        onCanPlay);
      a.removeEventListener('durationchange', onDuration);
      a.removeEventListener('waiting',        onWaiting);
      a.removeEventListener('playing',        onPlaying);
    };
  }, [currentSong]);

  // ─── Play / Pause sync ──────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [isPlaying]);

  // ─── Seek / Volume ──────────────────────────────────────────────
  const handleSeek = e => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = x * duration;
    setProgress(x * 100);
    setCurrentTime(x * duration);
  };

  const handleVolume = e => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    setIsMuted(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  // ─── Retry with force=true to bypass cache ──────────────────────
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    retryRef.current = 0;
    if (audioRef.current && currentSong) {
      audioRef.current.src = `${currentSong.audioUrl}?force=true&t=${Date.now()}`;
      audioRef.current.load();
      audioRef.current.play().catch(() => setError('Stream unavailable'));
    }
  };

  const handleAudioError = () => {
    const a = audioRef.current;
    if (!a || !currentSong) return;

    if (retryRef.current < 2) {
      retryRef.current++;
      setIsLoading(true);
      setTimeout(() => {
        if (a) {
          a.src = `${currentSong.audioUrl}?force=true&t=${Date.now()}`;
          a.load();
          a.play().catch(() => {});
        }
      }, 1000);
      return;
    }

    setError('Stream unavailable');
    setIsLoading(false);
  };

  const audioEl = (
    <audio
      ref={audioRef}
      preload="auto"
      onEnded={nextSong}
      onError={handleAudioError}
    />
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
              <p style={{ fontWeight: 700, fontSize: 13.5, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {currentSong.title}
              </p>
              <p style={{ fontSize: 12, color: '#7a90b0', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 0' }}>
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentSong._id)}
              style={{
                flexShrink: 0, marginLeft: 4, background: 'none', border: 'none', padding: 4,
                color: isFav ? '#f472b6' : '#3a5070',
                filter: isFav ? 'drop-shadow(0 0 6px rgba(244,114,182,0.8))' : 'none',
                transition: 'color 0.15s, transform 0.15s', cursor: 'pointer',
              }}
              className="ctrl-btn"
            >
              <Heart size={17} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Center Playback */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <button onClick={() => setShuffle(!shuffle)} className={`ctrl-btn${shuffle ? ' active' : ''}`}>
              <Shuffle size={17} />
            </button>

            <button onClick={prevSong} className="ctrl-btn-nav">
              <SkipBack size={21} />
            </button>

            <button
              onClick={togglePlay}
              className={`play-btn${isPlaying ? ' playing' : ''}`}
            >
              {isLoading
                ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : isPlaying
                  ? <Pause size={20} fill="white" color="white" />
                  : <Play size={20} fill="white" color="white" style={{ marginLeft: 2 }} />
              }
            </button>

            <button onClick={nextSong} className="ctrl-btn-nav">
              <SkipForward size={21} />
            </button>

            <button
              onClick={() => setRepeatMode((repeatMode + 1) % 3)}
              className={`ctrl-btn${repeatMode > 0 ? ' active' : ''}`}
            >
              {repeatMode === 2 ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>
          </div>

          {/* Right Volume */}
          <div className="volume-container" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
            <button onClick={toggleMute} className="ctrl-btn" style={{ padding: 4 }}>
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <div style={{ position: 'relative', width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2,
                background: 'rgba(0,212,255,0.6)',
                width: `${(isMuted ? 0 : volume) * 100}%`,
                pointerEvents: 'none',
                transition: 'width 0.1s ease',
              }} />
              <input
                type="range" min="0" max="1" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
