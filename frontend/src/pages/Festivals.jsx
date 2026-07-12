import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Calendar, MapPin, Search, Sparkles, 
  ArrowRight, Star, 
  X, Clock, Heart, Share2, Compass, Landmark,
  Music, Info, CheckCircle2
} from 'lucide-react';

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedFestival, setSelectedFestival] = useState(null);

  const categories = ['All', 'Spiritual', 'Cultural', 'Historical', 'Music & Culture', 'Heritage & Art'];
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const regions = ['All', 'Mumbai', 'Pune', 'Konkan', 'Marathwada', 'Vidarbha', 'Statewide'];

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/public/festivals')
      .then(res => {
        setFestivals(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching festivals:", err);
        setLoading(false);
      });
  }, []);

  const filteredFestivals = useMemo(() => {
    return festivals.filter(fest => {
      const matchesSearch = fest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            fest.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || fest.category === selectedCategory;
      const matchesMonth = selectedMonth === 'All' || fest.dateInfo.includes(selectedMonth);
      const matchesRegion = selectedRegion === 'All' || fest.region.includes(selectedRegion);
      const matchesTab = activeTab === 'All' || (activeTab === 'Iconic' && fest.iconic);
      
      return matchesSearch && matchesCategory && matchesMonth && matchesRegion && matchesTab;
    });
  }, [festivals, searchTerm, selectedCategory, selectedMonth, selectedRegion, activeTab]);

  const upcomingFestivals = useMemo(() => {
      return [...festivals]
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 4);
  }, [festivals]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 animate-pulse">
      <div className="h-80 bg-gray-200"></div>
      <div className="p-10 space-y-6">
        <div className="h-8 bg-gray-200 rounded-full w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-full w-full"></div>
        <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Festival Detail Modal */}
      {selectedFestival && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedFestival(null)}></div>
          <div className="bg-white w-full max-w-5xl rounded-[4rem] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in duration-500 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedFestival(null)}
              className="absolute top-8 right-8 bg-white/20 backdrop-blur-md text-emerald-950 p-4 rounded-full hover:bg-emerald-600 hover:text-white transition-all z-20"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-[400px] lg:h-full min-h-[500px]">
                <img src={selectedFestival.imageUrl} alt={selectedFestival.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12">
                   <span className="bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
                     {selectedFestival.category}
                   </span>
                   <h2 className="text-5xl font-black text-white tracking-tighter">{selectedFestival.name}</h2>
                </div>
              </div>
              
              <div className="p-12 lg:p-20">
                <div className="flex flex-wrap gap-6 mb-12">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-emerald-600 mr-3" />
                    <span className="text-lg font-bold text-emerald-950">{selectedFestival.dateInfo}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
                    <span className="text-lg font-bold text-emerald-950">{selectedFestival.location}</span>
                  </div>
                </div>
                
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] mb-6">The Tradition</h3>
                <p className="text-xl text-gray-600 leading-relaxed mb-12 font-medium">
                  {selectedFestival.description}
                </p>
                
                <div className="space-y-6">
                  <Link 
                    to={`/ai-itinerary?seed=${selectedFestival.name}`}
                    className="flex items-center justify-center w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 group"
                  >
                    Experience This Tradition <Compass className="ml-4 w-6 h-6 group-hover:rotate-45 transition" />
                  </Link>
                  <button 
                    onClick={() => setSelectedFestival(null)}
                    className="flex items-center justify-center w-full bg-gray-50 text-gray-500 py-6 rounded-2xl font-bold hover:bg-gray-100 transition"
                  >
                    Back to Festivals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Hero Section */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/1200x/b6/69/98/b66998a21705a183145be7deda0a0d75.jpg" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom" 
            alt="Festivals Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <span className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.5em] mb-8 shadow-2xl animate-pulse">
            Vibrant Traditions
          </span>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none">
            Festivals & <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Cultural Events.</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the heartbeat of Maharashtra through its grand celebrations, timeless rituals, and artistic expressions.
          </p>
        </div>
      </section>

      {/* Advanced Discovery & Filter Section */}
      <section className="py-20 px-6 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Search & Discovery Bar */}
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100 mb-12">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 w-7 h-7" />
                <input 
                  type="text" 
                  placeholder="Search festivals by name or spirit..." 
                  className="w-full pl-16 pr-6 py-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-emerald-500 transition text-xl font-bold text-gray-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <div className="flex bg-gray-100 p-2 rounded-[2rem] shadow-inner">
                  <button 
                    onClick={() => setActiveTab('All')}
                    className={`px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${
                      activeTab === 'All' ? 'bg-white text-emerald-600 shadow-lg' : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    All Events
                  </button>
                  <button 
                    onClick={() => setActiveTab('Iconic')}
                    className={`px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${
                      activeTab === 'Iconic' ? 'bg-white text-emerald-600 shadow-lg' : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Iconic
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Multi-Select Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-100">
                <div className="space-y-3">
                  <label className="flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest px-2">
                    <Sparkles className="w-4 h-4 mr-2" /> By Interest
                  </label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest px-2">
                    <Calendar className="w-4 h-4 mr-2" /> By Timeline
                  </label>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 appearance-none"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest px-2">
                    <MapPin className="w-4 h-4 mr-2" /> By Region
                  </label>
                  <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 appearance-none"
                  >
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured "Celebrations Around the Corner" Section */}
      {!searchTerm && selectedCategory === 'All' && selectedMonth === 'All' && upcomingFestivals.length > 0 && (
        <section className="py-20 bg-emerald-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Timeless Traditions</h2>
                <h3 className="text-6xl font-black text-gray-900 tracking-tighter">Celebrations Around <br/> the Corner</h3>
              </div>
              <div className="flex space-x-3">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center">
                    <Clock className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="font-bold text-emerald-950">Next Event: {upcomingFestivals[0]?.name}</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {upcomingFestivals.map((fest, idx) => (
                <div key={idx} className="group bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="relative h-64 overflow-hidden">
                    <img src={fest.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={fest.name} />
                    <div className="absolute top-6 left-6">
                      <span className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                        {fest.dateInfo.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-emerald-600 transition tracking-tighter leading-tight">
                      {fest.name}
                    </h4>
                    <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                      <MapPin className="w-3 h-3 mr-1 text-emerald-600" /> {fest.region}
                    </div>
                    <button 
                      onClick={() => setSelectedFestival(fest)}
                      className="w-full bg-gray-50 hover:bg-emerald-600 group/btn py-4 rounded-2xl flex items-center justify-center transition-all"
                    >
                       <span className="font-black text-sm group-hover/btn:text-white transition-colors">Details</span>
                       <ArrowRight className="w-4 h-4 ml-2 text-emerald-600 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Exploration Grid */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">
              {filteredFestivals.length} <span className="text-emerald-600">Soulful Experiences</span>
            </h3>
            {(searchTerm || selectedCategory !== 'All' || selectedMonth !== 'All' || selectedRegion !== 'All') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedMonth('All');
                  setSelectedRegion('All');
                }}
                className="flex items-center text-emerald-600 font-black hover:underline"
              >
                <X className="w-5 h-5 mr-2" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
            ) : filteredFestivals.length > 0 ? (
              filteredFestivals.map((fest, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white rounded-[3.5rem] overflow-hidden shadow-2xl hover:shadow-[0_50px_100px_-20px_rgba(5,150,105,0.15)] transition-all duration-700 border-2 border-transparent hover:border-emerald-50"
                >
                  <div className="relative h-[450px] overflow-hidden" onClick={() => setSelectedFestival(fest)}>
                    <img 
                      src={fest.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out cursor-pointer" 
                      alt={fest.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-10 left-10 flex flex-col gap-3">
                      <span className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl text-emerald-950 font-black text-xs uppercase tracking-widest shadow-xl flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-600" /> {fest.dateInfo}
                      </span>
                      {fest.iconic && (
                        <span className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center">
                          <Star className="w-4 h-4 mr-2 fill-white" /> Iconic
                        </span>
                      )}
                    </div>

                    <div className="absolute top-10 right-10 flex flex-col gap-4 opacity-0 translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white hover:bg-emerald-600 transition shadow-xl">
                            <Heart className="w-6 h-6" />
                        </button>
                        <button className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white hover:bg-emerald-600 transition shadow-xl">
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 p-12 w-full pointer-events-none">
                      <div className="flex items-center text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-6">
                         <span className="bg-emerald-400/20 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-400/30">
                            {fest.category}
                         </span>
                      </div>
                      <h4 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                        {fest.name}
                      </h4>
                      <div className="flex items-center text-gray-300 text-lg font-medium mb-8">
                        <MapPin className="w-5 h-5 mr-3 text-emerald-500" /> {fest.location}
                      </div>
                      <div className="w-16 h-1.5 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-700"></div>
                    </div>
                  </div>

                  <div className="p-12">
                    <p className="text-gray-500 text-xl leading-relaxed mb-10 line-clamp-3 font-medium italic">
                      "{fest.description}"
                    </p>
                    <div className="flex items-center justify-between pt-10 border-t border-gray-100">
                      <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm">
                          +1k
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFestival(fest)}
                        className="flex items-center text-xl font-black text-emerald-600 group/link"
                      >
                        Discover More <ArrowRight className="ml-4 w-7 h-7 group-hover/link:translate-x-2 transition" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                <div className="bg-emerald-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                  <Search className="w-12 h-12 text-emerald-600 opacity-30" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">Silence in the Spirit</h3>
                <p className="text-gray-500 text-xl max-w-lg mx-auto leading-relaxed">We couldn't find any festivals matching your current search. Try exploring another region or interest.</p>
                <button 
                   onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                   className="mt-12 bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-200"
                >
                   See All Traditions
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cultural Mosaic Fact Grid */}
      <section className="py-40 bg-emerald-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/10 blur-[200px] rounded-full -mr-96 -mt-96"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div>
              <h2 className="text-sm font-black text-emerald-400 uppercase tracking-[0.6em] mb-8">Heritage Unveiled</h2>
              <h3 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mb-12">
                A Tapestry of <br/> <span className="italic text-emerald-500">Divine</span> Stories.
              </h3>
              <p className="text-2xl text-emerald-100/70 leading-relaxed mb-16">
                Maharashtra's festivals are more than just events; they are visceral experiences that weave together history, faith, and the unyielding spirit of its people.
              </p>
              <div className="grid grid-cols-2 gap-10">
                <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
                   <Landmark className="w-10 h-10 text-emerald-400 mb-6" />
                   <h5 className="text-3xl font-black text-white mb-2">350+</h5>
                   <p className="text-emerald-100/50 font-bold uppercase tracking-widest text-[10px]">Historic Forts</p>
                </div>
                <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
                   <Music className="w-10 h-10 text-emerald-400 mb-6" />
                   <h5 className="text-3xl font-black text-white mb-2">1000+</h5>
                   <p className="text-emerald-100/50 font-bold uppercase tracking-widest text-[10px]">Folk Art Forms</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] rounded-full"></div>
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl rotate-3 group hover:rotate-0 transition-all duration-700">
                <img 
                   src="https://maharashtratourism.gov.in/wp-content/uploads/2024/11/Pandharpur-Vithoba-Temple.jpg" 
                   className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" 
                   alt="Culture" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12">
                   <span className="text-emerald-400 font-black text-xs uppercase tracking-widest block mb-2">Iconic Landmark</span>
                   <h6 className="text-3xl font-black text-white">Pandharpur Vitthal</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Plan Your Cultural Odyssey" CTA */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-mesh-emerald rounded-[5rem] p-20 md:p-32 flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
            <div className="relative z-10 lg:max-w-2xl mb-12 lg:mb-0">
              <h3 className="text-6xl md:text-8xl font-black text-gray-900 mb-10 leading-none tracking-tighter">
                Craft Your <br/> <span className="text-emerald-600 italic">Festive</span> Odyssey.
              </h3>
              <p className="text-2xl text-gray-600 font-medium leading-relaxed mb-12">
                Don't just watch history. Be part of it. Let our AI artisan design an itinerary that syncs perfectly with Maharashtra's grandest celebrations.
              </p>
              <Link 
                to="/ai-itinerary"
                className="inline-flex items-center bg-emerald-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 group/btn"
              >
                Plan My Experience <Compass className="ml-4 w-8 h-8 group-hover/btn:rotate-45 transition" />
              </Link>
            </div>
            <div className="relative z-10 w-full lg:w-96 h-96 rounded-[4rem] overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1598434192043-71111c1b3f41?auto=format&fit=crop&w=800" 
                className="w-full h-full object-cover" 
                alt="Festivals" 
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center space-x-4 text-3xl font-black text-emerald-600 mb-8">
            <Landmark className="w-10 h-10" />
            <span>MAHATOURISM</span>
          </div>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">A Celebration of Maharashtra's Timeless Spirit</p>
        </div>
      </footer>
    </div>
  );
};

export default Festivals;

