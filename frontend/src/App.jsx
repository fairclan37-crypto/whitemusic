import { useState, Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Library from './pages/Library';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', width: '100vw', background: '#06080f', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, textAlign: 'center', padding: 20
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ff2a5f', margin: 0 }}>White Music</h2>
          <p style={{ fontSize: 14, color: '#8a9fbe', margin: 0 }}>Something went wrong while loading streams.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: 999,
              background: 'linear-gradient(135deg, #ff2a5f, #0066ff)',
              color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,42,95,0.4)',
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
      <BrowserRouter>
        {/* Starfield wallpaper wrapper */}
        <div className="wallpaper">
          {/* App window card */}
          <div className="app-window">
            <AuthModal />
            <MobileHeader />

            <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
              <Sidebar />
              {/* Main content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <main className="main-scroll-area">
                  <Routes>
                    <Route path="/"           element={<Home />} />
                    <Route path="/search"     element={<Search />} />
                    <Route path="/bollywood"  element={<Bollywood />} />
                    <Route path="/hollywood"  element={<Hollywood />} />
                    <Route path="/library"    element={<Library />} />
                  </Routes>
                </main>
                <Player />
              </div>
            </div>

            <MobileNav />
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MusicProvider>
        <AppContent />
      </MusicProvider>
    </ErrorBoundary>
  );
}

export default App;