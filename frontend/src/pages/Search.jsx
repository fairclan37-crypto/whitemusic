import { useState } from 'react';
import SongCard from '../components/SongCard';
import { Search as SearchIcon, Headphones, Disc, TrendingUp } from 'lucide-react';

const SUGGESTED_TAGS = [
  'Arijit Singh', 'Taylor Swift', 'Bollywood 2024',
  'Hollywood Top 50', 'Lofi Beats', 'Punjabi Hits',
  'EDM Party', 'Slow & Reverb'
];

export default function Search() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setLoading(true); setSearched(true); setResults([]);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) setResults(data.results);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    performSearch(tag);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          Search Tracks
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 4 }}>Find any song, artist, or album</p>
      </div>

      {/* Synapz Search Form */}
      <form onSubmit={handleSearch} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--panel)',
        border: '1px solid var(--hairline)',
        borderRadius: 14, padding: '12px 16px', marginBottom: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        <SearchIcon size={20} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#fff', fontSize: 14.5, fontFamily: 'inherit', fontWeight: 500,
          }}
        />
        <button type="submit" style={{
          padding: '9px 24px', borderRadius: 999,
          background: 'var(--play-gradient)',
          color: '#fff', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer',
          flexShrink: 0, boxShadow: '0 6px 18px rgba(255,46,76,0.35)',
        }}>
          Search
        </button>
      </form>

      {/* Synapz Quick Search Tag Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <TrendingUp size={13} color="var(--primary)" /> Popular:
        </span>
        {SUGGESTED_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="chip"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="eq-bar" style={{ height: 36, gap: 4 }}>
            <span /><span /><span /><span /><span />
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted-foreground)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'rgba(255,46,76,0.1)',
            border: '1px solid rgba(255,46,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Disc size={32} color="var(--primary)" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>No results for "{query}"</p>
          <p style={{ fontSize: 13 }}>Try searching for a different song or artist</p>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13.5, fontWeight: 600, margin: 0 }}>
              Found {results.length} results for "<span style={{ color: '#fff' }}>{query}</span>"
            </p>
          </div>
          <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {results.map(song => (
              <SongCard key={song._id} song={song} playlist={results} />
            ))}
          </div>
        </>
      )}

      {/* Initial empty state */}
      {!searched && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24, margin: '0 auto 20px',
            background: 'rgba(255,46,76,0.08)',
            border: '1px solid rgba(255,46,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(255,46,76,0.15)',
          }}>
            <Headphones size={36} color="var(--primary)" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>What do you want to hear today?</p>
          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)' }}>Type any song title, artist, or pick a popular search tag above</p>
        </div>
      )}
    </div>
  );
}