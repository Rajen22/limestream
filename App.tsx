
import React, { useState, useEffect } from 'react';
import { Movie } from './types';
import { getRecentMovies, searchMovies, getMovieRecommendations } from './services/geminiService';
import MovieRail from './components/MovieRail';
import VideoPlayer from './components/VideoPlayer';
import { initializeAdBlocker } from './services/adBlocker';
import { initializeSecurityFirewall, getSecurityStatus } from './services/securityEngine';

const App: React.FC = () => {
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [securityInfo, setSecurityInfo] = useState(getSecurityStatus());

  useEffect(() => {
    // Initialize Defense Systems
    initializeAdBlocker();
    initializeSecurityFirewall();

    const initApp = async () => {
      try {
        const recent = await getRecentMovies();
        setRecentMovies(recent);
        
        if (recent.length > 0) {
          setHeroMovie(recent[0]);
          const recs = await getMovieRecommendations(recent[0].title);
          setRecommendations(recs);
        } else {
          const genericRecs = await getMovieRecommendations("Trending 2025 movies");
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

    const interval = setInterval(() => setSecurityInfo(getSecurityStatus()), 5000);
    return () => clearInterval(interval);
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
        <div className="w-24 h-24 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-8 text-lime-500 font-bold text-2xl animate-pulse tracking-widest uppercase italic">LIME<span className="text-white">STREAM</span> TV</p>
        <p className="mt-2 text-gray-500 tracking-[0.4em] text-[10px] uppercase">Firewall Initializing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Search Overlay */}
      {searchResults.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <span className="text-lime-500 font-black tracking-widest text-xs uppercase">Encrypted Search</span>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Results for: {searchQuery}</h2>
            </div>
            <button 
              onClick={() => { setSearchResults([]); setSearchQuery(''); }}
              className="p-4 bg-white/10 hover:bg-red-600 rounded-full transition-all group"
            >
              <svg className="w-10 h-10 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {searchResults.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => handlePlay(movie)}
                className="aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer group hover:ring-4 hover:ring-lime-500 transition-all shadow-2xl"
              >
                <img src={movie.posterUrl} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6 transition-opacity">
                  <p className="font-black text-xl uppercase italic tracking-tighter leading-tight mb-2">{movie.title}</p>
                  <p className="text-[10px] text-lime-500 font-black tracking-widest uppercase">{movie.is4K ? '4K ULTRA HD' : 'HD'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/20 to-transparent p-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="text-4xl font-black text-lime-500 tracking-tighter italic select-none">LIME<span className="text-white">STREAM</span></div>
        </div>

        {/* Top-Middle Search Bar */}
        <form onSubmit={handleSearch} className="absolute left-1/2 -translate-x-1/2 flex items-center group">
          <div className="relative flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-8 py-3 transition-all focus-within:ring-2 focus-within:ring-lime-500/50 focus-within:bg-black/90 w-[500px] shadow-2xl">
            <input 
              type="text" 
              placeholder="Search movies on limemovies.org..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-base font-medium placeholder:text-gray-500"
            />
            <button type="submit" className="ml-4 text-lime-500 hover:scale-125 transition-transform disabled:opacity-50" disabled={isSearching}>
              {isSearching ? (
                <div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-8">
          {/* LimeGuard Firewall Indicator */}
          <div className="hidden xl:flex flex-col items-end">
            <div className="flex items-center gap-3 bg-black/80 px-4 py-1.5 rounded-full border border-lime-500/30">
              <div className="w-2 h-2 bg-lime-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">LimeGuard Firewall Active</span>
            </div>
            <span className="text-[8px] text-gray-500 font-bold mr-4 mt-1 uppercase tracking-widest">{securityInfo.encryption} Encrypted</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-500 to-lime-700 flex items-center justify-center font-black text-black text-xl shadow-lg ring-4 ring-lime-500/20 hover:scale-110 transition-transform cursor-pointer">L</div>
        </div>
      </nav>

      <div className="relative h-[98vh] w-full">
        <div className="absolute inset-0">
          <img src={heroMovie.backdropUrl} alt={heroMovie.title} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24">
          <div className="max-w-5xl space-y-8">
            <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 bg-lime-500 text-black text-xs font-black rounded-sm uppercase tracking-[0.3em]">Direct Backend Link</span>
               <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">CRAWLING: LIMEMOVIES.ORG</span>
            </div>
            <h1 className="text-9xl md:text-[11rem] font-black leading-[0.8] uppercase tracking-tighter italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">{heroMovie.title}</h1>
            <div className="flex items-center gap-8 text-2xl font-bold">
              <div className="flex items-center gap-2">
                <span className="text-lime-500">★</span>
                <span className="text-white">9.4/10</span>
              </div>
              <span className="text-white/20">|</span>
              <span>{heroMovie.year}</span>
              <span className="px-4 py-1 border-2 border-white/10 rounded text-sm uppercase font-black">{heroMovie.rating}</span>
              <span>{heroMovie.duration}</span>
              <span className="text-sm bg-white/10 text-lime-500 px-4 py-1.5 rounded-sm font-black tracking-widest border border-lime-500/20">4K ULTRA HD</span>
            </div>
            <p className="text-2xl text-gray-300 leading-relaxed line-clamp-3 max-w-4xl font-medium drop-shadow-xl opacity-90 italic">
              {heroMovie.description}
            </p>
            <div className="flex items-center gap-8 pt-12">
              <button 
                onClick={() => handlePlay(heroMovie)} 
                className="group flex items-center gap-6 px-16 py-7 bg-white text-black rounded-sm font-black text-3xl hover:bg-lime-500 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(132,204,22,0.3)]"
              >
                <svg className="w-10 h-10 group-hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                PLAY 4K STREAM
              </button>
              <button className="px-12 py-7 border-4 border-white/5 text-white font-black text-3xl hover:bg-white hover:text-black transition-all rounded-sm backdrop-blur-3xl">
                + MY LIST
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-40 space-y-24 pb-48">
        <MovieRail title="Recently Added on LimeMovies" movies={recentMovies} onSelect={handlePlay} />
        <MovieRail title="Recommended for You" movies={recommendations} onSelect={handlePlay} />
        <MovieRail title="4K Ultra HD Blockbusters" movies={recentMovies.slice().reverse()} onSelect={handlePlay} />
      </div>

      <footer className="p-32 border-t border-white/5 bg-black/90 text-gray-600 text-center">
        <div className="text-6xl font-black text-lime-500 italic mb-10 tracking-tighter">LIME<span className="text-white/10">STREAM</span></div>
        <p className="text-xl max-w-3xl mx-auto mb-16 font-medium leading-relaxed italic">The most secure, ad-free streaming environment ever built for Smart TVs. Verified encryption and LimeGuard active.</p>
        <div className="flex justify-center gap-16 text-xs font-black uppercase tracking-[0.4em]">
           <a href="#" className="hover:text-lime-500 transition-colors">Documentation</a>
           <a href="#" className="hover:text-lime-500 transition-colors">API Keys</a>
           <a href="#" className="hover:text-lime-500 transition-colors">Project Source</a>
        </div>
      </footer>

      {playingMovie && <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />}
    </div>
  );
};

export default App;
