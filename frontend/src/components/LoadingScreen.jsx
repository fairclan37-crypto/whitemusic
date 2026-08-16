import { useEffect, useState } from 'react';
import { Music2, Headphones, Zap, Sparkles } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase]       = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => {
      const iv = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(iv);
            setPhase(2);
            setTimeout(onComplete, 500);
            return 100;
          }
          return p + 2.2;
        });
      }, 25);
      return () => clearInterval(iv);
    }, 800);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#05070d',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 0.5s ease',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,42,95,0.15) 0%, rgba(0,212,255,0.1) 50%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'floatGlow 3s ease-in-out infinite',
      }} />

      {/* Logo block */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18, marginBottom: 56,
        animation: 'logoIn 0.7s cubic-bezier(0.2,0.8,0.2,1) both',
      }}>
        {/* Icon */}
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          background: 'linear-gradient(135deg, #ff2a5f 0%, #0066ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(255,42,95,0.5), 0 0 80px rgba(0,212,255,0.25)',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <Music2 size={36} color="white" />
        </div>

        {/* Name */}
        <div>
          <div style={{
            fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em',
            fontFamily: "'Figtree', sans-serif",
            background: 'linear-gradient(90deg, #ffffff, #00d4ff, #ff2a5f)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}>
            White Music
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '0.2em',
            color: 'rgba(255,42,95,0.8)', textTransform: 'uppercase',
            marginTop: 6,
          }}>
            Your Vibe. Your Sound.
          </div>
        </div>
      </div>

      {/* EQ Bars animation */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 5, height: 48, marginBottom: 40,
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {[1, 1.4, 0.8, 1.2, 0.9, 1.5, 1.1, 0.7, 1.3, 1.0].map((d, i) => (
          <div key={i} style={{
            width: 6, borderRadius: 3,
            background: i % 2 === 0
              ? 'linear-gradient(to top, #ff2a5f, #ff0044)'
              : 'linear-gradient(to top, #0066ff, #00d4ff)',
            transformOrigin: 'bottom',
            animation: `eqLoad ${d * 0.6 + 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.06}s`,
            minHeight: 6,
          }} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: 280, marginBottom: 16 }}>
        <div style={{
          height: 3, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #ff2a5f, #00d4ff)',
            width: `${progress}%`,
            transition: 'width 0.08s linear',
            boxShadow: '0 0 12px rgba(255,42,95,0.8)',
          }} />
        </div>
      </div>

      {/* Status text with Lucide icons */}
      <div style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: 13, fontWeight: 600,
        color: '#8a9fbe',
        letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {progress < 30 && <><Music2 size={15} color="var(--accent)" /> Initializing...</>}
        {progress >= 30 && progress < 65 && <><Headphones size={15} color="var(--accent-red)" /> Loading tracks...</>}
        {progress >= 65 && progress < 95 && <><Zap size={15} color="var(--accent)" /> Almost ready...</>}
        {progress >= 95 && <><Sparkles size={15} color="var(--accent-red)" /> Welcome!</>}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@900&display=swap');
        @keyframes logoIn {
          from { opacity: 0; transform: translateY(24px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes floatGlow {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50%       { transform: translateX(-50%) scale(1.3); opacity: 1; }
        }
        @keyframes eqLoad {
          from { height: 8px; }
          to   { height: 44px; }
        }
      `}</style>
    </div>
  );
}