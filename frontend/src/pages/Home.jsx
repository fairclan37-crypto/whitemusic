import { useContext, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import SongCard from '../components/SongCard';
import { Play, Pause, Sparkles, Flame, Shuffle, Headphones } from 'lucide-react';

const GENRE_TAGS = ['All Hits', 'Bollywood', 'Hollywood', 'Trending', 'Party Mix', 'Romantic', 'Chill Vibe'];

export default function Home() {
  const { songs, loading, playSong, currentSong, isPlaying, setShuffle } = useContext(MusicContext);
  const [activeGenre, setActiveGenre] = useState('All Hits');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div className="eq-bar" style={{ height: 36, gap: 4 }}>
            <span /><span /><span /><span /><span />
          </div>
          <p style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Headphones size={16} /> Tuning White Music Streams...
          </p>
        </div>
      </div>
    );
  }

  const featured = songs[0];

  const filteredSongs = activeGenre === 'All Hits' 
    ? songs 
    : songs.filter(s => 
        s.title.toLowerCase().includes(activeGenre.toLowerCase()) || 
        s.artist.toLowerCase().includes(activeGenre.toLowerCase())
      );
  const displayList = filteredSongs.length > 0 ? filteredSongs : songs;

  return (
    <div>
      {/* ── Synapz Genre Category Chips ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 14, marginBottom: 20, scrollbarWidth: 'none' }}>
        {GENRE_TAGS.map(tag => {
          const isActive = activeGenre === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveGenre(tag)}
              className={`chip${isActive ? ' active' : ''}`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* ── Synapz Featured Hero Banner ── */}
      {featured && (
        <div style={{
          position: 'relative', borderRadius: 20, overflow: 'hidden',
          border: '1px solid var(--hairline)',
          marginBottom: 32, minHeight: 220,
          background: 'var(--panel)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Blurred Background Art */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.cover})`,
            backgroundSize: 'cover', backgroundPosition: 'center 30%',
            filter: 'blur(50px) brightness(0.3)',
            transform: 'scale(1.15)',
          }} />

          {/* Synapz Dark Shade Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #0f1115f0, #0f111599 45%, #0f11150d)',
          }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28, padding: '32px 38px' }}>
            {/* Cover Art with Synapz Glow */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={featured.cover}
                alt={featured.title}
                style={{
                  width: 150, height: 150, borderRadius: 16, objectFit: 'cover',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
              {currentSong?._id === featured._id && isPlaying && (
                <div style={{
                  position: 'absolute', inset: -4, borderRadius: 20,
                  border: '2px solid var(--primary)',
                  animation: 'pulse-ring 2s ease-out infinite',
                  pointerEvents: 'none',
                }} />
              )}
            </div>

            {/* Info Block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(255, 46, 76, 0.15)', border: '1px solid rgba(255, 46, 76, 0.3)',
                color: 'var(--primary)', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                <Sparkles size={13} /> Featured Track of the Day
              </div>

              <h1 style={{
                fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.03em', lineHeight: 1.05,
                color: '#ffffff', marginBottom: 8,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {featured.title}
              </h1>

              <p style={{ fontSize: 15, color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 18 }}>
                {featured.artist}
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => playSong(featured, songs)}
                  className="btn-play"
                >
                  {currentSong?._id === featured._id && isPlaying
                    ? <><Pause size={18} fill="white" /> Pause</>
                    : <><Play size={18} fill="white" style={{ marginLeft: 2 }} /> Listen Now</>
                  }
                </button>

                <button
                  onClick={() => {
                    setShuffle(true);
                    const randIndex = Math.floor(Math.random() * songs.length);
                    playSong(songs[randIndex], songs);
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <Shuffle size={16} /> Quick Mix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Synapz Section Title & Grid ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            <Flame size={22} color="var(--primary)" /> Trending Hits
          </h2>
          <span style={{
            fontSize: 11.5, fontWeight: 800, color: 'var(--muted-foreground)',
            background: 'var(--panel)', padding: '5px 14px',
            borderRadius: 999, border: '1px solid var(--hairline)',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {displayList.length} Tracks
          </span>
        </div>

        <div className="songs-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16,
        }}>
          {displayList.map(s => (
            <SongCard key={s._id} song={s} playlist={songs} />
          ))}
        </div>
      </section>
    </div>
  );
}