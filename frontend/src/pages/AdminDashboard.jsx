import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth.service';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Hotel as HotelIcon, 
  MapPin, 
  Settings, 
  LogOut,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import AdminHotelForm from '../components/AdminHotelForm';
import AdminSpotForm from '../components/AdminSpotForm';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [spots, setSpots] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isHotelFormOpen, setIsHotelFormOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isSpotFormOpen, setIsSpotFormOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, usersRes, hotelsRes, spotsRes, citiesRes, categoriesRes] = await Promise.all([
        api.get('/admin/bookings/all'),
        api.get('/admin/users'),
        api.get('/public/hotels'),
        api.get('/public/spots'),
        api.get('/public/cities'),
        api.get('/public/categories')
      ]);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setHotels(hotelsRes.data);
      setSpots(spotsRes.data);
      setCities(citiesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status?status=${status}`);
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUserRoleUpdate = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role?role=${role}`);
      toast.success('User role updated successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleHotelDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await api.delete(`/admin/hotels/${id}`);
      toast.success('Hotel deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete hotel');
    }
  };

  const handleSpotDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    try {
      await api.delete(`/admin/spots/${id}`);
      toast.success('Destination deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete destination');
    }
  };

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'bookings':
        return bookings.filter(b => 
          b.user.name.toLowerCase().includes(term) ||
          b.hotel.name.toLowerCase().includes(term)
        );
      case 'users':
        return users.filter(u => 
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      case 'hotels':
        return hotels.filter(h => 
          h.name.toLowerCase().includes(term) ||
          h.address.toLowerCase().includes(term)
        );
      case 'spots':
        return spots.filter(s => 
          s.name.toLowerCase().includes(term) ||
          s.city.name.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: <ClipboardList className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Total Users', value: users.length, icon: <Users className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Total Hotels', value: hotels.length, icon: <HotelIcon className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50' },
    { label: 'Destinations', value: spots.length, icon: <MapPin className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50' },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">AdminPanel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'bookings' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <ClipboardList className="w-5 h-5" />
            Bookings
          </button>
          <button 
            onClick={() => setActiveTab('hotels')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'hotels' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <HotelIcon className="w-5 h-5" />
            Hotels
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button 
            onClick={() => setActiveTab('spots')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'spots' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <MapPin className="w-5 h-5" />
            Destinations
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
              <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${stat.color}`}>{stat.icon}</div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              ))}
            </div>
          )}

          {/* Admin Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">
                {activeTab === 'dashboard' ? 'Recent Activity' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List`}
              </h3>
              {(activeTab === 'hotels' || activeTab === 'spots') && (
                <button 
                  onClick={() => {
                    if (activeTab === 'hotels') { setSelectedHotel(null); setIsHotelFormOpen(true); }
                    else { setSelectedSpot(null); setIsSpotFormOpen(true); }
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                >
                  Add New {activeTab === 'hotels' ? 'Hotel' : 'Destination'}
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    {activeTab === 'bookings' && (
                      <>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hotel & Location</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </>
                    )}
                    {activeTab === 'users' && (
                      <>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                      </>
                    )}
                    {activeTab === 'hotels' && (
                      <>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hotel</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price/Night</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                      </>
                    )}
                    {activeTab === 'spots' && (
                      <>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">City</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
                      </td>
                    </tr>
                  ) : filteredData().length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No records found.</td>
                    </tr>
                  ) : (
                    filteredData().map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        {activeTab === 'bookings' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                                  {item.user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{item.user.name}</p>
                                  <p className="text-xs text-gray-500">{item.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900 text-sm">{item.hotel.name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{new Date(item.checkInDate).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{item.totalAmount}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                        {activeTab === 'users' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                                  {item.name.charAt(0)}
                                </div>
                                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={item.role} 
                                onChange={(e) => handleUserRoleUpdate(item.id, e.target.value)}
                                className="text-sm bg-transparent border-none focus:ring-0 font-medium text-gray-700"
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                          </>
                        )}
                        {activeTab === 'hotels' && (
                          <>
                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{item.address}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{item.pricePerNight}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.rating} / 5</td>
                          </>
                        )}
                        {activeTab === 'spots' && (
                          <>
                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.city?.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.category?.name}</td>
                            <td className="px-6 py-4 text-sm">
                              {item.featured ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeTab === 'bookings' && item.status === 'PENDING' && (
                              <>
                                <button onClick={() => handleStatusUpdate(item.id, 'CONFIRMED')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5" /></button>
                                <button onClick={() => handleStatusUpdate(item.id, 'CANCELLED')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle className="w-5 h-5" /></button>
                              </>
                            )}
                            {activeTab === 'users' && (
                              <button onClick={() => handleUserDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle className="w-5 h-5" /></button>
                            )}
                            {activeTab === 'hotels' && (
                              <>
                                <button onClick={() => { setSelectedHotel(item); setIsHotelFormOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><ArrowUpRight className="w-5 h-5" /></button>
                                <button onClick={() => handleHotelDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle className="w-5 h-5" /></button>
                              </>
                            )}
                            {activeTab === 'spots' && (
                              <>
                                <button onClick={() => { setSelectedSpot(item); setIsSpotFormOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><ArrowUpRight className="w-5 h-5" /></button>
                                <button onClick={() => handleSpotDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle className="w-5 h-5" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {isHotelFormOpen && (
        <AdminHotelForm 
          hotel={selectedHotel} 
          cities={cities} 
          onClose={() => setIsHotelFormOpen(false)} 
          onSuccess={fetchAllData} 
        />
      )}

      {isSpotFormOpen && (
        <AdminSpotForm 
          spot={selectedSpot} 
          cities={cities} 
          categories={categories} 
          onClose={() => setIsSpotFormOpen(false)} 
          onSuccess={fetchAllData} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
