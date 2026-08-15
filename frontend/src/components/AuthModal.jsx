import { useContext, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { X, User, Mail, LogIn, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithGoogle } = useContext(MusicContext);
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      loginWithGoogle({
        name: name.trim() || 'Music Listener',
        email: email.trim() || 'user@gmail.com',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'MusicFan')}`,
        provider: 'google',
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(4, 7, 12, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 400,
        background: '#0d131f',
        border: '1px solid rgba(0,212,255,0.18)',
        borderRadius: 24, padding: '32px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 32px rgba(0,212,255,0.15)',
        animation: 'scale-in 0.25s cubic-bezier(0.2,0.8,0.2,1) both',
      }}>
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7a90b0', cursor: 'pointer', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#7a90b0'}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,85,204,0.25))',
            border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LogIn size={28} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Sign In to White Music
          </h2>
          <p style={{ fontSize: 13, color: '#7a90b0', marginTop: 6, margin: '6px 0 0' }}>
            Sync your favorites & enjoy unlimited music
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 14,
            background: '#ffffff', color: '#1f2937',
            border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
            transition: 'transform 0.15s, filter 0.15s',
            marginBottom: 20,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.filter = 'brightness(0.97)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          {/* Official Google G Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: '#7a90b0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or customize profile</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <User size={16} color="#7a90b0" />
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13, fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <Mail size={16} color="#7a90b0" />
            <input
              type="email"
              placeholder="Google Email (Optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13, fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Sign In CTA */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%', padding: '11px', borderRadius: 12,
            background: 'linear-gradient(135deg, #00d4ff, #0055cc)',
            color: '#fff', fontWeight: 700, fontSize: 13.5,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,212,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <CheckCircle2 size={16} /> Sign In
        </button>
      </div>
    </div>
  );
}
