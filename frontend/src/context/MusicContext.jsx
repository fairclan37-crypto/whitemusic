import { createContext, useState, useEffect } from 'react';

export const MusicContext = createContext();

const DEFAULT_HITS = [
  { _id: 'v_z4-Zg961I', title: 'Kesariya - Brahmastra', artist: 'Arijit Singh, Pritam', cover: 'https://i.ytimg.com/vi/v_z4-Zg961I/hqdefault.jpg', audioUrl: '/api/stream/v_z4-Zg961I', duration: '4:28' },
  { _id: 'ElZfdU54Cp8', title: 'Apna Bana Le - Bhediya', artist: 'Arijit Singh, Sachin-Jigar', cover: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg', audioUrl: '/api/stream/ElZfdU54Cp8', duration: '4:21' },
  { _id: 'hV_1dZ0K0z0', title: 'Chaleya - Jawan', artist: 'Arijit Singh, Shilpa Rao', cover: 'https://i.ytimg.com/vi/hV_1dZ0K0z0/hqdefault.jpg', audioUrl: '/api/stream/hV_1dZ0K0z0', duration: '3:20' },
  { _id: '2g811KoI62w', title: 'Tum Se Hi - Jab We Met', artist: 'Mohit Chauhan', cover: 'https://i.ytimg.com/vi/2g811KoI62w/hqdefault.jpg', audioUrl: '/api/stream/2g811KoI62w', duration: '5:23' },
  { _id: 'W0w9179yD8U', title: 'O Maahi - Dunki', artist: 'Arijit Singh, Pritam', cover: 'https://i.ytimg.com/vi/W0w9179yD8U/hqdefault.jpg', audioUrl: '/api/stream/W0w9179yD8U', duration: '3:53' },
  { _id: 'BddP6PYo2gs', title: 'Kesariya (Dance Mix)', artist: 'Arijit Singh, Pritam', cover: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', audioUrl: '/api/stream/BddP6PYo2gs', duration: '3:15' },
  { _id: 'H5v3kku4y6Q', title: 'As It Was', artist: 'Harry Styles', cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg', audioUrl: '/api/stream/H5v3kku4y6Q', duration: '2:47' },
  { _id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', cover: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg', audioUrl: '/api/stream/kJQP7kiw5Fk', duration: '3:47' },
];

export function MusicProvider({ children }) {
  const [songs, setSongs] = useState(DEFAULT_HITS);
  const [currentSong, setCurrentSong] = useState(DEFAULT_HITS[0]);
  const [playlist, setPlaylist] = useState(DEFAULT_HITS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
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

  // On mount, load fresh search hits if available
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await fetch('/api/search?q=bollywood%20hits');
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          setSongs(data.results);
          setPlaylist(data.results);
        }
      } catch (e) {
        console.error('Default fetch failed:', e);
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
    const name = customData?.name || 'Shubham';
    const email = customData?.email || 'user@gmail.com';
    const avatar = customData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    
    const newUser = { name, email, avatar, loggedInAt: new Date().toISOString() };
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <MusicContext.Provider value={{
      songs, currentSong, isPlaying, playlist, loading,
      shuffle, setShuffle, repeatMode, setRepeatMode,
      favorites, toggleFavorite, togglePlay, nextSong, prevSong, playSong,
      user, loginWithGoogle, logout,
      isAuthModalOpen, setIsAuthModalOpen,
    }}>
      {children}
    </MusicContext.Provider>
  );
}
