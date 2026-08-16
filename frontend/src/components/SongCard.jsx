import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import { Play, Pause, Heart, MoreVertical, Music2 } from 'lucide-react';

export default function SongCard({ song, playlist = null }) {
  const { playSong, currentSong, isPlaying, favorites, toggleFavorite } = useContext(MusicContext);
  const isActive = currentSong?._id === song._id;
  const isFav    = favorites.includes(song._id);

  return (
    <div
      className={`song-card${isActive ? ' active' : ''}`}
      onClick={() => playSong(song, playlist)}
      style={{
        background: isActive ? 'rgba(255, 42, 95, 0.1)' : 'var(--panel)',
        border: `1px solid ${isActive ? 'rgba(255, 42, 95, 0.5)' : 'rgba(0, 212, 255, 0.1)'}`,
        boxShadow: isActive ? '0 8px 30px rgba(255, 42, 95, 0.25)' : 'none',
      }}
    >
      {/* Cover art */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1/1', marginBottom: 12 }}>
        <img
          className="cover-img"
          src={song.cover}
          alt={song.title}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'; }}
        />

        {/* Hover overlay */}
        <div className="card-overlay">
          {isActive && isPlaying ? (
            <div className="eq-bar">
              <span /><span /><span /><span />
            </div>
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff2a5f, #0066ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255,42,95,0.6)',
            }}>
              <Play size={22} fill="white" color="white" style={{ marginLeft: 2 }} />
            </div>
          )}
        </div>

        {/* Duration badge if present */}
        {song.duration && (
          <span style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 10, fontWeight: 700, color: '#fff',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em',
            fontFamily: 'ui-monospace, monospace',
          }}>
            {song.duration}
          </span>
        )}

        {/* Favorite button */}
        <button
          className="fav-btn"
          onClick={e => { e.stopPropagation(); toggleFavorite(song._id); }}
          style={{
            color: isFav ? '#ff2a5f' : 'rgba(255,255,255,0.7)',
            filter: isFav ? 'drop-shadow(0 0 6px rgba(255,42,95,0.8))' : 'none',
          }}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Song info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontWeight: 700, fontSize: 13.5, margin: 0,
            color: isActive ? 'var(--accent-red)' : '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            filter: isActive ? 'drop-shadow(0 0 8px rgba(255,42,95,0.6))' : 'none',
            transition: 'color 0.2s, filter 0.2s',
          }}>
            {song.title}
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {song.artist}
          </p>
        </div>
        <button
          className="ctrl-btn"
          style={{ flexShrink: 0, padding: 2 }}
          onClick={e => e.stopPropagation()}
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
}