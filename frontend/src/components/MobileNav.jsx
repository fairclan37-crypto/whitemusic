import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search, Film, Library } from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Home',      icon: HomeIcon },
  { to: '/search',    label: 'Search',    icon: Search },
  { to: '/bollywood', label: 'Bollywood', icon: Film },
  { to: '/hollywood', label: 'Hollywood', icon: Film },
  { to: '/library',   label: 'Library',   icon: Library },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="mobile-nav">
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : '#7a90b0',
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={19} color={isActive ? 'var(--accent)' : 'currentColor'} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
