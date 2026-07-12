import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Star, MessageCircle, ThumbsUp, ArrowLeft, MapPin, Hotel as HotelIcon } from 'lucide-react';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch hotel details
    api.get(`/public/hotels/${id}`)
      .then(res => setHotel(res.data))
      .catch(err => console.error("Error fetching hotel:", err));

    // Fetch reviews
    api.get(`/api/reviews/${id}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error("Error fetching reviews:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!hotel) return <div className="text-center py-20">Hotel not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <img 
          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070'} 
          alt={hotel.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 md:p-20">
          <button onClick={() => navigate(-1)} className="text-white flex items-center mb-6 hover:text-emerald-300 transition w-fit font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Hotels
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{hotel.name}</h1>
          <div className="flex items-center text-emerald-300 font-bold text-lg">
            <MapPin className="w-5 h-5 mr-2" /> {hotel.address}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-xl border border-gray-100">
            <section className="mb-16">
                <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-widest flex items-center">
                    <HotelIcon className="w-8 h-8 mr-4 text-emerald-600" /> About the Stay
                </h2>
                <p className="text-gray-600 text-xl leading-relaxed">{hotel.description}</p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-2xl">
                        <p className="text-emerald-600 font-black text-sm uppercase tracking-widest">Price</p>
                        <p className="text-2xl font-black text-gray-900">{hotel.priceRange}</p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-2xl">
                        <p className="text-amber-600 font-black text-sm uppercase tracking-widest">Rating</p>
                        <p className="text-2xl font-black text-gray-900">{hotel.rating?.toFixed(1)} / 5.0</p>
                    </div>
                </div>
                
                <div className="mt-10 space-y-6">
                    {hotel.amenities && (
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                            <p className="text-gray-900 font-black text-lg mb-2 uppercase tracking-wide">Amenities</p>
                            <p className="text-gray-600 leading-relaxed">{hotel.amenities}</p>
                        </div>
                    )}
                    {hotel.atmosphere && (
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                            <p className="text-gray-900 font-black text-lg mb-2 uppercase tracking-wide">Atmosphere</p>
                            <p className="text-gray-600 leading-relaxed">{hotel.atmosphere}</p>
                        </div>
                    )}
                    {hotel.cancellationPolicy && (
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                            <p className="text-gray-900 font-black text-lg mb-2 uppercase tracking-wide">Cancellation Policy</p>
                            <p className="text-gray-600 leading-relaxed">{hotel.cancellationPolicy}</p>
                        </div>
                    )}
                </div>
            </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-10 uppercase tracking-widest flex items-center">
                <MessageCircle className="w-8 h-8 mr-4 text-emerald-600" /> Guest Reviews
            </h2>
            {reviews.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-gray-500 font-bold">
                    No reviews yet. Be the first to share your experience!
                </div>
            ) : (
              <div className="space-y-8">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-emerald-100 transition">
                    <div className="flex items-center mb-4">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
                      <span className="ml-3 font-black text-gray-900 text-lg">{review.rating}</span>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">"{review.comment}"</p>
                    <div className="flex items-center justify-between text-sm text-gray-400 font-bold">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <button className="flex items-center bg-gray-100 px-4 py-2 rounded-xl text-gray-600 hover:text-emerald-600 transition">
                            <ThumbsUp className="w-4 h-4 mr-2" /> {review.likes} Helpful
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
