import { useEffect, useState } from 'react';
import { Music2, Headphones, Zap, Sparkles } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase]       = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => {
      const iv = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(iv);
            setPhase(2);
            setTimeout(onComplete, 400);
            return 100;
          }
          return p + 2.5;
        });
      }, 24);
      return () => clearInterval(iv);
    }, 700);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0a0a0c',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 0.4s ease',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Radial Glows */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,46,76,0.2) 0%, rgba(176,13,34,0.1) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo Block */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18, marginBottom: 50,
        animation: 'logoIn 0.6s cubic-bezier(0.2,0.8,0.2,1) both',
      }}>
        {/* Icon */}
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          background: 'linear-gradient(135deg, #ff3b4e 0%, #b00d22 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(255,46,76,0.5), 0 0 80px rgba(255,46,76,0.25)',
        }}>
          <Music2 size={36} color="white" />
        </div>

        {/* Brand Name */}
        <div>
          <div style={{
            fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em',
            fontFamily: "'Figtree', sans-serif",
            color: '#ffffff',
            lineHeight: 1,
          }}>
            White Music
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '0.22em',
            color: 'var(--primary)', textTransform: 'uppercase',
            marginTop: 6,
          }}>
            Powered by Synapz Design
          </div>
        </div>
      </div>

      {/* EQ Bars Animation */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 5, height: 44, marginBottom: 36,
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {[1, 1.4, 0.8, 1.2, 0.9, 1.5, 1.1, 0.7, 1.3, 1.0].map((d, i) => (
          <div key={i} style={{
            width: 5, borderRadius: 3,
            background: 'linear-gradient(to top, #ff3b4e, #b00d22)',
            transformOrigin: 'bottom',
            animation: `eqLoad ${d * 0.6 + 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.06}s`,
            minHeight: 5,
          }} />
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ width: 280, marginBottom: 16 }}>
        <div style={{
          height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #ff3b4e, #b00d22)',
            width: `${progress}%`,
            transition: 'width 0.08s linear',
            boxShadow: '0 0 12px rgba(255,46,76,0.8)',
          }} />
        </div>
      </div>

      {/* Status Text */}
      <div style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: 13, fontWeight: 600,
        color: 'var(--muted-foreground)',
        letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {progress < 30 && <><Music2 size={15} color="var(--primary)" /> Initializing Engine...</>}
        {progress >= 30 && progress < 65 && <><Headphones size={15} color="var(--primary)" /> Loading Synapz tracks...</>}
        {progress >= 65 && progress < 95 && <><Zap size={15} color="var(--primary)" /> Almost ready...</>}
        {progress >= 95 && <><Sparkles size={15} color="var(--primary)" /> Welcome!</>}
      </div>

      <style>{`
        @keyframes logoIn {
          from { opacity: 0; transform: translateY(20px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes eqLoad {
          from { height: 6px; }
          to   { height: 40px; }
        }
      `}</style>
    </div>
  );
}