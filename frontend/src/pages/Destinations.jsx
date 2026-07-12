import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import { 
  Search, MapPin, Calendar, Star, Navigation, ArrowRight, 
  SlidersHorizontal, X, Landmark, Palmtree, 
  Mountain, Compass, Globe
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's missing icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map center and bounds changes
function ChangeView({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [markers, map]);

  return null;
}

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [cities, setCities] = useState([]);
  const [spots, setSpots] = useState([]);
  const [, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState(categoryFilter ? 'spots' : 'cities');
  
  // Filter states
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating] = useState(0);
  const [sortByProximity, setSortByProximity] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    Promise.all([
      api.get('/public/cities').catch(() => ({ data: [] })),
      api.get('/public/spots').catch(() => ({ data: [] })),
      api.get('/public/categories').catch(() => ({ data: [] }))
    ]).then(([cityRes, spotRes, catRes]) => {
      setCities(cityRes.data);
      setSpots(spotRes.data);
      setCategories(catRes.data);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading destinations:", err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (categoryFilter) {
      setActiveTab('spots');
    }
  }, [categoryFilter]);

  // Extract unique districts from cities
  const districts = useMemo(() => {
    const d = ['All Districts', ...new Set(cities.map(c => c.district).filter(Boolean))];
    return d;
  }, [cities]);

  // Helper to calculate distance in KM
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredItems = useMemo(() => {
    let items = activeTab === 'cities' ? [...cities] : [...spots];
    
    // 1. Filter by District
    if (selectedDistrict !== 'All Districts') {
      items = items.filter(item => {
        const itemDistrict = activeTab === 'cities' ? item.district : item.city?.district;
        return itemDistrict === selectedDistrict;
      });
    }

    // 2. Filtering by Category/Search
    if (categoryFilter && activeTab === 'spots') {
      items = items.filter(spot => {
        const catName = (spot.category?.name || spot.category || '').toString().toLowerCase().trim();
        const filter = categoryFilter.toLowerCase().trim();
        return catName.includes(filter) || filter.includes(catName);
      });
    }

    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Apply Rating Filter
    if (minRating > 0) {
      items = items.filter(item => (item.rating || 4.8) >= minRating);
    }

    // 4. Apply Proximity Sorting
    if (sortByProximity && userLocation) {
      items.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return items;
  }, [cities, spots, searchTerm, categoryFilter, minRating, sortByProximity, userLocation, activeTab, selectedDistrict]);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    if (sortByProximity) {
      setSortByProximity(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setSortByProximity(true);
      },
      () => alert("Unable to retrieve your location")
    );
  };

  const handleSearch = () => {
    const portalEl = document.getElementById('discovery-portal');
    if (portalEl) {
      portalEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewOnMap = (item) => {
    setSelectedItem(item);
    const mapEl = document.getElementById('map-section');
    if (mapEl && window.innerWidth < 1024) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('beach')) return <Palmtree className="w-6 h-6" />;
    if (n.includes('hill') || n.includes('mountain')) return <Mountain className="w-6 h-6" />;
    if (n.includes('heritage') || n.includes('fort')) return <Landmark className="w-6 h-6" />;
    if (n.includes('spiritual') || n.includes('religious')) return <Globe className="w-6 h-6" />;
    return <Compass className="w-6 h-6" />;
  };

  const categoriesList = [
    { name: 'Beach' },
    { name: 'Heritage' },
    { name: 'Hills and Mountains' },
    { name: 'Romantic Places' },
    { name: 'Spiritual' },
    { name: 'Weekend Gateways' }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Immersive Hero Section */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1598434192043-71111c1b3f41?w=2000&auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom" 
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-white"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <span className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.5em] mb-8 shadow-2xl animate-pulse">
            Incredible Maharashtra
          </span>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none">
            Your Journey <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Begins Here.</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            From the roar of the Arabian Sea to the mist of the Sahyadris, discover destinations that stir the soul.
          </p>

          {/* Quick Search Bar */}
          <div className="bg-white p-4 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-4 items-center max-w-4xl mx-auto">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 w-6 h-6" />
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition text-lg font-bold text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition flex items-center justify-center w-full md:w-auto shadow-xl shadow-emerald-200"
            >
              Discover
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Hierarchy Navigation */}
      <section className="py-20 px-6 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-10">
            {/* 1. Category Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categoriesList.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('category', cat.name);
                    setSearchParams(newParams);
                    setActiveTab('spots');
                    handleSearch();
                  }}
                  className={`group p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col items-center text-center border-2 ${
                    categoryFilter === cat.name 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xl shadow-emerald-200 -translate-y-4' 
                      : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200 hover:-translate-y-2 shadow-xl hover:shadow-2xl'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-colors duration-500 ${
                    categoryFilter === cat.name ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                  }`}>
                    {getIcon(cat.name)}
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* 2. Interactive District Scroller */}
            <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                   <Globe className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                   <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2 px-4">Browse by District</p>
                   <div className="flex overflow-x-auto gap-3 no-scrollbar py-2">
                     {districts.map(district => (
                       <button
                         key={district}
                         onClick={() => {
                            setSelectedDistrict(district);
                            handleSearch();
                         }}
                         className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                           selectedDistrict === district 
                             ? 'bg-emerald-800 text-white shadow-lg' 
                             : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                         }`}
                       >
                         {district}
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section with Split Map View */}
      <section className="py-20 bg-gray-50" id="discovery-portal">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex-grow space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                  <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">
                    {selectedDistrict === 'All Districts' ? 'Spirit of Maharashtra' : `${selectedDistrict} District`}
                  </h2>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                    Discovery <span className="text-emerald-600">Portal.</span>
                  </h3>
                </div>
                <div className="flex bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                  <button 
                    onClick={() => setActiveTab('cities')}
                    className={`px-8 py-4 rounded-xl font-black text-sm transition-all duration-300 ${
                      activeTab === 'cities' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Popular Hubs
                  </button>
                  <button 
                    onClick={() => setActiveTab('spots')}
                    className={`px-8 py-4 rounded-xl font-black text-sm transition-all duration-300 ${
                      activeTab === 'spots' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Must Visit
                  </button>
                </div>
              </div>

              {/* Advanced Filter Bar */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition ${
                    showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-600 border border-gray-100 shadow-sm'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Refine Results</span>
                </button>
                <button 
                  onClick={handleNearMe}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition ${
                    sortByProximity ? 'bg-emerald-800 text-white' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  }`}
                >
                  <Navigation className="w-5 h-5" />
                  <span>{sortByProximity ? 'Sorted by Proximity' : 'Near Me'}</span>
                </button>
                {(categoryFilter || selectedDistrict !== 'All Districts') && (
                  <button 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('category');
                      setSearchParams(newParams);
                      setSelectedDistrict('All Districts');
                    }}
                    className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold border border-gray-200 hover:bg-gray-200"
                  >
                    <span className="text-xs uppercase tracking-widest">Clear Filters</span>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dynamic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[3rem] h-[500px] animate-pulse"></div>
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`group bg-white rounded-[3rem] overflow-hidden shadow-xl border-2 transition-all duration-500 ${
                        selectedItem?.id === item.id ? 'border-emerald-500 scale-[1.02]' : 'border-transparent hover:border-emerald-100'
                      }`}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                        />
                        <div className="absolute top-6 left-6 flex space-x-2">
                          <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-emerald-800 font-black text-[10px] shadow-lg flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" /> {item.rating || '4.8'}
                          </span>
                        </div>
                        <div className="absolute top-6 right-6">
                          <span className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                            {activeTab === 'cities' ? item.district : item.city?.district}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleViewOnMap(item)}
                          className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-xl"
                        >
                          <MapPin className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-10">
                        <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
                          {activeTab === 'cities' ? 'Tourism Hub' : item.city?.name}
                        </span>
                        <h4 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-emerald-600 transition tracking-tighter">
                          {item.name}
                        </h4>
                        <p className="text-gray-500 text-lg mb-8 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center text-gray-400 text-sm font-bold mb-8 space-x-6">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
                            {item.bestTimeToVisit || 'All Year'}
                          </div>
                          <div className="flex items-center">
                            <Landmark className="w-4 h-4 mr-2 text-emerald-600" />
                            {activeTab === 'cities' ? 'District Hub' : 'Top Spot'}
                          </div>
                        </div>

                        <Link 
                          to={activeTab === 'spots' ? `/spot/${item.id}` : `/city/${item.id}`}
                          className="flex items-center justify-between w-full bg-gray-50 hover:bg-emerald-600 group/btn px-8 py-5 rounded-2xl transition-all duration-300"
                        >
                          <span className="font-black text-gray-900 group-hover/btn:text-white transition-colors">Discover Spirit</span>
                          <ArrowRight className="w-6 h-6 text-emerald-600 group-hover/btn:text-white group-hover/btn:translate-x-2 transition-all" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Search className="w-12 h-12 text-emerald-600 opacity-20" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Region Not Mapped</h3>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">No destinations match this district or search in the current spirit. Try refining your filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Interactive Map Column */}
            <div className="lg:col-span-5" id="map-section">
              <div className="sticky top-32 bg-white p-4 rounded-[3rem] shadow-2xl border border-gray-100 h-[800px] overflow-hidden">
                <MapContainer 
                  center={[19.7515, 75.7139]} 
                  zoom={6} 
                  style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
                >
                  <ChangeView markers={filteredItems} />
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Satellite">
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Road Map">
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>
                  {filteredItems.map((item) => (
                    <Marker 
                      key={item.id} 
                      position={[item.latitude, item.longitude]}
                      eventHandlers={{
                        click: () => setSelectedItem(item),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-3 w-64">
                          <img src={item.imageUrl} className="w-full h-32 object-cover rounded-2xl mb-4 shadow-md" alt={item.name} />
                          <h5 className="font-black text-xl text-emerald-950 mb-2 tracking-tighter">{item.name}</h5>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">
                             {activeTab === 'cities' ? item.district : item.city?.district} District
                          </p>
                          <Link 
                            to={activeTab === 'spots' ? `/spot/${item.id}` : `/city/${item.id}`} 
                            className="inline-flex items-center text-emerald-600 font-black text-sm hover:translate-x-2 transition-transform"
                          >
                            Explore Region <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3 text-4xl font-black text-emerald-600">
              <Landmark className="w-12 h-12" />
              <span>MAHATOURISM</span>
            </div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Administrative Heart of Maharashtra Tourism</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Destinations;
