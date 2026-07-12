import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Image as ImageIcon, Camera, MapPin, 
  ArrowRight, Search, 
  Compass, Landmark, Heart, Star, X
} from 'lucide-react';

const Gallery = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // New Trip Builder State
  const [myTrip, setMyTrip] = useState([]);
  const [isTripOpen, setIsTripOpen] = useState(false);

  const toggleSpotInTrip = (spot) => {
    setMyTrip(prev => 
      prev.find(s => s.id === spot.id) 
        ? prev.filter(s => s.id !== spot.id)
        : [...prev, spot]
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/public/spots')
      .then(res => {
        setSpots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching gallery images:", err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(spots.map(spot => spot.category?.name).filter(Boolean))];
    return cats;
  }, [spots]);

  const filteredImages = useMemo(() => {
    return spots.filter(spot => {
      const matchesCategory = selectedCategory === 'All' || spot.category?.name === selectedCategory;
      const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            spot.city?.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [spots, selectedCategory, searchTerm]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 animate-pulse h-[450px]">
      <div className="h-full bg-gray-200"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Header */}
      <section className="bg-emerald-950 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full -mr-96 -mt-96"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <span className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.4em] mb-6">
                Visual Odyssey
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8">
                Maharashtra <br/> <span className="text-emerald-500">Unfiltered.</span>
              </h1>
              <p className="text-xl text-emerald-100/60 font-medium leading-relaxed">
                A curated collection of the most breathtaking sights, sacred shrines, and historic strongholds across the state.
              </p>
            </div>
            
            <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] items-center space-x-6">
               <div className="text-right">
                  <p className="text-white font-black text-3xl">{spots.length}</p>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Iconic Spots</p>
               </div>
               <div className="w-px h-12 bg-white/10"></div>
               <ImageIcon className="w-10 h-10 text-emerald-500 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Discovery & Filter Bar */}
      <section className="py-12 px-6 border-b border-gray-100 sticky top-16 bg-white/80 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Search */}
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 w-6 h-6" />
              <input 
                type="text" 
                placeholder="Search by spot or city..." 
                className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition text-lg font-bold text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2 w-full lg:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-white text-gray-500 border border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:columns-2 lg:columns-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10">
              {filteredImages.map((spot, idx) => {
                const isSelected = myTrip.find(s => s.id === spot.id);
                return (
                <div 
                  key={spot.id}
                  className="relative group break-inside-avoid rounded-[3rem] overflow-hidden bg-gray-100 shadow-xl hover:shadow-3xl transition-all duration-700"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <img 
                    src={spot.imageUrl} 
                    alt={spot.name}
                    className="w-full object-cover transition-all duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Glassmorphism Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-emerald-950 via-black/20 to-transparent transition-opacity duration-500 ${hoveredIndex === idx ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute top-8 right-8 flex gap-3">
                        <button 
                          onClick={() => toggleSpotInTrip(spot)}
                          className={`backdrop-blur-md p-4 rounded-2xl text-white transition shadow-xl ${isSelected ? 'bg-emerald-600' : 'bg-white/20 hover:bg-emerald-600'}`}>
                            <Heart className={`w-5 h-5 ${isSelected ? 'fill-white' : ''}`} />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 p-12 w-full transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
                      <div className="flex items-center text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                        <MapPin className="w-4 h-4 mr-2" /> {spot.city?.name}
                      </div>
                      <h3 className="text-4xl font-black text-white mb-6 leading-tight tracking-tighter">
                        {spot.name}
                      </h3>
                      <Link 
                        to={`/spot/${spot.id}`}
                        className="inline-flex items-center bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                      >
                        Experience <ArrowRight className="ml-3 w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="py-40 text-center bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
              <div className="bg-emerald-100 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                <Search className="w-12 h-12 text-emerald-600 opacity-30" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">Frame Not Found</h3>
              <p className="text-gray-500 text-xl max-w-lg mx-auto">We couldn't find any images matching your current filter. Try exploring another category.</p>
              <button 
                 onClick={() => setSelectedCategory('All')}
                 className="mt-12 bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition"
              >
                 Reset View
              </button>
            </div>
          )}
          </div>
          </section>

      {/* Floating Trip Builder */}
      {myTrip.length > 0 && (
        <div className="fixed bottom-10 right-10 z-[100]">
            <button 
                onClick={() => setIsTripOpen(!isTripOpen)}
                className="bg-emerald-600 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 hover:scale-105 transition"
            >
                <Compass className="w-8 h-8" />
                <span className="font-black text-lg">My Trip ({myTrip.length})</span>
            </button>
            
            {isTripOpen && (
                <div className="absolute bottom-24 right-0 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in slide-in-from-bottom-10">
                    <h4 className="font-black text-xl">Plan Your Journey</h4>
                    {myTrip.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                            <span className="font-bold">{s.name}</span>
                            <button onClick={() => toggleSpotInTrip(s)}><X className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                        </div>
                    ))}
                    <Link to="/ai-itinerary" className="block text-center bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600">
                        Generate Itinerary
                    </Link>
                </div>
            )}
        </div>
      )}

      {/* Contribution CTA */}
      <section className="py-40 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[5rem] p-20 md:p-32 shadow-2xl flex flex-col lg:flex-row items-center justify-between border border-gray-100 gap-20">
            <div className="lg:max-w-2xl">
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.5em] mb-8">Share Your Spirit</h2>
              <h3 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-12">
                Captured a <br/> <span className="text-emerald-500 italic">Moment?</span>
              </h3>
              <p className="text-2xl text-gray-500 font-medium leading-relaxed mb-16">
                Maharashtra is best seen through the eyes of its travelers. Join our community and showcase your journey to the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/ai-itinerary" className="bg-gray-100 text-gray-700 px-12 py-6 rounded-2xl font-black text-xl hover:bg-gray-200 transition flex items-center justify-center">
                   Plan Visit <ArrowRight className="ml-4 w-8 h-8" />
                </Link>
              </div>
            </div>
            <div className="relative">
                <div className="w-[400px] h-[550px] rounded-[4rem] overflow-hidden rotate-3 shadow-2xl transform hover:rotate-0 transition-all duration-700">
                    <img 
                      src="https://images.unsplash.com/photo-1623492701902-47dc207df5dc?auto=format&fit=crop&w=800" 
                      className="w-full h-full object-cover" 
                      alt="Captured Moment"
                    />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-emerald-600 text-white p-10 rounded-[3rem] shadow-2xl border-8 border-white">
                    <Star className="w-12 h-12 fill-white mb-4" />
                    <p className="font-black text-2xl">Traveler's <br/> Choice</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3 text-4xl font-black text-emerald-600">
              <Landmark className="w-12 h-12" />
              <span>MAHATOURISM</span>
            </div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Visualizing the Grandeur of Maharashtra</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Gallery;