import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import SongCard from '../components/SongCard';
import { Play, Pause, Sparkles } from 'lucide-react';

export default function Home() {
  const { songs, loading, playSong, currentSong, isPlaying } = useContext(MusicContext);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:36 }}>
            {[1,1.4,0.8,1.2,0.9,1.1].map((d,i)=>(
              <div key={i} style={{
                width:5, borderRadius:3,
                background: i%2===0 ? 'linear-gradient(to top, #0055cc, #00d4ff)' : 'linear-gradient(to top, #0077ee, #33ddff)',
                transformOrigin:'bottom',
                animation:`eq-bar ${d*0.6+0.4}s ease-in-out infinite alternate`,
                animationDelay:`${i*0.07}s`,
                minHeight:5,
              }}/>
            ))}
          </div>
          <p style={{ color:'var(--accent)', fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.8 }}>
            Loading your tracks...
          </p>
        </div>
      </div>
    );
  }

  const featured = songs[0];

  return (
    <div>
      {/* ── Hero Banner ── */}
      {featured && (
        <div style={{
          position:'relative', borderRadius:18, overflow:'hidden',
          border:'1px solid rgba(0,212,255,0.1)',
          marginBottom:32, minHeight:180,
          background:'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,85,204,0.18) 50%, rgba(10,14,23,0.9) 100%)',
        }}>
          {/* Blurred BG cover */}
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:`url(${featured.cover})`,
            backgroundSize:'cover', backgroundPosition:'center 30%',
            filter:'blur(40px) brightness(0.25)',
            transform:'scale(1.1)',
          }} />

          <div style={{ position:'relative', display:'flex', alignItems:'center', gap:28, padding:'28px 36px' }}>
            {/* Cover */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <img
                src={featured.cover}
                alt={featured.title}
                style={{
                  width:140, height:140, borderRadius:16, objectFit:'cover',
                  boxShadow:'0 16px 40px rgba(0,0,0,0.5)',
                  border:'1px solid rgba(0,212,255,0.2)',
                }}
              />
            </div>

            {/* Info */}
            <div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'4px 10px', borderRadius:999,
                background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.25)',
                color:'var(--accent)', fontSize:11, fontWeight:700, letterSpacing:'0.08em',
                textTransform:'uppercase', marginBottom:12,
              }}>
                <Sparkles size={12}/> Featured Release
              </div>

              <h1 style={{
                fontSize:'clamp(24px, 3vw, 38px)', fontWeight:900,
                letterSpacing:'-0.03em', lineHeight:1.1,
                color:'#fff', marginBottom:8,
                maxWidth:'18ch', overflow:'hidden',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              }}>
                {featured.title}
              </h1>

              <p style={{ fontSize:15, color:'#7a90b0', fontWeight:600, marginBottom:18 }}>
                {featured.artist}
              </p>

              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <button
                  onClick={()=>playSong(featured, songs)}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:8,
                    padding:'10px 24px', borderRadius:999,
                    background:'linear-gradient(135deg, #00d4ff, #0055cc)',
                    color:'#fff', fontWeight:700, fontSize:14,
                    border:'none', cursor:'pointer',
                    boxShadow:'0 6px 20px rgba(0,212,255,0.4)',
                    transition:'transform 0.15s ease',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                >
                  {currentSong?._id===featured._id && isPlaying
                    ? <><Pause size={16} fill="white"/>&nbsp;Pause</>
                    : <><Play size={16} fill="white" style={{marginLeft:1}}/>&nbsp;Play Now</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Song Grid ── */}
      <section>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ display:'flex', alignItems:'center', gap:10, fontSize:20, fontWeight:800, letterSpacing:'-0.02em', margin:0 }}>
            <span style={{
              display:'inline-block', width:4, height:20, borderRadius:2,
              background:'linear-gradient(to bottom, #00d4ff, #0055cc)',
            }}/>
            Discover Hits
          </h2>
          <span style={{
            fontSize:11, fontWeight:700, color:'#7a90b0',
            background:'rgba(255,255,255,0.04)', padding:'4px 10px',
            borderRadius:8, letterSpacing:'0.05em', textTransform:'uppercase',
          }}>
            {songs.length} Tracks
          </span>
        </div>

        <div className="songs-grid" style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))',
          gap:14,
        }}>
          {songs.map(s => (
            <SongCard key={s._id} song={s} playlist={songs} />
          ))}
        </div>
      </section>
    </div>
  );
}
