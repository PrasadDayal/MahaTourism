import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Calendar, Navigation, Info, Utensils, Hotel, Bus, Clock, ArrowLeft, Plane, Train, ExternalLink, Star, Sun, CloudRain, Thermometer, Sparkles, Wind, Waves, Camera, ShoppingBag, Landmark, Coffee, Heart, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BookingForm from '../components/BookingForm';

// Fix Leaflet's missing icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const CityDetail = () => {
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('things-to-do');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cityRes = await api.get(`/public/cities/${id}`);
        setCity(cityRes.data);
        
        const spotsRes = await api.get(`/public/spots/city/${id}`);
        setSpots(spotsRes.data);
      } catch (err) {
        console.error("Error fetching city data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!city) return <div className="text-center py-20">City not found</div>;

  const tabs = [
    { id: 'things-to-do', label: 'Things to Do', icon: Utensils },
    { id: 'how-to-reach', label: 'How to Reach', icon: Bus },
    { id: 'stay-info', label: 'Stay Info', icon: Hotel },
    { id: 'best-time', label: 'Best Time', icon: Calendar }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-24 right-6 z-[110] animate-in slide-in-from-right-full duration-500">
          <div className="bg-emerald-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center border border-emerald-500/30 backdrop-blur-md">
            <CheckCircle className="w-8 h-8 mr-4 text-emerald-100" />
            <div>
              <p className="font-black text-lg">Booking Confirmed!</p>
              <p className="text-emerald-100 text-sm font-medium">Your stay has been successfully reserved.</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedHotel && (
        <BookingForm 
          hotel={selectedHotel} 
          onClose={() => setSelectedHotel(null)} 
          onSuccess={() => {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
          }}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-[500px] w-full">
        <img 
          src={city.imageUrl || 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=2070'} 
          alt={city.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 md:p-20">
          <Link to="/destinations" className="text-white flex items-center mb-6 hover:text-emerald-300 transition w-fit">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Destinations
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">{city.name}</h1>
          <div className="flex items-center text-emerald-300 font-bold text-lg">
            <MapPin className="w-6 h-6 mr-2" /> Maharashtra, India
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: City Info */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Info className="w-8 h-8 mr-3 text-emerald-600" /> Overview
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
              {city.description}
            </p>
          </section>

          {/* Interactive Tabs Section */}
          <section className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            <div className="flex flex-wrap bg-gray-50 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-8 py-5 text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id 
                    ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-500 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 md:p-12">
              {activeTab === 'things-to-do' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Camera className="w-32 h-32 text-emerald-900" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl font-bold text-emerald-900 mb-6 flex items-center">
                        <Camera className="w-8 h-8 mr-4" /> Must-Try Experiences
                      </h3>
                      <p className="text-emerald-800 text-xl leading-relaxed font-medium">
                        {city.thingsToDo || 'From historical exploration to culinary delights, there is something for everyone.'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-8">
                        {['Sightseeing', 'Culture', 'Photography', 'Food Tour'].map(tag => (
                          <span key={tag} className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                        <Landmark className="w-6 h-6 mr-3 text-emerald-600" /> Historic & Cultural
                      </h4>
                      <div className="space-y-6">
                        {spots.slice(0, 3).map((spot, idx) => (
                          <Link 
                            to={`/spot/${spot.id}`} 
                            key={spot.id}
                            className="flex items-center group"
                          >
                            <div className="w-16 h-16 rounded-2xl overflow-hidden mr-5 shadow-md group-hover:scale-110 transition duration-500 shrink-0">
                              <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900 group-hover:text-emerald-600 transition">{spot.name}</h5>
                              <p className="text-gray-400 text-xs mt-1">Visit for {idx === 0 ? 'History' : idx === 1 ? 'Architecture' : 'Spirituality'}</p>
                            </div>
                            <ArrowLeft className="w-5 h-5 ml-auto rotate-180 text-gray-300 group-hover:text-emerald-600 transition" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                        <ShoppingBag className="w-6 h-6 mr-3 text-amber-500" /> Local Lifestyle
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start group hover:bg-amber-100 transition">
                          <Coffee className="w-6 h-6 mr-4 text-amber-600 mt-1" />
                          <div>
                            <h5 className="font-bold text-amber-900">Taste Local Flavors</h5>
                            <p className="text-amber-700/70 text-sm mt-1">Explore authentic street food and traditional delicacies unique to this region.</p>
                          </div>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start group hover:bg-blue-100 transition">
                          <ShoppingBag className="w-6 h-6 mr-4 text-blue-600 mt-1" />
                          <div>
                            <h5 className="font-bold text-blue-900">Souvenir Shopping</h5>
                            <p className="text-blue-700/70 text-sm mt-1">Pick up local handicrafts, textiles, and traditional artifacts from the bustling markets.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Heart className="w-6 h-6 mr-3 text-red-500" /> Nearby Hotspots
                      </h3>
                      <Link to="/destinations" className="text-emerald-600 text-sm font-bold hover:underline">View All</Link>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {spots.map(spot => (
                        <Link 
                          to={`/spot/${spot.id}`} 
                          key={spot.id} 
                          className="bg-white border border-gray-200 px-6 py-3 rounded-2xl text-sm font-bold text-gray-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all"
                        >
                          {spot.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'how-to-reach' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div 
                      className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center text-center hover:shadow-md transition group"
                    >
                      <div className="bg-blue-600 text-white p-3 rounded-2xl mb-4 group-hover:scale-110 transition">
                        <Plane className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-blue-900 mb-2 uppercase tracking-widest text-xs">By Air</h4>
                      {city.nearestAirport ? (
                        <>
                          <p className="text-blue-900 font-black text-sm mb-1 line-clamp-2 min-h-[2.5rem]">Nearest: {city.nearestAirport}</p>
                          <div className="bg-blue-600/10 px-3 py-1 rounded-full mb-4">
                            <p className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">{city.nearestAirportDist}</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/travel/flights?q=flights+to+${city.nearestAirport}`, '_blank');
                            }}
                            className="mt-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100 w-full"
                          >
                            Check Flights
                          </button>
                        </>
                      ) : (
                        <p className="text-blue-700 text-sm mb-2">Connecting via major airports</p>
                      )}
                      <span 
                        onClick={() => window.open(`https://www.google.com/maps/search/${city.nearestAirport || city.name + '+Airport'}`, '_blank')}
                        className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-4 cursor-pointer hover:text-blue-600 transition"
                      >
                        Locate on map
                      </span>
                    </div>

                    <div 
                      className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center hover:shadow-md transition group"
                    >
                      <div className="bg-emerald-600 text-white p-3 rounded-2xl mb-4 group-hover:scale-110 transition">
                        <Train className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-emerald-900 mb-2 uppercase tracking-widest text-xs">By Rail</h4>
                      {city.nearestRailwayStation ? (
                        <>
                          <p className="text-emerald-900 font-black text-sm mb-1 line-clamp-2 min-h-[2.5rem]">Station: {city.nearestRailwayStation}</p>
                          <div className="bg-emerald-600/10 px-3 py-1 rounded-full mb-4">
                            <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">{city.nearestRailwayStationDist}</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/search?q=trains+to+${city.nearestRailwayStation}`, '_blank');
                            }}
                            className="mt-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 w-full"
                          >
                            Check Trains
                          </button>
                        </>
                      ) : (
                        <p className="text-emerald-700 text-sm mb-2">Connected via major junctions</p>
                      )}
                      <span 
                        onClick={() => window.open(`https://www.google.com/maps/search/${city.nearestRailwayStation || city.name + '+Railway+Station'}`, '_blank')}
                        className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-4 cursor-pointer hover:text-emerald-600 transition"
                      >
                        Locate on map
                      </span>
                    </div>

                    <div 
                      className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex flex-col items-center text-center hover:shadow-md transition group"
                    >
                      <div className="bg-amber-600 text-white p-3 rounded-2xl mb-4 group-hover:scale-110 transition">
                        <Bus className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-amber-900 mb-2 uppercase tracking-widest text-xs">By Road</h4>
                      <p className="text-amber-900 font-black text-sm mb-1 line-clamp-2 min-h-[2.5rem]">{city.roadConnectivity || 'State Highway / NH'}</p>
                      <div className="bg-amber-600/10 px-3 py-1 rounded-full mb-4">
                        <p className="text-amber-700 text-[10px] font-bold uppercase tracking-wider">Well Connected</p>
                      </div>
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/search/${city.name}+Bus+Stand`, '_blank')}
                        className="mt-auto bg-amber-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-amber-700 transition shadow-lg shadow-amber-100 w-full"
                      >
                        View Bus Stands
                      </button>
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mt-4">Available via ST/Private</span>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Travel Guide</h3>
                    <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-8">
                      {city.howToReach || 'Accessible via train, bus, and flight from major cities.'}
                    </p>
                    
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${city.latitude},${city.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5 mr-3" /> Get Directions on Google Maps
                    </a>
                  </div>

                  <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl h-[400px]">
                    <MapContainer center={[city.latitude || 19.076, city.longitude || 72.877]} zoom={10} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <Marker position={[city.latitude || 19.076, city.longitude || 72.877]}>
                            <Popup>
                                <span className="font-bold">{city.name}</span>
                            </Popup>
                        </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}

              {activeTab === 'stay-info' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                  <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Hotel className="w-32 h-32 text-blue-900" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl font-bold text-blue-900 mb-6 flex items-center">
                        <Hotel className="w-8 h-8 mr-4" /> Accommodation Overview
                      </h3>
                      <p className="text-blue-800 text-xl leading-relaxed whitespace-pre-line font-medium">
                        {city.stayInfo || 'Options range from luxury hotels to budget-friendly guesthouses.'}
                      </p>
                    </div>
                  </div>

                  {city.hotels && city.hotels.length > 0 && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-4xl font-black text-gray-900 tracking-tight">Best Recommended Hotels</h3>
                        <div className="h-1 flex-grow mx-8 bg-gray-100 rounded-full hidden md:block"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {city.hotels.map(hotel => (
                          <div key={hotel.id} className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                            <div className="relative h-72 overflow-hidden">
                              <img 
                                src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} 
                                alt={hotel.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                              />
                              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center shadow-xl border border-white/20">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500 mr-2" />
                                <span className="font-black text-gray-900 text-lg">{hotel.rating?.toFixed(1) || '4.5'}</span>
                              </div>
                            </div>
                            
                            <div className="p-10 flex-grow flex flex-col">
                              <h4 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">{hotel.name}</h4>
                              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6 w-fit">
                                {hotel.priceRange || 'Contact for pricing'}
                              </div>
                              <p className="text-gray-500 text-lg leading-relaxed mb-8 line-clamp-3">
                                {hotel.description}
                              </p>
                              <div className="flex items-start text-gray-400 text-sm font-medium mt-auto bg-gray-50 p-4 rounded-2xl">
                                <MapPin className="w-5 h-5 mr-3 text-blue-500 shrink-0" /> 
                                {hotel.address}
                              </div>
                            </div>
                            
                            <div className="px-10 pb-10">
                              <button 
                                onClick={() => setSelectedHotel(hotel)}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition shadow-lg hover:shadow-blue-200"
                              >
                                Book Your Stay
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'best-time' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-10 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-20 -rotate-12 translate-x-8 -translate-y-8">
                      <Sun className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                          <Sparkles className="w-6 h-6 text-amber-200" />
                        </div>
                        <span className="font-bold tracking-widest uppercase text-xs text-amber-100">Recommended Window</span>
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        {city.bestTimeToVisit}
                      </h3>
                      <p className="text-amber-50 text-xl font-medium max-w-xl leading-relaxed">
                        During these months, {city.name} offers the most pleasant weather and vibrant landscapes for an unforgettable experience.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                          <Thermometer className="w-5 h-5 mr-3 text-orange-500" /> Weather Context
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl border border-orange-100/50">
                            <div className="flex items-center">
                              <Sun className="w-5 h-5 mr-3 text-orange-600" />
                              <span className="font-bold text-orange-900">Summer</span>
                            </div>
                            <span className="text-orange-700 text-xs font-bold uppercase">Mar - May</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                            <div className="flex items-center">
                              <CloudRain className="w-5 h-5 mr-3 text-blue-600" />
                              <span className="font-bold text-blue-900">Monsoon</span>
                            </div>
                            <span className="text-blue-700 text-xs font-bold uppercase">Jun - Sep</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                            <div className="flex items-center">
                              <Wind className="w-5 h-5 mr-3 text-emerald-600" />
                              <span className="font-bold text-emerald-900">Winter</span>
                            </div>
                            <span className="text-emerald-700 text-xs font-bold uppercase">Oct - Feb</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Info className="w-5 h-5 mr-3 text-blue-500" /> Seasonal Highlights
                      </h4>
                      <div className="space-y-6 flex-grow">
                        <div className="flex items-start">
                          <div className="bg-amber-100 p-2 rounded-xl mr-4 shrink-0">
                            <Waves className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-sm">Peak Visibility</h5>
                            <p className="text-gray-500 text-xs leading-relaxed">Clear skies and panoramic valley views are best during the winter months.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-emerald-100 p-2 rounded-xl mr-4 shrink-0">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-sm">Festive Vibe</h5>
                            <p className="text-gray-500 text-xs leading-relaxed">The city comes alive with local festivals and vibrant street life during {city.bestTimeToVisit.split(' ')[0]}.</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 p-4 bg-gray-50 rounded-2xl italic text-gray-400 text-xs text-center border border-dashed border-gray-200">
                        * Local weather may vary. Always check local forecasts before travel.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Navigation className="w-8 h-8 mr-3 text-emerald-600" /> Popular Spots in {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {spots.map(spot => (
                <Link to={`/spot/${spot.id}`} key={spot.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={spot.imageUrl || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800'} 
                      alt={spot.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-md uppercase tracking-wider">
                        {spot.category?.name || 'Tourist Spot'}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition mb-3">{spot.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">{spot.description}</p>
                    <div className="flex items-center text-emerald-600 font-bold hover:translate-x-2 transition duration-300">
                      Explore Detail <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Quick Stats/Map Placeholder */}
        <div className="space-y-8">
          <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Quick Facts</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <Clock className="w-6 h-6 mr-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-300 text-sm font-bold uppercase tracking-wider">Time Zone</p>
                  <p className="text-lg">IST (UTC +5:30)</p>
                </div>
              </div>
              <div className="flex items-start">
                <Navigation className="w-6 h-6 mr-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-300 text-sm font-bold uppercase tracking-wider">Coordinates</p>
                  <p className="text-lg">{city.latitude?.toFixed(4)}, {city.longitude?.toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 h-[400px]">
             {/* Simplified map or image */}
             <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-col p-8 text-center">
                <MapPin className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium text-gray-500">Map view for {city.name} available in main destinations explorer.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityDetail;
