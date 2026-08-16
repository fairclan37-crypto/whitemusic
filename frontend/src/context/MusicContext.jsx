import { createContext, useState, useEffect } from 'react';

export const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: None, 1: One, 2: All
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('music_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // User auth state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('music_x_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('music_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('music_x_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('music_x_user');
    }
  }, [user]);

  // On mount, load some default songs
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await fetch('/api/search?q=bollywood%20hits');
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setSongs(data.results);
          setPlaylist(data.results);
          if (data.results.length > 0) setCurrentSong(data.results[0]);
        }
      } catch (e) {
        console.error('Default fetch failed:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaults();
  }, []);

  const togglePlay = () => setIsPlaying(prev => !prev);

  const nextSong = () => {
    if (repeatMode === 1) {
      const audio = document.querySelector('audio');
      if (audio) audio.currentTime = 0;
      setIsPlaying(true);
      return;
    }

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const idx = playlist.findIndex(s => s._id === currentSong?._id);
      nextIndex = (idx + 1) % playlist.length;
    }
    setCurrentSong(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const prevSong = () => {
    const idx = playlist.findIndex(s => s._id === currentSong?._id);
    const prevIndex = (idx - 1 + playlist.length) % playlist.length;
    setCurrentSong(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const playSong = (song, customPlaylist = null) => {
    if (customPlaylist && Array.isArray(customPlaylist)) {
      setPlaylist(customPlaylist);
    }
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const toggleFavorite = (songId) => {
    setFavorites(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const loginWithGoogle = (customData = null) => {
    const googleUser = customData || {
      name: 'Music Fan',
      email: 'fan@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
    };
    setUser(googleUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <MusicContext.Provider value={{
      songs, currentSong, isPlaying, setIsPlaying, loading, togglePlay,
      nextSong, prevSong, playSong, playlist,
      shuffle, setShuffle, repeatMode, setRepeatMode,
      favorites, toggleFavorite,
      user, loginWithGoogle, logout,
      isAuthModalOpen, setIsAuthModalOpen
    }}>
      {children}
    </MusicContext.Provider>
  );
}