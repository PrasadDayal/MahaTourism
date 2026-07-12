import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, CreditCard, Info, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const BookingForm = ({ hotel, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
  });
  const [summary, setSummary] = useState({
    nights: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate nights and total price whenever dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const pricePerNight = hotel.pricePerNight || 5000; // Fallback to 5000 if not set
        
        setSummary({
          nights: diffDays,
          totalPrice: diffDays * pricePerNight,
        });
      } else {
        setSummary({ nights: 0, totalPrice: 0 });
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, hotel.pricePerNight]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    if (checkIn < today) {
      setError('Check-in date cannot be in the past.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        hotelId: hotel.id,
        ...formData,
        totalAmount: summary.totalPrice,
      };
      await api.post('/bookings', bookingData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      if (err.response?.status === 401) {
        setError('Please login to book a hotel.');
      } else {
        setError(err.response?.data?.message || 'Failed to book. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8">
        <div className="relative h-48 bg-emerald-900 flex flex-col justify-end p-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-emerald-500 p-2 rounded-xl">
               <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Book Your Stay</h2>
          </div>
          <p className="text-emerald-300 font-medium flex items-center">
            <Info className="w-4 h-4 mr-2" /> {hotel.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <Calendar className="w-3 h-3 mr-2 text-emerald-600" /> Check In
              </label>
              <input
                type="date"
                name="checkInDate"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.checkInDate}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <Calendar className="w-3 h-3 mr-2 text-emerald-600" /> Check Out
              </label>
              <input
                type="date"
                name="checkOutDate"
                required
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                value={formData.checkOutDate}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <Users className="w-3 h-3 mr-2 text-emerald-600" /> Number of Guests
            </label>
            <div className="relative">
                <select
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-700 appearance-none"
                >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Users className="w-5 h-5" />
                </div>
            </div>
          </div>

          {/* Booking Summary */}
          {summary.nights > 0 && (
            <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-4">Booking Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-emerald-800 font-medium">
                        <span>Stay Duration</span>
                        <span>{summary.nights} {summary.nights === 1 ? 'Night' : 'Nights'}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-medium">
                        <span>Price per Night</span>
                        <span>₹{hotel.pricePerNight?.toLocaleString() || '5,000'}</span>
                    </div>
                    <div className="h-px bg-emerald-200 my-4"></div>
                    <div className="flex justify-between items-end">
                        <span className="text-emerald-900 font-black text-lg">Total Amount</span>
                        <span className="text-emerald-600 font-black text-2xl">₹{summary.totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || summary.nights === 0}
              className={`w-full py-5 rounded-2xl font-black text-lg transition shadow-lg flex items-center justify-center ${
                loading || summary.nights === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 mr-3" /> 
                  {summary.nights > 0 ? `Pay ₹${summary.totalPrice.toLocaleString()}` : 'Confirm Booking'}
                </>
              )}
            </button>
            <p className="text-center text-gray-400 text-[10px] mt-4 font-bold uppercase tracking-widest">
                Secure 256-bit SSL Encrypted Payment
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
