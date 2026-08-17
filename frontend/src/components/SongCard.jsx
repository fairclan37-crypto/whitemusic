import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import { Play, Heart, MoreVertical } from 'lucide-react';

export default function SongCard({ song, playlist = null }) {
  const { playSong, currentSong, isPlaying, favorites, toggleFavorite } = useContext(MusicContext);
  const isActive = currentSong?._id === song._id;
  const isFav    = favorites.includes(song._id);

  return (
    <div
      className={`song-card${isActive ? ' active' : ''}`}
      onClick={() => playSong(song, playlist)}
    >
      {/* Cover Artwork Container */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1/1', marginBottom: 12 }}>
        <img
          className="cover-img"
          src={song.cover}
          alt={song.title}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'; }}
        />

        {/* Hover Overlay & Red Play Button / EQ Animation */}
        <div className="card-overlay">
          {isActive && isPlaying ? (
            <div className="eq-bar">
              <span /><span /><span /><span />
            </div>
          ) : (
            <div className="card-play-btn">
              <Play size={22} fill="white" color="white" style={{ marginLeft: 2 }} />
            </div>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          className="fav-btn"
          onClick={e => { e.stopPropagation(); toggleFavorite(song._id); }}
          style={{
            color: isFav ? 'var(--primary)' : 'rgba(255, 255, 255, 0.8)',
            filter: isFav ? 'drop-shadow(0 0 6px rgba(255,46,76,0.8))' : 'none',
          }}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Timestamp badge */}
        {song.duration && (
          <span style={{
            position: 'absolute', bottom: 6, left: 6,
            fontSize: 10, fontWeight: 700, color: '#fff',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em',
            fontFamily: 'ui-monospace, monospace',
            pointerEvents: 'none',
          }}>
            {song.duration}
          </span>
        )}
      </div>

      {/* Song Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontWeight: 700, fontSize: 13.5, margin: 0,
            color: isActive ? 'var(--primary)' : '#ffffff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            transition: 'color 0.18s ease',
          }}>
            {song.title}
          </p>
          <p style={{
            fontSize: 12, color: 'var(--muted-foreground)', margin: '3px 0 0',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
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