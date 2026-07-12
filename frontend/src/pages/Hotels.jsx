import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Hotel as HotelIcon, Star, MapPin, Search, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import { Link, useSearchParams } from 'react-router-dom';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        let res;
        if (cityId) {
          res = await api.get(`/public/hotels/city/${cityId}`);
        } else {
          res = await api.get('/public/hotels');
        }
        setHotels(res.data);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [cityId]);

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

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
      <div className="relative h-[400px] w-full bg-emerald-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070" 
                alt="Hotels Hero"
                className="w-full h-full object-cover"
            />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">Luxury <span className="text-emerald-400">Stays.</span></h1>
          <p className="text-emerald-100 text-xl font-medium max-w-2xl mx-auto">
            Find the perfect place to rest and recharge during your Maharashtra adventure.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-16">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 w-6 h-6" />
            <input 
              type="text" 
              placeholder="Search hotels by name or location..." 
              className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition text-lg font-bold text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredHotels.length > 0 ? (
            filteredHotels.map(hotel => (
              <div key={hotel.id} className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                <div className="relative h-64 overflow-hidden">
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
                
                <div className="p-8 flex-grow flex flex-col">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition">{hotel.name}</h4>
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4 w-fit">
                    {hotel.priceRange || 'Contact for pricing'}
                  </div>
                  <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">
                    {hotel.description}
                  </p>
                  <div className="flex items-start text-gray-400 text-sm font-medium mt-auto bg-gray-50 p-4 rounded-2xl">
                    <MapPin className="w-5 h-5 mr-3 text-emerald-500 shrink-0" /> 
                    {hotel.address}
                  </div>
                </div>
                
                <div className="px-8 pb-4">
                  <Link to={`/hotel/${hotel.id}`} className="w-full bg-gray-100 text-gray-900 py-3 rounded-2xl font-bold text-center hover:bg-gray-200 transition flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 mr-2" /> View Details
                  </Link>
                </div>
                <div className="px-8 pb-8">
                  <button 
                    onClick={() => setSelectedHotel(hotel)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-200 flex items-center justify-center"
                  >
                    <CreditCard className="w-5 h-5 mr-3" /> Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
              <HotelIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hotels found</h3>
              <p className="text-gray-500">Try searching with a different term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hotels;
