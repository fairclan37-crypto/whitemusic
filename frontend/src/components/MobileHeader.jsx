import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Music2, LogIn } from 'lucide-react';
import { MusicContext } from '../context/MusicContext';

export default function MobileHeader() {
  const { user, setIsAuthModalOpen } = useContext(MusicContext);

  return (
    <header className="mobile-header">
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #00d4ff 0%, #0055cc 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(0,212,255,0.4)',
        }}>
          <Music2 size={18} color="white" />
        </div>
        <span style={{
          fontSize: 19, fontWeight: 900, letterSpacing: '-0.03em',
          background: 'linear-gradient(90deg, #00d4ff, #ffffff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          White Music
        </span>
      </Link>

      {/* User Profile / Login */}
      {user ? (
        <img
          src={user.avatar}
          alt={user.name}
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            objectFit: 'cover', border: '1.5px solid var(--accent)',
            cursor: 'pointer',
          }}
          onError={e => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'; }}
        />
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            padding: '6px 12px', borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,85,204,0.2))',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#fff', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <LogIn size={14} color="var(--accent)" /> Sign In
        </button>
      )}
    </header>
  );
}
