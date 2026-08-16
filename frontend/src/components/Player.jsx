import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { MusicContext } from "../context/MusicContext";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, RotateCw,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart, Music2, Disc
} from "lucide-react";

export default function Player() {
  const {
    currentSong, isPlaying, togglePlay, nextSong, prevSong,
    shuffle, setShuffle, repeatMode, setRepeatMode,
    favorites, toggleFavorite,
  } = useContext(MusicContext);

  const audioRef       = useRef(null);
  const iframeRef      = useRef(null);
  const progressRef    = useRef(null);
  const isDragging     = useRef(false);
  const isPlayingRef   = useRef(isPlaying);
  const iframeTimerRef = useRef(null);
  const iframeStartRef = useRef(0);
  const iframeElapsed  = useRef(0);
  const lastVolumeRef  = useRef(0.75);

  const [progress,      setProgress]      = useState(0);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [volume,        setVolume]        = useState(0.75);
  const [isMuted,       setIsMuted]       = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [useIframe,     setUseIframe]     = useState(false);
  const [iframePlaying, setIframePlaying] = useState(false);
  const [iframeSeekPos, setIframeSeekPos] = useState(0); // timestamp for iframe start

  const isFav = favorites.includes(currentSong?._id);

  const fmt = (s) =>
    !s || !isFinite(s)
      ? "0:00"
      : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  // Keep isPlayingRef synced
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // ── IFRAME TIMER: fake timer when iframe plays ────────────────────────
  useEffect(() => {
    if (!useIframe) return;

    if (iframePlaying) {
      iframeStartRef.current = Date.now();
      iframeTimerRef.current = setInterval(() => {
        if (isDragging.current) return;
        const elapsed = iframeElapsed.current + (Date.now() - iframeStartRef.current) / 1000;
        setCurrentTime(elapsed);
        if (duration > 0) setProgress((elapsed / duration) * 100);
      }, 400);
    } else {
      clearInterval(iframeTimerRef.current);
      iframeElapsed.current += (Date.now() - iframeStartRef.current) / 1000;
    }

    return () => clearInterval(iframeTimerRef.current);
  }, [useIframe, iframePlaying, duration]);

  // ── LOAD SONG ─────────────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentSong) return;

    // Reset state
    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setUseIframe(false);
    setIframePlaying(false);
    setIframeSeekPos(0);
    clearInterval(iframeTimerRef.current);
    iframeElapsed.current = 0;

    a.pause();
    a.src = `${currentSong.audioUrl}?t=${Date.now()}`;
    a.volume = isMuted ? 0 : volume;
    a.load();

    let played = false;

    const tryPlay = () => {
      if (played) return;
      played = true;
      setIsLoading(false);
      if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
      if (isPlayingRef.current) a.play().catch(() => {});
    };

    const onLoadedMeta = () => {
      if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
    };
    const onDurationChange = () => {
      if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
    };
    const onCanPlay   = () => tryPlay();
    const onWaiting   = () => setIsLoading(true);
    const onPlaying   = () => setIsLoading(false);

    const onTimeUpdate = () => {
      if (isDragging.current) return;
      const t = a.currentTime;
      const d = a.duration;
      if (!isFinite(d) || d === 0) return;
      setCurrentTime(t);
      setProgress((t / d) * 100);
      if (d > 0) setDuration(d);
    };

    const onEnded = () => nextSong();

    const onError = () => {
      console.warn("[Player] stream failed → iframe:", currentSong._id);
      setUseIframe(true);
      setIframePlaying(true);
      setIsLoading(false);
      // Use song duration metadata if available
      if (currentSong.duration) {
        const parts = String(currentSong.duration).split(":").map(Number);
        const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
        if (secs > 0) setDuration(secs);
      }
    };

    a.addEventListener("loadedmetadata", onLoadedMeta);
    a.addEventListener("durationchange", onDurationChange);
    a.addEventListener("canplay",        onCanPlay);
    a.addEventListener("waiting",        onWaiting);
    a.addEventListener("playing",        onPlaying);
    a.addEventListener("timeupdate",     onTimeUpdate);
    a.addEventListener("ended",          onEnded);
    a.addEventListener("error",          onError);

    return () => {
      a.removeEventListener("loadedmetadata", onLoadedMeta);
      a.removeEventListener("durationchange", onDurationChange);
      a.removeEventListener("canplay",        onCanPlay);
      a.removeEventListener("waiting",        onWaiting);
      a.removeEventListener("playing",        onPlaying);
      a.removeEventListener("timeupdate",     onTimeUpdate);
      a.removeEventListener("ended",          onEnded);
      a.removeEventListener("error",          onError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  // ── PLAY / PAUSE SYNC ─────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a || useIframe) return;
    if (isPlaying) {
      if (a.src && a.readyState >= 2) {
        a.play().catch(() => {});
      }
    } else {
      a.pause();
    }
  }, [isPlaying, useIframe]);

  // iframe play/pause sync
  useEffect(() => {
    if (!useIframe) return;
    setIframePlaying(isPlaying);
  }, [isPlaying, useIframe]);

  // ── VOLUME & MUTE CONTROL (HTML5 + YouTube Iframe) ────────────────────
  useEffect(() => {
    const targetVol = isMuted ? 0 : volume;

    // 1. Set HTML5 Audio volume
    const a = audioRef.current;
    if (a) {
      a.volume = targetVol;
      a.muted  = isMuted;
    }

    // 2. Set YouTube Iframe volume via postMessage
    if (useIframe && iframeRef.current?.contentWindow) {
      try {
        const win = iframeRef.current.contentWindow;
        const volPercent = Math.round(targetVol * 100);
        win.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [volPercent] }), '*');
        if (isMuted) {
          win.postMessage(JSON.stringify({ event: 'command', func: 'mute' }), '*');
        } else {
          win.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');
        }
      } catch { /* postMessage fail-safe */ }
    }
  }, [volume, isMuted, useIframe]);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) {
      lastVolumeRef.current = val;
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) {
        setVolume(lastVolumeRef.current || 0.75);
      }
    } else {
      if (volume > 0) lastVolumeRef.current = volume;
      setIsMuted(true);
    }
  };

  // ── AUDIO + IFRAME ────────────────────────────────────────────────────
  const audioEl = (
    <>
      <audio ref={audioRef} preload="auto" />
      {useIframe && currentSong && (
        <iframe
          ref={iframeRef}
          key={`${currentSong._id}-${iframeSeekPos}`}
          src={`https://www.youtube.com/embed/${currentSong._id}?autoplay=1&enablejsapi=1&start=${iframeSeekPos}`}
          title={currentSong.title}
          allow="autoplay"
          style={{
            width: 1, height: 1, position: "absolute",
            opacity: 0, pointerEvents: "none", border: "none",
          }}
        />
      )}
    </>
  );

  if (!currentSong) {
    return (
      <div>
        {audioEl}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,42,95,0.4), #00d4ff, transparent)" }} />
        <div style={{ background: "rgba(8,12,20,0.96)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "rgba(255,42,95,0.1)", border: "1px solid rgba(255,42,95,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Music2 size={18} color="var(--accent-red)" />
          </div>
          <p style={{ fontSize: 13, color: "#8a9fbe", fontWeight: 600, margin: 0 }}>
            Select a song to start playing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flexShrink: 0 }}>
      {audioEl}

      <div style={{ height: 1.5, background: "linear-gradient(90deg, transparent, #ff2a5f, #00d4ff, transparent)" }} />

      <div style={{ background: "rgba(8,12,22,0.98)", padding: "8px 24px 14px", position: "relative" }}>

        {/* Seek bar (Click & Drag to seek anywhere!) */}
        <div
          ref={progressRef}
          className="seek-bar"
          onClick={handleSeekClick}
          onMouseDown={(e) => { isDragging.current = true; handleSeekClick(e); }}
          onMouseMove={handleMouseMove}
          onMouseUp={() => { isDragging.current = false; }}
          onMouseLeave={() => { isDragging.current = false; }}
          style={{
            position: "relative", height: 5, borderRadius: 3,
            background: "rgba(255,255,255,0.1)", marginBottom: 6, cursor: "pointer",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${progress}%`, borderRadius: 3,
            background: "linear-gradient(90deg, #ff2a5f 0%, #00d4ff 100%)",
            boxShadow: "0 0 10px rgba(255,42,95,0.8)",
          }} />
          <div className="seek-thumb" style={{ left: `${progress}%` }} />
        </div>

        {/* Timestamps */}
        <div style={{
          display: "flex", justifyContent: "space-between", marginBottom: 8,
          fontSize: 11.5, color: "#8a9fbe", fontVariantNumeric: "tabular-nums",
          fontWeight: 600, fontFamily: "ui-monospace, monospace",
        }}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Song info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", display: "block", boxShadow: "0 4px 16px rgba(0,0,0,0.6)" }}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80"; }}
              />
              {(isPlaying || (useIframe && iframePlaying)) && (
                <div style={{
                  position: "absolute", inset: -3, borderRadius: 13,
                  border: `1.5px solid ${useIframe ? "rgba(255,42,95,0.8)" : "rgba(0,212,255,0.7)"}`,
                  animation: "pulse-ring 2s ease-out infinite", pointerEvents: "none",
                }} />
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                {currentSong.title}
              </p>
              <p style={{ fontSize: 12, color: "#8a9fbe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "2px 0 0" }}>
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentSong._id)}
              style={{
                flexShrink: 0, marginLeft: 4, background: "none", border: "none", padding: 4,
                color: isFav ? "#ff2a5f" : "#8a9fbe",
                filter: isFav ? "drop-shadow(0 0 6px rgba(255,42,95,0.8))" : "none",
                transition: "color 0.15s, transform 0.15s", cursor: "pointer",
              }}
              className="ctrl-btn"
            >
              <Heart size={17} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Center Playback Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button onClick={() => setShuffle(!shuffle)} className={`ctrl-btn${shuffle ? " active" : ""}`} title="Shuffle">
              <Shuffle size={16} />
            </button>

            <button onClick={prevSong} className="ctrl-btn-nav" title="Previous Song">
              <SkipBack size={19} />
            </button>

            {/* -10s Rewind Button */}
            <button onClick={rewind10} className="ctrl-btn" title="Rewind 10s">
              <RotateCcw size={16} />
            </button>

            {/* Play / Pause Toggle Button */}
            <button onClick={togglePlay} className={`play-btn${isPlaying ? " playing" : ""}`}>
              {isLoading
                ? <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : isPlaying
                  ? <Pause size={20} fill="white" color="white" />
                  : <Play  size={20} fill="white" color="white" style={{ marginLeft: 2 }} />
              }
            </button>

            {/* +10s Forward Button */}
            <button onClick={forward10} className="ctrl-btn" title="Forward 10s">
              <RotateCw size={16} />
            </button>

            <button onClick={nextSong} className="ctrl-btn-nav" title="Next Song">
              <SkipForward size={19} />
            </button>

            <button
              onClick={() => setRepeatMode((repeatMode + 1) % 3)}
              className={`ctrl-btn${repeatMode > 0 ? " active" : ""}`}
              title="Repeat Mode"
            >
              {repeatMode === 2 ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Right Volume Control (Click Mute Icon or Slide Bar!) */}
          <div className="volume-container" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
            <button onClick={toggleMute} className="ctrl-btn" style={{ padding: 4 }} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted || (isMuted ? 0 : volume) === 0 ? (
                <VolumeX size={18} color="var(--accent-red)" />
              ) : (isMuted ? 0 : volume) < 0.5 ? (
                <Volume1 size={18} color="#fff" />
              ) : (
                <Volume2 size={18} color="#fff" />
              )}
            </button>

            <div style={{ position: "relative", width: 85, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)", flexShrink: 0 }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 3,
                background: "linear-gradient(90deg, #ff2a5f, #00d4ff)",
                width: `${(isMuted ? 0 : volume) * 100}%`,
                pointerEvents: "none", transition: "width 0.1s ease",
              }} />
              <input
                type="range" min="0" max="1" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                onInput={handleVolumeChange}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}