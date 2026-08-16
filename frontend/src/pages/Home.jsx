import { useContext, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import SongCard from '../components/SongCard';
import { Play, Pause, Sparkles, Flame, Radio, Shuffle, Headphones } from 'lucide-react';

const GENRE_TAGS = ['All Hits', 'Bollywood', 'Hollywood', 'Trending', 'Party Mix', 'Romantic', 'Chill Vibe'];

export default function Home() {
  const { songs, loading, playSong, currentSong, isPlaying, setShuffle } = useContext(MusicContext);
  const [activeGenre, setActiveGenre] = useState('All Hits');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 40 }}>
            {[1, 1.4, 0.8, 1.2, 0.9, 1.5, 1.1].map((d, i) => (
              <div key={i} style={{
                width: 6, borderRadius: 3,
                background: i % 2 === 0 ? 'linear-gradient(to top, #ff2a5f, #ff0044)' : 'linear-gradient(to top, #0066ff, #00d4ff)',
                transformOrigin: 'bottom',
                animation: `eq-bar ${d * 0.6 + 0.4}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.07}s`,
                minHeight: 6,
              }} />
            ))}
          </div>
          <p style={{ color: 'var(--accent-red)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
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
      {/* ── Genre Quick Filter Pills ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 16, marginBottom: 20, scrollbarWidth: 'none' }}>
        {GENRE_TAGS.map(tag => {
          const isActive = activeGenre === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveGenre(tag)}
              style={{
                padding: '8px 18px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 700,
                whiteSpace: 'nowrap', cursor: 'pointer',
                background: isActive 
                  ? 'linear-gradient(135deg, #ff2a5f 0%, #0066ff 100%)' 
                  : 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: `1px solid ${isActive ? 'rgba(255,42,95,0.5)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive ? '0 4px 16px rgba(255,42,95,0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* ── Featured Hero Banner ── */}
      {featured && (
        <div style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden',
          border: '1px solid rgba(255,42,95,0.2)',
          marginBottom: 32, minHeight: 200,
          background: 'linear-gradient(135deg, rgba(255,42,95,0.18) 0%, rgba(0,102,255,0.22) 50%, rgba(6,8,15,0.95) 100%)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(255,42,95,0.15)',
        }}>
          {/* Blurred Background Art */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.cover})`,
            backgroundSize: 'cover', backgroundPosition: 'center 30%',
            filter: 'blur(48px) brightness(0.3)',
            transform: 'scale(1.15)',
          }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28, padding: '32px 38px' }}>
            {/* Cover Art with Ring Glow */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={featured.cover}
                alt={featured.title}
                style={{
                  width: 148, height: 148, borderRadius: 20, objectFit: 'cover',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(255,42,95,0.3)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                }}
              />
              {currentSong?._id === featured._id && isPlaying && (
                <div style={{
                  position: 'absolute', inset: -4, borderRadius: 24,
                  border: '2px solid #ff2a5f',
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
                background: 'rgba(255,42,95,0.15)', border: '1px solid rgba(255,42,95,0.3)',
                color: 'var(--accent-red)', fontSize: 11, fontWeight: 800, letterSpacing: '0.09em',
                textTransform: 'uppercase', marginBottom: 12,
              }}>
                <Sparkles size={13} /> Featured Track of the Day
              </div>

              <h1 style={{
                fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900,
                letterSpacing: '-0.03em', lineHeight: 1.15,
                color: '#fff', marginBottom: 8,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {featured.title}
              </h1>

              <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 600, marginBottom: 20 }}>
                {featured.artist}
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => playSong(featured, songs)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '11px 28px', borderRadius: 999,
                    background: 'linear-gradient(135deg, #ff2a5f, #0066ff)',
                    color: '#fff', fontWeight: 800, fontSize: 14,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(255,42,95,0.5)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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
                    padding: '11px 22px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontWeight: 700, fontSize: 13,
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

      {/* ── Trending Hits Grid ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            <span style={{
              display: 'inline-block', width: 4, height: 22, borderRadius: 2,
              background: 'linear-gradient(to bottom, #ff2a5f, #00d4ff)',
            }} />
            <Flame size={22} color="var(--accent-red)" /> Trending Hits
          </h2>
          <span style={{
            fontSize: 11.5, fontWeight: 800, color: 'var(--muted)',
            background: 'rgba(255,42,95,0.08)', padding: '5px 14px',
            borderRadius: 999, border: '1px solid rgba(255,42,95,0.2)',
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