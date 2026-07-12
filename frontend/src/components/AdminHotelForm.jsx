import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminHotelForm = ({ hotel, cities, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceRange: '',
    pricePerNight: '',
    rating: 4.5,
    imageUrl: '',
    address: '',
    cityId: '',
    amenities: '',
    atmosphere: '',
    cancellationPolicy: ''
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        priceRange: hotel.priceRange || '',
        pricePerNight: hotel.pricePerNight || '',
        rating: hotel.rating || 4.5,
        imageUrl: hotel.imageUrl || '',
        address: hotel.address || '',
        cityId: hotel.city?.id || '',
        amenities: hotel.amenities || '',
        atmosphere: hotel.atmosphere || '',
        cancellationPolicy: hotel.cancellationPolicy || ''
      });
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (hotel) {
        await api.put(`/admin/hotels/${hotel.id}?cityId=${formData.cityId}`, formData);
        toast.success('Hotel updated successfully');
      } else {
        await api.post(`/admin/hotels?cityId=${formData.cityId}`, formData);
        toast.success('Hotel created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save hotel');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{hotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select name="cityId" value={formData.cityId} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                <option value="">Select City</option>
                {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <input type="text" name="priceRange" value={formData.priceRange} onChange={handleChange} placeholder="e.g. $100 - $200" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night</label>
              <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <input type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
              <textarea name="amenities" value={formData.amenities} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Atmosphere</label>
              <textarea name="atmosphere" value={formData.atmosphere} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
              <textarea name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Save Hotel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminHotelForm;
