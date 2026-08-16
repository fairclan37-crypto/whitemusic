import { useState } from 'react';
import SongCard from '../components/SongCard';
import { Mic2, UserCheck, Flame } from 'lucide-react';

const ARTISTS_LIST = [
  { name: 'Arijit Singh', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80', genre: 'Bollywood Romantic' },
  { name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80', genre: 'Pop & Country' },
  { name: 'Pritam', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80', genre: 'Bollywood Hits' },
  { name: 'The Weeknd', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&auto=format&fit=crop&q=80', genre: 'R&B / Pop' },
  { name: 'Shreya Ghoshal', avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80', genre: 'Melody Queen' },
  { name: 'Diljit Dosanjh', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80', genre: 'Bhangra & Pop' },
  { name: 'A.R. Rahman', avatar: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&auto=format&fit=crop&q=80', genre: 'Maestro Composer' },
  { name: 'Badshah', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&auto=format&fit=crop&q=80', genre: 'Hip Hop / Party' },
];

export default function Artists() {
  const [selectedArtist, setSelectedArtist] = useState('Arijit Singh');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchArtistSongs = async (artistName) => {
    setSelectedArtist(artistName);
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(artistName + ' songs')}`);
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) setSongs(data.results);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Explore Creators
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
          <Mic2 size={30} color="var(--primary)" /> Top Artists
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 4 }}>
          Discover hit tracks by your favorite singers and producers
        </p>
      </div>

      {/* Artists Avatar Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14, marginBottom: 32 }}>
        {ARTISTS_LIST.map(artist => {
          const isSelected = selectedArtist === artist.name;
          return (
            <div
              key={artist.name}
              onClick={() => fetchArtistSongs(artist.name)}
              style={{
                background: isSelected ? 'var(--panel-strong)' : 'var(--panel)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--hairline)'}`,
                borderRadius: 16, padding: '14px 10px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 8px 24px rgba(255,46,76,0.25)' : 'none',
              }}
            >
              <img
                src={artist.avatar}
                alt={artist.name}
                style={{
                  width: 64, height: 64, borderRadius: '50%', objectFit: 'cover',
                  margin: '0 auto 10px', border: `2px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                }}
              />
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {artist.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {artist.genre}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Artist Tracks */}
      {selectedArtist && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              <Flame size={20} color="var(--primary)" /> Top Songs by {selectedArtist}
            </h2>
            {songs.length > 0 && (
              <span style={{
                fontSize: 11.5, fontWeight: 800, color: 'var(--muted-foreground)',
                background: 'var(--panel)', padding: '5px 14px',
                borderRadius: 999, border: '1px solid var(--hairline)',
              }}>
                {songs.length} Tracks
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
              <div className="eq-bar" style={{ height: 36, gap: 4 }}>
                <span /><span /><span /><span /><span />
              </div>
            </div>
          ) : (
            <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {songs.map(s => (
                <SongCard key={s._id} song={s} playlist={songs} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}