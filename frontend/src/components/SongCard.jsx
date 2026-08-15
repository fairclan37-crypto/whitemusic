import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';

export default function SongCard({ song, playlist = null }) {
  const { playSong, currentSong, isPlaying, favorites, toggleFavorite } = useContext(MusicContext);
  const isActive = currentSong?._id === song._id;
  const isFav    = favorites.includes(song._id);

  return (
    <div
      className={`song-card${isActive ? ' active' : ''}`}
      onClick={() => playSong(song, playlist)}
    >
      {/* Cover art */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1/1', marginBottom: 12 }}>
        <img
          className="cover-img"
          src={song.cover}
          alt={song.title}
          onError={e => { e.target.src = 'https://placehold.co/200x200/131b2a/00d4ff?text=♪'; }}
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
              background: 'linear-gradient(135deg, #00d4ff, #0055cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,212,255,0.5)',
            }}>
              <Play size={22} fill="white" color="white" style={{ marginLeft: 2 }} />
            </div>
          )}
        </div>

        {/* Favorite button */}
        <button
          className="fav-btn"
          onClick={e => { e.stopPropagation(); toggleFavorite(song._id); }}
          style={{
            color: isFav ? '#f472b6' : 'rgba(255,255,255,0.5)',
            filter: isFav ? 'drop-shadow(0 0 5px rgba(244,114,182,0.7))' : 'none',
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
            color: isActive ? 'var(--accent)' : '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            filter: isActive ? 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' : 'none',
            transition: 'color 0.2s, filter 0.2s',
          }}>
            {song.title}
          </p>
          <p style={{ fontSize: 12, color: '#7a90b0', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
