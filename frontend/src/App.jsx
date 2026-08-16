import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { MusicProvider } from './context/MusicContext';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import AuthModal from './components/AuthModal';
import MobileHeader from './components/MobileHeader';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Search from './pages/Search';
import Bollywood from './pages/Bollywood';
import Hollywood from './pages/Hollywood';
import Artists from './pages/Artists';
import Podcasts from './pages/Podcasts';
import Library from './pages/Library';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function TopHistoryBar() {
  const navigate = useNavigate();
  return (
    <div className="center__bar" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 28px 8px' }}>
      <button
        onClick={() => navigate(-1)}
        className="histbtn"
        title="Go Back"
        style={{
          display: 'grid', placeItems: 'center',
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--panel)', border: '1px solid var(--hairline)',
          color: '#fff', cursor: 'pointer', transition: 'all 0.15s ease',
        }}
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={() => navigate(1)}
        className="histbtn"
        title="Go Forward"
        style={{
          display: 'grid', placeItems: 'center',
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--panel)', border: '1px solid var(--hairline)',
          color: '#fff', cursor: 'pointer', transition: 'all 0.15s ease',
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function AppContent() {
  return (
    <div className="wallpaper">
      <div className="app-window">
        <AuthModal />
        <MobileHeader />

        <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
          <Sidebar />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <TopHistoryBar />

            <main className="main-scroll-area">
              <Routes>
                <Route path="/"           element={<Home />} />
                <Route path="/search"     element={<Search />} />
                <Route path="/bollywood"  element={<Bollywood />} />
                <Route path="/hollywood"  element={<Hollywood />} />
                <Route path="/artists"    element={<Artists />} />
                <Route path="/podcasts"   element={<Podcasts />} />
                <Route path="/library"    element={<Library />} />
              </Routes>
            </main>

            <Player />
          </div>
        </div>

        <MobileNav />
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <MusicProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MusicProvider>
  );
}

export default App;