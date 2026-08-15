import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase]       = useState(0); // 0=logo, 1=bars, 2=done
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase 0 → 1 after 600 ms
    const t1 = setTimeout(() => setPhase(1), 600);

    // Progress bar fill
    const t2 = setTimeout(() => {
      const iv = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(iv);
            setPhase(2);
            setTimeout(onComplete, 500);
            return 100;
          }
          return p + 1.8;
        });
      }, 28);
      return () => clearInterval(iv);
    }, 800);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#080c14',
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
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
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
          background: 'linear-gradient(135deg, #00d4ff 0%, #0055cc 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2)',
          animation: 'float 3s ease-in-out infinite',
        }}>
          {/* Music note SVG */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        {/* Name */}
        <div>
          <div style={{
            fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em',
            fontFamily: "'Figtree', sans-serif",
            background: 'linear-gradient(90deg, #00d4ff, #0ea5e9, #ffffff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}>
            White Music
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '0.2em',
            color: 'rgba(0,212,255,0.6)', textTransform: 'uppercase',
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
              ? 'linear-gradient(to top, #0055cc, #00d4ff)'
              : 'linear-gradient(to top, #0077ee, #33ddff)',
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
            background: 'linear-gradient(90deg, #00d4ff, #0055cc)',
            width: `${progress}%`,
            transition: 'width 0.08s linear',
            boxShadow: '0 0 12px rgba(0,212,255,0.8)',
          }} />
        </div>
      </div>

      {/* Status text */}
      <p style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: 13, fontWeight: 600,
        color: 'rgba(122,144,176,1)',
        letterSpacing: '0.06em',
        transition: 'opacity 0.3s',
      }}>
        {progress < 30  && '🎵 Initializing...'}
        {progress >= 30 && progress < 65  && '🎧 Loading tracks...'}
        {progress >= 65 && progress < 95  && '🔥 Almost ready...'}
        {progress >= 95 && '✨ Welcome!'}
      </p>

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