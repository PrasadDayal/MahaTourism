import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth.service';
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, IndianRupee, Users } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isUserAdmin = (user) => {
    if (!user) return false;
    const role = user.role || '';
    const roles = user.roles || [];
    return role === 'ADMIN' || role === 'ROLE_ADMIN' || roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!isUserAdmin(user)) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/admin/bookings/all');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status?status=${status}`);
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-emerald p-6 md:p-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Manage and review all customer hotel bookings</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookings.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500 text-lg">No bookings found</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-50 hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{booking.user.name}</h3>
                        <p className="text-sm text-gray-500">{booking.user.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-3 text-emerald-500" />
                      <span className="font-medium">{booking.hotel.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-emerald-500" />
                      <span>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-emerald-500" />
                      <span>{booking.numberOfGuests} Guests</span>
                    </div>
                    <div className="flex items-center text-gray-900 font-bold">
                      <IndianRupee className="w-4 h-4 mr-3 text-emerald-500" />
                      <span>Total: ₹{booking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                        className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                        className="flex-1 bg-white text-rose-600 border border-rose-200 py-2 rounded-xl font-semibold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      className="w-full bg-white text-rose-600 border border-rose-200 py-2 rounded-xl font-semibold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
