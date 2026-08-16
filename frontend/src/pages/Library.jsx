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
          <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Personal Collection
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
            <Heart size={28} style={{ color: 'var(--primary)', fill: 'rgba(255,46,76,0.3)' }} />
            Your Library
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 4 }}>
            {favoriteSongs.length} {favoriteSongs.length === 1 ? 'track' : 'tracks'} saved to favorites
          </p>
        </div>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, color: '#fff',
            textDecoration: 'none', padding: '8px 18px', borderRadius: 999,
            background: 'var(--panel)', border: '1px solid var(--hairline)',
            transition: 'border-color 0.15s',
          }}
        >
          Discover More <ArrowRight size={15} />
        </Link>
      </div>

      {favoriteSongs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--panel)', borderRadius: 20,
          border: '1px dashed var(--hairline)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'rgba(255,46,76,0.08)', border: '1px solid rgba(255,46,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LibraryIcon size={30} color="var(--primary)" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Your library is empty</p>
          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', marginBottom: 22 }}>Heart your favorite songs to save them here!</p>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 999,
              background: 'var(--play-gradient)',
              color: '#fff', fontWeight: 700, fontSize: 13.5,
              textDecoration: 'none', boxShadow: '0 8px 20px rgba(255,46,76,0.35)',
            }}
          >
            Explore Songs
          </Link>
        </div>
      ) : (
        <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {favoriteSongs.map(s => (
            <SongCard key={s._id} song={s} playlist={favoriteSongs} />
          ))}
        </div>
      )}
    </div>
  );
}