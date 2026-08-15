import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import SongCard from '../components/SongCard';
import { Heart, ArrowRight, Library as LibraryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Library() {
  const { songs, playlist, favorites } = useContext(MusicContext);

  const allKnownSongs = Array.from(
    new Map([...songs, ...playlist].map(s => [s._id, s])).values()
  );
  const favoriteSongs = allKnownSongs.filter(s => favorites.includes(s._id));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: '#7a90b0', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Personal
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            <span style={{
              display: 'inline-block', width: 4, height: 24, borderRadius: 2,
              background: 'linear-gradient(to bottom, #00d4ff, #0055cc)',
              flexShrink: 0,
            }} />
            <Heart size={24} style={{ color: '#f472b6', fill: 'rgba(244,114,182,0.2)' }} />
            Your Library
          </h1>
          <p style={{ color: '#7a90b0', fontSize: 13, marginTop: 4 }}>
            {favoriteSongs.length} {favoriteSongs.length === 1 ? 'track' : 'tracks'} saved to favorites
          </p>
        </div>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 700, color: 'var(--accent)',
            textDecoration: 'none', padding: '7px 14px', borderRadius: 8,
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          Discover More <ArrowRight size={14} />
        </Link>
      </div>

      {favoriteSongs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--panel)', borderRadius: 18,
          border: '1px dashed rgba(0,212,255,0.15)',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LibraryIcon size={28} color="#7a90b0" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Your library is empty</p>
          <p style={{ fontSize: 13, color: '#7a90b0', marginBottom: 20 }}>Heart your favorite songs to save them here!</p>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 999,
              background: 'linear-gradient(135deg, #00d4ff, #0055cc)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,212,255,0.35)',
            }}
          >
            Explore Songs
          </Link>
        </div>
      ) : (
        <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {favoriteSongs.map(s => (
            <SongCard key={s._id} song={s} playlist={favoriteSongs} />
          ))}
        </div>
      )}
    </div>
  );
}
