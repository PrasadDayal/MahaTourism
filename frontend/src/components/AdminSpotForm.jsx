import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSpotForm = ({ spot, cities, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    openHours: '',
    tips: '',
    latitude: '',
    longitude: '',
    activities: '',
    history: '',
    bestTimeToVisit: '',
    imageUrl: '',
    entryFee: '',
    rating: 4.5,
    reviewsCount: 0,
    googleMapsUrl: '',
    accessibilityInfo: '',
    transportInfo: '',
    featured: false,
    cityId: '',
    categoryId: ''
  });

  useEffect(() => {
    if (spot) {
      setFormData({
        name: spot.name || '',
        description: spot.description || '',
        openHours: spot.openHours || '',
        tips: spot.tips || '',
        latitude: spot.latitude || '',
        longitude: spot.longitude || '',
        activities: spot.activities || '',
        history: spot.history || '',
        bestTimeToVisit: spot.bestTimeToVisit || '',
        imageUrl: spot.imageUrl || '',
        entryFee: spot.entryFee || '',
        rating: spot.rating || 4.5,
        reviewsCount: spot.reviewsCount || 0,
        googleMapsUrl: spot.googleMapsUrl || '',
        accessibilityInfo: spot.accessibilityInfo || '',
        transportInfo: spot.transportInfo || '',
        featured: spot.featured || false,
        cityId: spot.city?.id || '',
        categoryId: spot.category?.id || ''
      });
    }
  }, [spot]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (spot) {
        await api.put(`/admin/spots/${spot.id}?cityId=${formData.cityId}&categoryId=${formData.categoryId}`, formData);
        toast.success('Destination updated successfully');
      } else {
        await api.post(`/admin/spots?cityId=${formData.cityId}&categoryId=${formData.categoryId}`, formData);
        toast.success('Destination created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save destination');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{spot ? 'Edit Destination' : 'Add New Destination'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Hours</label>
              <input type="text" name="openHours" value={formData.openHours} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
              <input type="text" name="entryFee" value={formData.entryFee} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
              <input type="text" name="activities" value={formData.activities} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">History</label>
              <textarea name="history" value={formData.history} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tips</label>
              <textarea name="tips" value={formData.tips} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Info</label>
              <textarea name="accessibilityInfo" value={formData.accessibilityInfo} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport Info</label>
              <textarea name="transportInfo" value={formData.transportInfo} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
              <input type="text" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
              <label className="text-sm font-medium text-gray-700">Featured Destination</label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Save Destination</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSpotForm;
