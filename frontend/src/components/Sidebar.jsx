import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, Search, Film, Mic2, Radio, Plus,
  Download, LogIn, Music2, Clapperboard, LogOut
} from 'lucide-react';
import { MusicContext } from '../context/MusicContext';

const menuItems = [
  { to: '/',          label: 'Home',       icon: HomeIcon },
  { to: '/bollywood', label: 'Bollywood',  icon: Clapperboard },
  { to: '/hollywood', label: 'Hollywood',  icon: Film },
  { to: '/artists',   label: 'Artists',    icon: Mic2 },
  { to: '/podcasts',  label: 'Podcasts',   icon: Radio },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setIsAuthModalOpen } = useContext(MusicContext);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 18px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'var(--play-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(255,46,76,0.45)',
          }}>
            <Music2 size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
            White Music
          </span>
        </Link>
      </div>

      {/* Sidebar Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="sidebar-search" style={{ marginBottom: 18 }}>
        <Search size={15} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search or paste a link..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </form>

      {/* MENU Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', borderRadius: 8,
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
        color: '#ffffff', textTransform: 'uppercase', marginBottom: 8,
      }}>
        <span>MENU</span>
        <span style={{
          background: 'rgba(255,255,255,0.15)', padding: '1px 6px',
          borderRadius: 999, fontSize: 10, fontWeight: 800, color: '#fff',
        }}>
          5
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {menuItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`nav-item${isActive ? ' nav-active' : ''}`}
            >
              <Icon size={18} color={isActive ? '#ffffff' : 'var(--muted-foreground)'} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* PLAYLISTS Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', borderRadius: 8,
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
        color: '#ffffff', textTransform: 'uppercase', marginTop: 18, marginBottom: 8,
      }}>
        <span>PLAYLISTS</span>
        <button
          onClick={() => navigate('/library')}
          style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Create Playlist"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Desktop App Button */}
      <button
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 12,
          background: 'var(--panel)', border: '1px solid var(--hairline)',
          color: 'var(--muted-foreground)', fontSize: 12.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 12, cursor: 'pointer', transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
      >
        <Download size={14} /> Get the desktop app
      </button>

      {/* User Auth Section */}
      {user ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 12,
          background: 'var(--panel-strong)', border: '1px solid var(--hairline)',
        }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--primary)',
            }}
            onError={e => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'; }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </p>
            <p style={{ fontSize: 10.5, color: 'var(--muted-foreground)', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </p>
          </div>
          <button onClick={logout} title="Sign Out" style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: 4 }}>
            <LogOut size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 999,
            background: 'var(--play-gradient)',
            boxShadow: '0 6px 20px rgba(255,46,76,0.35)',
            color: '#ffffff', fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'transform 0.15s, filter 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.filter = 'brightness(1.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          <LogIn size={15} /> Sign in with Google
        </button>
      )}
    </aside>
  );
}