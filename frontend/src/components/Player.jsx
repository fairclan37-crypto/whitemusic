import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { MusicContext } from "../context/MusicContext";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, RotateCw,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart, Music2, Radio,
  Mic2, ListMusic, SlidersHorizontal, Maximize2
} from "lucide-react";

export default function Player() {
  const {
    currentSong, isPlaying, setIsPlaying, nextSong, prevSong,
    shuffle, setShuffle, repeatMode, setRepeatMode,
    favorites, toggleFavorite,
  } = useContext(MusicContext);

  const audioRef       = useRef(null);
  const progressRef    = useRef(null);
  const isDragging     = useRef(false);
  const isPlayingRef   = useRef(isPlaying);
  const iframeTimerRef = useRef(null);
  const iframeStartRef = useRef(0);
  const iframeElapsed  = useRef(0);

  const [progress,      setProgress]      = useState(0);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(210);
  const [volume,        setVolume]        = useState(0.75);
  const [isMuted,       setIsMuted]       = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [useIframe,     setUseIframe]     = useState(false);
  const [iframeSeekPos, setIframeSeekPos] = useState(0);

  const isFav = favorites.includes(currentSong?._id);

  // Check if running on Cloud deployment (Vercel)
  const isCloudEnv = typeof window !== "undefined" && (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("now.sh")
  );

  // Parse duration accurately
  const parseSongDuration = useCallback((song) => {
    if (!song) return 210;
    if (song.durationSeconds && song.durationSeconds > 5) {
      return song.durationSeconds;
    }
    if (song.duration && typeof song.duration === "string") {
      const parts = song.duration.split(":").map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const secs = parts[0] * 60 + parts[1];
        if (secs > 5) return secs;
      } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (secs > 5) return secs;
      }
    }
    return 210;
  }, []);

  const fmt = (s) => {
    if (!s || !isFinite(s) || s < 0) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // ── IFRAME TIMER FOR CLOUD FALLBACK ────────────────────────────────────
  useEffect(() => {
    if (!useIframe) return;

    if (isPlaying) {
      iframeStartRef.current = Date.now();
      iframeTimerRef.current = setInterval(() => {
        if (isDragging.current) return;
        const elapsed = iframeElapsed.current + (Date.now() - iframeStartRef.current) / 1000;
        setCurrentTime(elapsed);
        setDuration(prevDur => Math.max(prevDur, elapsed));
        const maxD = Math.max(duration, elapsed, 1);
        setProgress(Math.min(100, (elapsed / maxD) * 100));
      }, 400);
    } else {
      clearInterval(iframeTimerRef.current);
      iframeElapsed.current += (Date.now() - iframeStartRef.current) / 1000;
    }

    return () => clearInterval(iframeTimerRef.current);
  }, [useIframe, isPlaying, duration]);

  // ── SONG LOAD HANDLER ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSong) return;

    const initialDur = parseSongDuration(currentSong);

    // Stop native audio completely
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }

    // Reset player state for new song
    setProgress(0);
    setCurrentTime(0);
    setDuration(initialDur);
    setIframeSeekPos(0);
    clearInterval(iframeTimerRef.current);
    iframeElapsed.current = 0;

    // ON VERCEL CLOUD: Use direct iframe engine synchronously so user click gesture enables instant autoplay!
    if (isCloudEnv) {
      setUseIframe(true);
      setIsPlaying(true);
      setIsLoading(false);
      return;
    }

    // ON LOCALHOST: Try HTML5 audio first
    const a = audioRef.current;
    if (!a) return;

    setIsLoading(true);
    setUseIframe(false);

    a.src = `${currentSong.audioUrl}?t=${Date.now()}`;
    a.volume = isMuted ? 0 : volume;
    a.load();

    const onPlayEvent = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPauseEvent = () => {
      setIsPlaying(false);
    };
    const onPlayingEvent = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onWaitingEvent = () => {
      setIsLoading(true);
    };

    const onMeta = () => {
      if (isFinite(a.duration) && a.duration > 15) setDuration(a.duration);
    };
    const onDurationChange = () => {
      if (isFinite(a.duration) && a.duration > 15) setDuration(a.duration);
    };

    const onCanPlay = () => {
      setIsLoading(false);
      if (isFinite(a.duration) && a.duration > 15) setDuration(a.duration);
      if (isPlayingRef.current) {
        a.play().catch(() => {});
      }
    };

    const onTimeUpdate = () => {
      if (isDragging.current) return;
      const t = a.currentTime;
      const d = a.duration;
      setCurrentTime(t);
      const validD = isFinite(d) && d > 15 ? d : initialDur;
      const finalD = Math.max(validD, t);
      setDuration(finalD);
      setProgress(Math.min(100, (t / finalD) * 100));
    };

    const onEnded = () => nextSong();

    const onError = () => {
      console.warn("[Player] Local stream error -> fallback to Cloud Iframe Audio Engine:", currentSong._id);
      setUseIframe(true);
      setIsPlaying(true);
      setIsLoading(false);
      setDuration(initialDur);
    };

    a.addEventListener("play",           onPlayEvent);
    a.addEventListener("pause",          onPauseEvent);
    a.addEventListener("playing",        onPlayingEvent);
    a.addEventListener("waiting",        onWaitingEvent);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onDurationChange);
    a.addEventListener("canplay",        onCanPlay);
    a.addEventListener("timeupdate",     onTimeUpdate);
    a.addEventListener("ended",          onEnded);
    a.addEventListener("error",          onError);

    return () => {
      a.removeEventListener("play",           onPlayEvent);
      a.removeEventListener("pause",          onPauseEvent);
      a.removeEventListener("playing",        onPlayingEvent);
      a.removeEventListener("waiting",        onWaitingEvent);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onDurationChange);
      a.removeEventListener("canplay",        onCanPlay);
      a.removeEventListener("timeupdate",     onTimeUpdate);
      a.removeEventListener("ended",          onEnded);
      a.removeEventListener("error",          onError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  // ── TOGGLE PLAY/PAUSE (SAFE & INSTANT) ────────────────────────────────
  const handleTogglePlay = () => {
    if (useIframe) {
      const nextState = !isPlaying;
      setIsPlaying(nextState);
      if (nextState) {
        setIframeSeekPos(Math.floor(currentTime));
      }
      return;
    }

    const a = audioRef.current;
    if (!a) return;

    if (a.paused) {
      setIsLoading(true);
      a.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("[Player] Play call error -> using iframe fallback:", err);
          setUseIframe(true);
          setIsPlaying(true);
          setIsLoading(false);
        });
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  // Sync volume
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = isMuted ? 0 : volume;
    a.muted  = isMuted;
  }, [volume, isMuted]);

  // ── SEEK HANDLER ──────────────────────────────────────────────────────
  const seekToTime = useCallback((targetTime) => {
    const maxD = Math.max(duration, 30);
    const clampedTime = Math.min(maxD, Math.max(0, targetTime));
    const newPercent  = Math.min(100, (clampedTime / maxD) * 100);

    setCurrentTime(clampedTime);
    setProgress(newPercent);

    if (useIframe) {
      iframeElapsed.current = clampedTime;
      iframeStartRef.current = Date.now();
      setIframeSeekPos(Math.floor(clampedTime));
      return;
    }

    const a = audioRef.current;
    if (a) {
      a.currentTime = clampedTime;
    }
  }, [duration, useIframe]);

  const handleSeekClick = useCallback((e) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const maxD = Math.max(duration, 30);
    seekToTime(x * maxD);
  }, [duration, seekToTime]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    handleSeekClick(e);
  }, [handleSeekClick]);

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => setIsMuted((m) => !m);

  // Audio elements: Iframe is only rendered when isPlaying is TRUE!
  const audioEl = (
    <>
      <audio ref={audioRef} preload="auto" />
      {useIframe && isPlaying && currentSong && (
        <iframe
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

  return (
    <div style={{ flexShrink: 0, padding: "0 28px 18px", position: "relative" }}>
      {audioEl}

      {/* Synapz Floating Pill Container */}
      <div style={{
        background: "var(--panel)",
        border: "1px solid var(--hairline)",
        borderRadius: 20,
        padding: "12px 24px",
        boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
      }}>

        {/* Top Control Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>

          {/* Left Action Buttons & Now Playing Song Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            {currentSong ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, marginRight: 6 }}>
                <img
                  src={currentSong.cover}
                  alt={currentSong.title}
                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                  onError={e => { e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80"; }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13.5, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentSong.title}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentSong.artist}
                  </p>
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              <button
                onClick={() => currentSong && toggleFavorite(currentSong._id)}
                className="ctrl-btn"
                title="Favorite"
              >
                <Heart size={16} fill={isFav ? "var(--primary)" : "none"} color={isFav ? "var(--primary)" : "currentColor"} />
              </button>
              <button className="ctrl-btn" title="Lyrics"><Mic2 size={16} /></button>
              <button className="ctrl-btn" title="Vibe"><Radio size={16} /></button>
              <button className="ctrl-btn" title="Queue"><ListMusic size={16} /></button>
              <button className="ctrl-btn" title="Equalizer"><SlidersHorizontal size={16} /></button>
              <button className="ctrl-btn" title="Full Screen"><Maximize2 size={16} /></button>
            </div>
          </div>

          {/* Center Transport Controls (Synapz White Play Button) */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: "center" }}>
            <button
              onClick={() => setRepeatMode((repeatMode + 1) % 3)}
              className={`ctrl-btn${repeatMode > 0 ? " active" : ""}`}
              title="Repeat"
            >
              {repeatMode === 2 ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>

            <button onClick={prevSong} className="ctrl-btn" title="Previous Track">
              <SkipBack size={18} />
            </button>

            {/* Synapz White Circular Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              disabled={!currentSong}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "#ffffff", color: "#0f1115",
                border: "none", cursor: currentSong ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
                transition: "transform 0.12s ease",
                opacity: currentSong ? 1 : 0.5,
              }}
              onMouseEnter={e => { if (currentSong) e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => { if (currentSong) e.currentTarget.style.transform = "scale(1)"; }}
            >
              {isLoading ? (
                <div style={{ width: 18, height: 18, border: "2.5px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : isPlaying ? (
                <Pause size={20} fill="#0f1115" color="#0f1115" />
              ) : (
                <Play size={20} fill="#0f1115" color="#0f1115" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button onClick={nextSong} className="ctrl-btn" title="Next Track">
              <SkipForward size={18} />
            </button>

            <button onClick={() => setShuffle(!shuffle)} className={`ctrl-btn${shuffle ? " active" : ""}`} title="Shuffle">
              <Shuffle size={16} />
            </button>
          </div>

          {/* Right Volume Control */}
          <div className="volume-container" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={toggleMute} className="ctrl-btn">
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <div style={{ position: "relative", width: 88, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)", flexShrink: 0 }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 2,
                background: "var(--primary)",
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

        {/* Bottom Red Progress Seek Bar with Monospace Timestamps */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums", minWidth: 34, textAlign: "center" }}>
            {fmt(currentTime)}
          </span>

          <div
            ref={progressRef}
            className="seek-bar"
            onClick={handleSeekClick}
            onMouseDown={(e) => { isDragging.current = true; handleSeekClick(e); }}
            onMouseMove={handleMouseMove}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
            style={{
              position: "relative", flex: 1, height: 4, borderRadius: 2,
              background: "rgba(255,255,255,0.14)", cursor: "pointer",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%",
              width: `${Math.min(100, Math.max(0, progress))}%`, borderRadius: 2,
              background: "var(--primary)",
            }} />
            <div className="seek-thumb" style={{ left: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>

          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums", minWidth: 34, textAlign: "center" }}>
            {fmt(duration)}
          </span>
        </div>

      </div>
    </div>
  );
}