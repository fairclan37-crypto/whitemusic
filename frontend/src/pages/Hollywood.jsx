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
          <p style={{ fontSize:12, color:'var(--accent)', fontWeight:700, marginBottom:4, letterSpacing:'0.08em', textTransform:'uppercase' }}>Category</p>
          <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.03em', display:'flex', alignItems:'center', gap:10, margin:0 }}>
            <span style={{ display:'inline-block', width:4, height:24, borderRadius:2, background:'linear-gradient(to bottom, #00d4ff, #ff2a5f)', flexShrink:0 }}/>
            <Globe size={26} color="var(--accent)" /> Hollywood Hits
          </h1>
          <p style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>International chartbusters & Billboard hits</p>
        </div>
        <span style={{
          fontSize:11, fontWeight:700, color:'var(--muted)',
          background:'rgba(255,255,255,0.04)', padding:'4px 12px',
          borderRadius:8, border:'1px solid rgba(0,212,255,0.15)',
          display:'flex', alignItems:'center', gap:6
        }}>
          <Sparkles size={13} color="var(--accent)" /> {songs.length} Tracks
        </span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:36 }}>
            {[0.9,1.3,1.0,1.2,0.8].map((d,i) => (
              <div key={i} style={{
                width:5, borderRadius:3,
                background: i % 2 === 0 ? 'linear-gradient(to top, #0055cc, #00d4ff)' : 'linear-gradient(to top, #ff2a5f, #ff0044)',
                transformOrigin:'bottom',
                animation:`eq-bar ${d*0.6+0.4}s ease-in-out infinite alternate`,
                animationDelay:`${i*0.07}s`, minHeight:5,
              }}/>
            ))}
          </div>
        </div>
      ) : (
        <div className="songs-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:14 }}>
          {songs.map(s => (
            <SongCard key={s._id} song={s} playlist={songs} />
          ))}
        </div>
      )}
    </div>
  );
}