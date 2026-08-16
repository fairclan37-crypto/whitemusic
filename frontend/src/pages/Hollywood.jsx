import { useEffect, useState } from 'react';
import SongCard from '../components/SongCard';
import { Globe, Sparkles } from 'lucide-react';

export default function Hollywood() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/search?q=latest%20hollywood%20hits')
      .then(r => r.json())
      .then(d => { if (d.results) setSongs(d.results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <p style={{ fontSize:13, color:'var(--primary)', fontWeight:700, marginBottom:4, letterSpacing:'0.08em', textTransform:'uppercase' }}>Category</p>
          <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', display:'flex', alignItems:'center', gap:12, margin:0 }}>
            <Globe size={30} color="var(--primary)" /> Hollywood Hits
          </h1>
          <p style={{ color:'var(--muted-foreground)', fontSize:14, marginTop:4 }}>International chartbusters & Billboard hits</p>
        </div>
        <span style={{
          fontSize:11.5, fontWeight:800, color:'var(--muted-foreground)',
          background:'var(--panel)', padding:'6px 14px',
          borderRadius:999, border:'1px solid var(--hairline)',
          display:'flex', alignItems:'center', gap:6
        }}>
          <Sparkles size={14} color="var(--primary)" /> {songs.length} Tracks
        </span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div className="eq-bar" style={{ height: 36, gap: 4 }}>
            <span /><span /><span /><span /><span />
          </div>
        </div>
      ) : (
        <div className="songs-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:16 }}>
          {songs.map(s => (
            <SongCard key={s._id} song={s} playlist={songs} />
          ))}
        </div>
      )}
    </div>
  );
}