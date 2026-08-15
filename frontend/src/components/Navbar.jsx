import { Link, useLocation } from 'react-router-dom';
import { Music, Search, Home as HomeIcon, Library, Film } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/bollywood', label: 'Bollywood', icon: Film },
    { to: '/hollywood', label: 'Hollywood', icon: Film },
    { to: '/library', label: 'Library', icon: Library },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0b0f]/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 group-hover:opacity-70 transition" />
            <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg shadow-purple-500/20">
              <Music size={24} className="text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Music X
            </span>
          </span>
        </Link>

        <div className="flex gap-1 md:gap-2">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}