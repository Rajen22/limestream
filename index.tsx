
import React, { useState, useEffect } from 'react';
import { Movie } from './types';
import { getRecentMovies, searchMovies, getMovieRecommendations } from './services/geminiService';
import MovieRail from './components/MovieRail';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const recent = await getRecentMovies();
        setRecentMovies(recent);
        
        if (recent.length > 0) {
          setHeroMovie(recent[0]);
          const recs = await getMovieRecommendations(recent[0].title);
          setRecommendations(recs);
        } else {
          // Fallback if search grounding returns nothing
          const genericRecs = await getMovieRecommendations("Top rated movies 2024");
          setRecommendations(genericRecs);
          if (genericRecs.length > 0) setHeroMovie(genericRecs[0]);
        }
      } catch (err) {
        console.error("Failed to load movie data", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlay = (movie: Movie) => {
    setPlayingMovie(movie);
  };

  if (loading || !heroMovie) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-6 text-lime-500 font-bold text-xl animate-pulse uppercase tracking-widest">LIME STREAM</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Search Overlay */}
      {searchResults.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/95 p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold">Search Results</h2>
            <button 
              onClick={() => { setSearchResults([]); setSearchQuery(''); }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {searchResults.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => handlePlay(movie)}
                className="aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-lime-500 transition-all"
              >
                <img src={movie.posterUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="font-bold text-center px-4">{movie.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-3xl font-black text-lime-500 tracking-tighter">LIME STREAM</div>
          <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-300">
            <button className="hover:text-white transition-colors">Movies</button>
            <button className="hover:text-white transition-colors">TV Shows</button>
            <button className="hover:text-white transition-colors">Trending</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded-full px-4 py-1 focus-within:bg-white/20 transition-all">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none px-2 py-1 text-sm w-40 focus:w-64 transition-all"
            />
            <button type="submit" className="p-1 text-gray-400 hover:text-white disabled:opacity-50" disabled={isSearching}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
          <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center font-bold text-black text-sm">L</div>
        </div>
      </nav>

      <div className="relative h-[85vh] w-full">
        <div className="absolute inset-0">
          <img src={heroMovie.backdropUrl} alt={heroMovie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-6xl md:text-8xl font-black leading-tight drop-shadow-lg">{heroMovie.title}</h1>
            <div className="flex items-center gap-4 text-lg font-semibold">
              <span className="text-lime-500">{heroMovie.rating}</span>
              <span className="text-gray-400">{heroMovie.year}</span>
              <span className="text-gray-400">{heroMovie.duration}</span>
              <span className="border border-white/20 px-2 py-0.5 text-xs rounded uppercase tracking-widest">{heroMovie.is4K ? '4K Ultra HD' : 'HD'}</span>
            </div>
            <p className="text-xl text-gray-200 leading-relaxed line-clamp-3">
              {heroMovie.description}
            </p>
            <div className="flex items-center gap-4 pt-6">
              <button 
                onClick={() => handlePlay(heroMovie)} 
                className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded-lg font-bold text-xl hover:bg-lime-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Watch Now
              </button>
              <button className="px-8 py-3 bg-white/20 text-white font-bold text-xl hover:bg-white/30 transition-colors rounded-lg backdrop-blur-sm">
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-20 space-y-12 pb-24">
        <MovieRail title="Recently Added" movies={recentMovies} onSelect={handlePlay} />
        <MovieRail title="Recommended for You" movies={recommendations} onSelect={handlePlay} />
        <MovieRail title="Trending Now" movies={recentMovies.slice().reverse()} onSelect={handlePlay} />
      </div>

      {playingMovie && <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />}
    </div>
  );
};

export default App;
