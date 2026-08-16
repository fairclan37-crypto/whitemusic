import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search, Film, Library, Music2, LogOut, Globe } from 'lucide-react';
import { MusicContext } from '../context/MusicContext';

const menuItems = [
  { to: '/',          label: 'Home',       icon: HomeIcon },
  { to: '/search',    label: 'Search',     icon: Search },
  { to: '/bollywood', label: 'Bollywood',  icon: Film },
  { to: '/hollywood', label: 'Hollywood',  icon: Globe },
  { to: '/library',   label: 'Library',    icon: Library },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout, setIsAuthModalOpen } = useContext(MusicContext);

  return (
    <aside className="sidebar-container">
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 20px', textDecoration: 'none' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #ff2a5f 0%, #0066ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255,42,95,0.5)',
        }}>
          <Music2 size={20} color="white" />
        </div>
        <span className="brand-name" style={{
          fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em',
          background: 'linear-gradient(90deg, #ffffff, #00d4ff, #ff2a5f)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          White Music
        </span>
      </Link>

      {/* Section label */}
      <div className="section-label" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        margin: '4px 0 8px', padding: '7px 12px',
        borderRadius: 9,
        background: 'rgba(255,42,95,0.08)',
        border: '1px solid rgba(255,42,95,0.15)',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: '#fff',
      }}>
        <span>Navigation</span>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
        {menuItems.map(({ to, label, icon: Icon }, idx) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`nav-item${isActive ? ' nav-active' : ''}`}
              style={{ animation: `slide-right 0.3s ${idx * 0.05}s both` }}
            >
              {isActive && <span className="nav-active-strip" />}
              <Icon size={18} color={isActive ? 'var(--accent-red)' : 'currentColor'} style={{ flexShrink: 0 }} />
              <span className="nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Auth Widget */}
      <div className="user-profile-widget" style={{
        marginTop: 16, paddingTop: 14,
        borderTop: '1px solid rgba(0,212,255,0.08)',
      }}>
        {user ? (
          /* Logged In Card */
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 12,
            background: 'rgba(255,42,95,0.08)',
            border: '1px solid rgba(255,42,95,0.2)',
          }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                objectFit: 'cover', flexShrink: 0,
                border: '1.5px solid var(--accent-red)',
              }}
              onError={e => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'; }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#fff', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.name}
              </p>
              <p style={{
                fontSize: 10.5, color: 'var(--muted)', margin: '2px 0 0',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                cursor: 'pointer', padding: 4, flexShrink: 0,
                transition: 'color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4d'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          /* Google Login Button */
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(255,42,95,0.15), rgba(0,102,255,0.2))',
              border: '1px solid rgba(255,42,95,0.25)',
              color: '#fff', fontWeight: 700, fontSize: 12.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,42,95,0.25), rgba(0,102,255,0.3))'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,42,95,0.15), rgba(0,102,255,0.2))'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}