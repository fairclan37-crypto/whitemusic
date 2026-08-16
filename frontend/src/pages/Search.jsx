import { useState } from 'react';
import SongCard from '../components/SongCard';
import { Search as SearchIcon, Headphones, Disc, Sparkles, TrendingUp } from 'lucide-react';

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
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
          <span style={{ display: 'inline-block', width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(to bottom, #ff2a5f, #00d4ff)' }} />
          Search Tracks
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>Find any song, artist, or album</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--panel)',
        border: '1px solid rgba(255,42,95,0.2)',
        borderRadius: 16, padding: '12px 16px', marginBottom: 18,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <SearchIcon size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
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
          padding: '9px 22px', borderRadius: 12,
          background: 'linear-gradient(135deg, #ff2a5f, #0066ff)',
          color: '#fff', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer',
          flexShrink: 0, boxShadow: '0 4px 14px rgba(255,42,95,0.4)',
        }}>
          Search
        </button>
      </form>

      {/* Quick Search Tag Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <TrendingUp size={12} color="var(--accent-red)" /> Popular:
        </span>
        {SUGGESTED_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            style={{
              fontSize: 12, fontWeight: 600, color: '#fff',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '5px 12px', borderRadius: 999,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,42,95,0.4)'; e.currentTarget.style.background = 'rgba(255,42,95,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 36 }}>
            {[1, 1.4, 0.8, 1.2, 0.9].map((d, i) => (
              <div key={i} style={{
                width: 5, borderRadius: 3,
                background: i % 2 === 0 ? 'linear-gradient(to top, #ff2a5f, #00d4ff)' : 'linear-gradient(to top, #0055cc, #ff0044)',
                transformOrigin: 'bottom',
                animation: `eq-bar ${d * 0.5 + 0.4}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.08}s`, minHeight: 5,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'rgba(255,42,95,0.1)',
            border: '1px solid rgba(255,42,95,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Disc size={32} color="var(--accent-red)" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>No results for "{query}"</p>
          <p style={{ fontSize: 13 }}>Try searching for a different song or artist</p>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, margin: 0 }}>
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
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0,212,255,0.15)',
          }}>
            <Headphones size={36} color="var(--accent)" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>What do you want to hear today?</p>
          <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>Type any song title, artist, or pick a popular search tag above</p>
        </div>
      )}
    </div>
  );
}