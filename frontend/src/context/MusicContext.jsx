import { createContext, useState, useEffect } from 'react';

export const MusicContext = createContext();

const FALLBACK_SONGS = [
  {
    _id: "KeWjF_723Ww",
    title: "Kesariya - Brahmastra",
    artist: "Arijit Singh, Pritam",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    audioUrl: "/api/stream/KeWjF_723Ww",
    duration: "4:28"
  },
  {
    _id: "fJ9rUzIMcZQ",
    title: "Chaleya - Jawan",
    artist: "Arijit Singh, Anirudh Ravichander",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
    audioUrl: "/api/stream/fJ9rUzIMcZQ",
    duration: "3:20"
  },
  {
    _id: "YykjpeuMNEk",
    title: "Heeriye",
    artist: "Jasleen Royal, Arijit Singh",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80",
    audioUrl: "/api/stream/YykjpeuMNEk",
    duration: "3:14"
  },
  {
    _id: "hhuGQUYJtf8",
    title: "Tum Se Hi - Jab We Met",
    artist: "Mohit Chauhan, Pritam",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    audioUrl: "/api/stream/hhuGQUYJtf8",
    duration: "5:23"
  }
];

export function MusicProvider({ children }) {
  const [songs, setSongs] = useState(FALLBACK_SONGS);
  const [currentSong, setCurrentSong] = useState(FALLBACK_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState(FALLBACK_SONGS);
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

  // On mount, load default songs from API
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await fetch('/api/search?q=bollywood%20hits');
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          setSongs(data.results);
          setPlaylist(data.results);
          setCurrentSong(data.results[0]);
        }
      } catch (e) {
        console.warn('Default API fetch fallback to static songs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaults();
  }, []);

  const togglePlay = () => setIsPlaying(!isPlaying);

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
      songs, currentSong, isPlaying, loading, togglePlay,
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
