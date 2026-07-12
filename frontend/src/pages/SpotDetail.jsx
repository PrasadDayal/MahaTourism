import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Clock, Info, History, Sparkles, Calendar, ArrowLeft, Hotel as HotelIcon, Camera, CloudSun, Ticket, Star, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
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

const SpotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [otherSpots, setOtherSpots] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/public/spots/${id}`)
      .then(res => {
        setSpot(res.data);
        setActiveImage(res.data.imageUrl);
        
        // Fetch nearby hotels
        if (res.data.city?.id) {
          api.get(`/public/hotels/city/${res.data.city.id}`)
            .then(hotelRes => setNearbyHotels(hotelRes.data.slice(0, 3)))
            .catch(err => console.error("Error fetching hotels:", err));
            
          api.get(`/public/spots/city/${res.data.city.id}`)
            .then(spotRes => setOtherSpots(spotRes.data.filter(s => s.id !== parseInt(id)).slice(0, 3)))
            .catch(err => console.error("Error fetching other spots:", err));

          // Fetch Weather (Open-Meteo)
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${res.data.latitude || 19.076}&longitude=${res.data.longitude || 72.877}&current_weather=true`)
            .then(wRes => wRes.json())
            .then(wData => setWeather(wRes => wData.current_weather))
            .catch(err => console.error("Error fetching weather:", err));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching spot data:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!spot) return <div className="text-center py-20">Spot not found</div>;

  const gallery = spot.imageGallery && spot.imageGallery.length > 0 
    ? [spot.imageUrl, ...spot.imageGallery] 
    : [spot.imageUrl];

  const handleBookHotel = (hotel) => {
    setSelectedHotel(hotel);
    setShowBookingForm(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {showBookingForm && selectedHotel && (
        <BookingForm 
          hotel={selectedHotel} 
          onClose={() => setShowBookingForm(false)} 
          onSuccess={() => alert('Booking successful!')}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-[600px] w-full">
        <img 
          src={activeImage || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=2070'} 
          alt={spot.name} 
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20">
          <button onClick={() => navigate(-1)} className="text-white flex items-center mb-6 hover:text-emerald-300 transition w-fit font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              {spot.category?.name}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold border border-white/30">
              {spot.city?.name}
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl tracking-tighter">{spot.name}</h1>
          <div className="flex items-center text-emerald-300 font-bold text-xl">
            <MapPin className="w-6 h-6 mr-2" /> {spot.city?.name}, Maharashtra
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-xl border border-gray-100">
              {/* Image Gallery */}
              {gallery.length > 1 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center uppercase tracking-widest">
                    <Camera className="w-8 h-8 mr-4 text-emerald-600" /> Immersive Gallery
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {gallery.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${spot.name} ${idx}`} 
                        className={`h-32 w-48 shrink-0 object-cover rounded-[2rem] cursor-pointer transition-all duration-300 border-4 shadow-md ${activeImage === img ? 'border-emerald-600 scale-105 shadow-emerald-100' : 'border-transparent hover:border-emerald-100'}`}
                        onClick={() => setActiveImage(img)}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-16">
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center uppercase tracking-tight">
                  <Info className="w-8 h-8 mr-4 text-emerald-600" /> Destination Overview
                </h2>
                <p className="text-gray-600 text-xl leading-relaxed whitespace-pre-line font-medium">
                  {spot.description}
                </p>
              </section>

              {spot.history && (
                <section className="mb-16 bg-gray-50 p-12 rounded-[3rem] border border-gray-100">
                  <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center uppercase tracking-tight">
                    <History className="w-8 h-8 mr-4 text-emerald-600" /> Heritage & Chronicles
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line font-medium italic">
                    "{spot.history}"
                  </p>
                </section>
              )}

              {/* Enhanced Experience & Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm">
                  <h3 className="text-xl font-black text-emerald-900 mb-4 flex items-center uppercase tracking-tight">
                    <Sparkles className="w-6 h-6 mr-3" /> Must-Try Experiences
                  </h3>
                  <ul className="text-emerald-900 font-bold space-y-2 list-disc list-inside">
                    {(spot.activities ? spot.activities.split(',') : ['Explore the area', 'Enjoy local scenery', 'Take photographs']).map((activity, index) => (
                      <li key={index}>{activity.trim()}</li>
                    ))}
                  </ul>
                </section>

                <section className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
                  <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center uppercase tracking-tight">
                    <Info className="w-6 h-6 mr-3" /> Getting There
                  </h3>
                  <p className="text-blue-900 leading-relaxed whitespace-pre-line font-bold">
                    {spot.transportInfo || 'Easily accessible via local public transport or taxi.'}
                  </p>
                </section>

                <section className="bg-purple-50 p-8 rounded-[2.5rem] border border-purple-100 shadow-sm">
                  <h3 className="text-xl font-black text-purple-900 mb-4 flex items-center uppercase tracking-tight">
                    <Info className="w-6 h-6 mr-3" /> Accessibility
                  </h3>
                  <p className="text-purple-900 leading-relaxed whitespace-pre-line font-bold">
                    {spot.accessibilityInfo || 'General accessibility available.'}
                  </p>
                </section>

                <section className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm">
                  <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center uppercase tracking-tight">
                    <Star className="w-6 h-6 mr-3" /> Expert Tips
                  </h3>
                  <p className="text-amber-900 leading-relaxed whitespace-pre-line font-bold">
                    {spot.tips || 'Wear comfortable shoes and carry water.'}
                  </p>
                </section>
              </div>

              {/* Nearby Hotels */}
              {nearbyHotels.length > 0 && (
                <section className="mt-20">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center uppercase tracking-tight">
                      <HotelIcon className="w-10 h-10 mr-4 text-emerald-600" /> Premium Stays Nearby
                    </h2>
                    <Link to={`/hotels?cityId=${spot.city?.id}`} className="text-emerald-600 font-black text-sm uppercase tracking-widest hover:underline flex items-center">
                        All Hotels <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {nearbyHotels.map(hotel => (
                      <div key={hotel.id} className="group bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                        <div className="relative h-40 overflow-hidden">
                            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl flex items-center text-xs font-black text-amber-500 shadow-lg">
                                <Star className="w-3 h-3 fill-current mr-1" /> {hotel.rating}
                            </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-black text-gray-900 text-lg truncate mb-1">{hotel.name}</h4>
                          <p className="text-emerald-600 font-black text-sm mb-4">{hotel.priceRange}</p>
                          <button 
                            onClick={() => handleBookHotel(hotel)}
                            className="w-full bg-white border-2 border-emerald-600 text-emerald-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-50"
                          >
                            Reserve Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Other Spots */}
              {otherSpots.length > 0 && (
                <section className="mt-20 pt-20 border-t border-gray-100">
                  <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center uppercase tracking-tight">
                    <MapPin className="w-10 h-10 mr-4 text-emerald-600" /> More to Explore in {spot.city?.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {otherSpots.map(s => (
                      <Link key={s.id} to={`/spot/${s.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden border-2 border-gray-50 hover:border-emerald-100 hover:shadow-2xl transition-all duration-500 block">
                        <div className="relative h-44 overflow-hidden">
                            <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <div className="absolute top-4 left-4 bg-emerald-600 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {s.category?.name}
                            </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-black text-gray-900 text-lg truncate group-hover:text-emerald-600 transition">{s.name}</h4>
                          <div className="flex items-center mt-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" /> {s.rating || '4.5'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 sticky top-10">
              <h3 className="text-2xl font-black text-gray-900 mb-10 uppercase tracking-widest">Travel Essentials</h3>
              
              {/* Weather Widget */}
              {weather && (
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] p-8 mb-10 flex items-center justify-between shadow-xl shadow-emerald-100 text-white border border-white/20">
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Live Weather</p>
                    <p className="text-5xl font-black">{Math.round(weather.temperature)}°</p>
                    <p className="text-xs font-bold mt-1 text-emerald-100">Feels like perfect</p>
                  </div>
                  <CloudSun className="w-16 h-16 text-white animate-pulse" />
                </div>
              )}

              <div className="space-y-10">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-4 rounded-2xl mr-6 shadow-inner">
                    <Clock className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Visiting Hours</p>
                    <p className="text-xl font-black text-gray-800 leading-tight">{spot.openHours || 'Sunrise to Sunset'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-4 rounded-2xl mr-6 shadow-inner">
                    <Calendar className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Prime Season</p>
                    <p className="text-xl font-black text-gray-800 leading-tight">{spot.bestTimeToVisit || 'October to March'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-4 rounded-2xl mr-6 shadow-inner">
                    <Ticket className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Access Fee</p>
                    <p className="text-xl font-black text-gray-800 leading-tight">{spot.entryFee || 'Gratis'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-4 rounded-2xl mr-6 shadow-inner">
                    <Star className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Visitor Acclaim</p>
                    <div className="flex items-end space-x-2">
                        <p className="text-3xl font-black text-gray-800 leading-none">{spot.rating || '4.5'}</p>
                        <p className="text-xs font-bold text-gray-400 leading-none pb-1">/ 5.0</p>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-wider underline">Read {spot.reviewsCount || '0'} global reviews</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-gray-100 space-y-4">
                 <Link to={`/city/${spot.city?.id}`} className="block w-full text-center bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition shadow-2xl shadow-emerald-100 transform hover:-translate-y-1 duration-300">
                    Explore {spot.city?.name}
                 </Link>
                 <a 
                   href={spot.googleMapsUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block w-full text-center bg-gray-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-gray-800 transition shadow-2xl shadow-gray-200 transform hover:-translate-y-1 duration-300"
                 >
                    Get Directions
                 </a>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-4 shadow-xl border border-gray-100 h-[450px] overflow-hidden">
                <MapContainer center={[spot.latitude || 19.076, spot.longitude || 72.877]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '2rem' }}>
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
                                attribution='&copy; CARTO'
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <Marker position={[spot.latitude || 19.076, spot.longitude || 72.877]}>
                        <Popup>
                            <span className="font-black text-emerald-900">{spot.name}</span>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;

