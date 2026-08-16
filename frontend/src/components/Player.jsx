import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { MusicContext } from "../context/MusicContext";
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart, Music2
} from "lucide-react";

export default function Player() {
  const {
    currentSong, isPlaying, togglePlay, nextSong, prevSong,
    shuffle, setShuffle, repeatMode, setRepeatMode,
    favorites, toggleFavorite,
  } = useContext(MusicContext);

  const audioRef      = useRef(null);
  const progressRef   = useRef(null);
  const isDragging    = useRef(false);
  const isPlayingRef  = useRef(isPlaying);
  const iframeTimerRef = useRef(null);
  const iframeStartRef = useRef(0);   // when iframe started playing
  const iframeElapsed  = useRef(0);   // seconds elapsed in iframe

  const [progress,    setProgress]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(0.75);
  const [isMuted,     setIsMuted]     = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [useIframe,   setUseIframe]   = useState(false);
  const [iframePlaying, setIframePlaying] = useState(false);

  const isFav = favorites.includes(currentSong?._id);

  const fmt = (s) =>
    !s || !isFinite(s)
      ? "0:00"
      : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  // Sync ref with state
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
      }, 500);
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

    // Reset everything
    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setUseIframe(false);
    setIframePlaying(false);
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
      // Use song duration from yt-search metadata if available
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

  // ── PLAY / PAUSE sync (only for <audio>, not iframe) ─────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a || useIframe) return;
    if (isPlaying) {
      // Only play if audio has a src loaded
      if (a.src && a.readyState >= 2) {
        a.play().catch(() => {});
      }
    } else {
      a.pause();
    }
  }, [isPlaying, useIframe]);

  // iframe play/pause
  useEffect(() => {
    if (!useIframe) return;
    setIframePlaying(isPlaying);
  }, [isPlaying, useIframe]);

  // Volume
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = isMuted ? 0 : volume;
    a.muted  = isMuted;
  }, [volume, isMuted]);

  // ── SEEK ──────────────────────────────────────────────────────────────
  const handleSeek = useCallback((e) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));

    if (useIframe) {
      // Seek in iframe mode: reset elapsed
      const newTime = x * duration;
      iframeElapsed.current = newTime;
      iframeStartRef.current = Date.now();
      setCurrentTime(newTime);
      setProgress(x * 100);
      return;
    }

    const a = audioRef.current;
    if (!a || !isFinite(a.duration) || a.duration === 0) return;
    const newTime = x * a.duration;
    a.currentTime = newTime;
    setProgress(x * 100);
    setCurrentTime(newTime);
  }, [useIframe, duration]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    handleSeek(e);
  }, [handleSeek]);

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => setIsMuted((m) => !m);

  // ── AUDIO + IFRAME ────────────────────────────────────────────────────
  const audioEl = (
    <>
      <audio ref={audioRef} preload="auto" />
      {useIframe && currentSong && (
        <iframe
          key={currentSong._id}
          src={`https://www.youtube.com/embed/${currentSong._id}?autoplay=1&enablejsapi=1`}
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
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }} />
        <div style={{ background: "rgba(8,12,20,0.96)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Music2 size={18} color="#3a5070" />
          </div>
          <p style={{ fontSize: 13, color: "#3a5070", fontWeight: 600, margin: 0 }}>
            Select a song to start playing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flexShrink: 0 }}>
      {audioEl}

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.7), transparent)" }} />

      <div style={{ background: "rgba(8,12,20,0.97)", padding: "8px 24px 14px", position: "relative" }}>

        {/* Seek bar */}
        <div
          ref={progressRef}
          className="seek-bar"
          onClick={handleSeek}
          onMouseDown={(e) => { isDragging.current = true; handleSeek(e); }}
          onMouseMove={handleMouseMove}
          onMouseUp={() => { isDragging.current = false; }}
          onMouseLeave={() => { isDragging.current = false; }}
          style={{
            position: "relative", height: 4, borderRadius: 2,
            background: "rgba(255,255,255,0.08)", marginBottom: 5, cursor: "pointer",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${progress}%`, borderRadius: 2,
            background: "linear-gradient(90deg, #00d4ff, #0055cc)",
            boxShadow: "0 0 8px rgba(0,212,255,0.9)",
          }} />
          <div className="seek-thumb" style={{ left: `${progress}%` }} />
        </div>

        {/* Timestamps */}
        <div style={{
          display: "flex", justifyContent: "space-between", marginBottom: 9,
          fontSize: 11, color: "#3a5070", fontVariantNumeric: "tabular-nums",
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
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", display: "block", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
                onError={(e) => { e.target.src = "https://placehold.co/44x44/131b2a/00d4ff?text=♪"; }}
              />
              {(isPlaying || (useIframe && iframePlaying)) && (
                <div style={{
                  position: "absolute", inset: -3, borderRadius: 13,
                  border: `1.5px solid ${useIframe ? "rgba(255,200,0,0.7)" : "rgba(0,212,255,0.5)"}`,
                  animation: "pulse-ring 2s ease-out infinite", pointerEvents: "none",
                }} />
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                {currentSong.title}
              </p>
              <p style={{ fontSize: 12, color: "#7a90b0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "2px 0 0" }}>
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentSong._id)}
              style={{
                flexShrink: 0, marginLeft: 4, background: "none", border: "none", padding: 4,
                color: isFav ? "#f472b6" : "#3a5070",
                filter: isFav ? "drop-shadow(0 0 6px rgba(244,114,182,0.8))" : "none",
                transition: "color 0.15s, transform 0.15s", cursor: "pointer",
              }}
              className="ctrl-btn"
            >
              <Heart size={17} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Center playback */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <button onClick={() => setShuffle(!shuffle)} className={`ctrl-btn${shuffle ? " active" : ""}`}>
              <Shuffle size={17} />
            </button>

            <button onClick={prevSong} className="ctrl-btn-nav">
              <SkipBack size={21} />
            </button>

            <button onClick={togglePlay} className={`play-btn${isPlaying ? " playing" : ""}`}>
              {isLoading
                ? <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : isPlaying
                  ? <Pause size={20} fill="white" color="white" />
                  : <Play  size={20} fill="white" color="white" style={{ marginLeft: 2 }} />
              }
            </button>

            <button onClick={nextSong} className="ctrl-btn-nav">
              <SkipForward size={21} />
            </button>

            <button
              onClick={() => setRepeatMode((repeatMode + 1) % 3)}
              className={`ctrl-btn${repeatMode > 0 ? " active" : ""}`}
            >
              {repeatMode === 2 ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>
          </div>

          {/* Volume */}
          <div className="volume-container" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
            <button onClick={toggleMute} className="ctrl-btn" style={{ padding: 4 }}>
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <div style={{ position: "relative", width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", flexShrink: 0 }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 2,
                background: "rgba(0,212,255,0.6)",
                width: `${(isMuted ? 0 : volume) * 100}%`,
                pointerEvents: "none", transition: "width 0.1s ease",
              }} />
              <input
                type="range" min="0" max="1" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}