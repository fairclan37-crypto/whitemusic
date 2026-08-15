import { useState } from 'react';
import SongCard from '../components/SongCard';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);

  const handleSearch = async e => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setResults([]);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) setResults(data.results);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.03em', display:'flex', alignItems:'center', gap:10, margin:0 }}>
          <span style={{ display:'inline-block', width:4, height:22, borderRadius:2, background:'linear-gradient(to bottom, #00d4ff, #0055cc)' }}/>
          Search
        </h1>
        <p style={{ color:'#7a90b0', fontSize:13, marginTop:4, margin:'4px 0 0' }}>Find any song, artist, or album</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} style={{
        display:'flex', alignItems:'center', gap:12,
        background:'var(--panel)',
        border:'1px solid rgba(0,212,255,0.08)',
        borderRadius:14, padding:'10px 14px', marginBottom:24,
      }}>
        <SearchIcon size={18} color="#7a90b0" style={{ flexShrink:0 }} />
        <input
          type="text"
          placeholder="Search songs, artists..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex:1, background:'none', border:'none', outline:'none',
            color:'#fff', fontSize:14, fontFamily:'inherit',
          }}
        />
        <button type="submit" style={{
          padding:'8px 18px', borderRadius:10,
          background:'linear-gradient(135deg, #00d4ff, #0055cc)',
          color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer',
          flexShrink:0,
        }}>
          Search
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:'50px 0' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:32 }}>
            {[1,1.4,0.8,1.2,0.9].map((d,i) => (
              <div key={i} style={{
                width:4, borderRadius:2,
                background:'linear-gradient(to top, #0055cc, #00d4ff)',
                transformOrigin:'bottom',
                animation:`eq-bar ${d*0.5+0.4}s ease-in-out infinite alternate`,
                animationDelay:`${i*0.08}s`, minHeight:4,
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#7a90b0' }}>
          <p style={{ fontSize:36, marginBottom:12 }}>🎵</p>
          <p style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 }}>No results for "{query}"</p>
          <p style={{ fontSize:13 }}>Try different keywords or check your spelling</p>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <>
          <div style={{ marginBottom:14 }}>
            <p style={{ color:'#7a90b0', fontSize:13, fontWeight:600, margin:0 }}>
              {results.length} results for "<span style={{color:'#fff'}}>{query}</span>"
            </p>
          </div>
          <div className="songs-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:14 }}>
            {results.map(song => (
              <SongCard key={song._id} song={song} playlist={results} />
            ))}
          </div>
        </>
      )}

      {/* Initial empty state */}
      {!searched && !loading && (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{
            width:64, height:64, borderRadius:20, margin:'0 auto 16px',
            background:'rgba(0,212,255,0.08)',
            border:'1px solid rgba(0,212,255,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28,
          }}>
            🎧
          </div>
          <p style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:6 }}>What do you want to hear?</p>
          <p style={{ fontSize:13, color:'#7a90b0' }}>Search for songs, artists, albums</p>
        </div>
      )}
    </div>
  );
}