import { useState } from 'react';
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

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <MusicProvider>
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
    </MusicProvider>
  );
}

export default App;