'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const commonCrops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Vegetables', 'Fruits', 'Tea', 'Coffee', 'Spices', 'Oilseeds'];
const climateTypes = ['Tropical', 'Semi-arid', 'Temperate', 'Subtropical', 'Arid', 'Coastal'];

// Input field component
const InputField = ({ label, name, value, onChange, placeholder, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-800`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    location: '',
    fieldSize: '',
    cropsGrown: [],
    climate: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing profile data
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFormData({
            username: data.data.username || '',
            location: data.data.location || '',
            fieldSize: data.data.fieldSize || '',
            cropsGrown: data.data.cropsGrown || [],
            climate: data.data.climate || ''
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, [isLoaded, isSignedIn, router]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
  };

  const handleCropToggle = (crop) => {
    setFormData(prev => ({
      ...prev,
      cropsGrown: prev.cropsGrown.includes(crop)
        ? prev.cropsGrown.filter(c => c !== crop)
        : [...prev.cropsGrown, crop]
    }));
    setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.fieldSize.trim()) newErrors.fieldSize = 'Field size is required';
    if (!formData.cropsGrown.length) newErrors.cropsGrown = 'Select at least one crop';
    if (!formData.climate) newErrors.climate = 'Climate type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSuccessMessage('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage('✅ Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || data.error || 'Failed to update profile');
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen
  if (!isLoaded || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Image src={assets.logo_icon} alt="AgriFlow" className="w-12 h-auto" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
                <p className="text-gray-600 mt-1">Update your agricultural information</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              ← Back to Chat
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g., farmer_raj"
                  error={errors.username}
                />
                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Punjab, India"
                  error={errors.location}
                />
              </div>
            </div>

            {/* Agricultural Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Agricultural Details</h2>
              
              <div className="mb-6">
                <InputField
                  label="Field Area/Size"
                  name="fieldSize"
                  value={formData.fieldSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 acres or 2 hectares"
                  error={errors.fieldSize}
                />
              </div>

              {/* Crops */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crops You Grow * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {commonCrops.map(crop => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.cropsGrown.includes(crop)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
                {errors.cropsGrown && <p className="text-red-500 text-sm mt-1">{errors.cropsGrown}</p>}
              </div>

              {/* Climate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Climate Type * (Whole year average)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {climateTypes.map(climate => (
                    <button
                      key={climate}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, climate }));
                        setSuccessMessage('');
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.climate === climate
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {climate}
                    </button>
                  ))}
                </div>
                {errors.climate && <p className="text-red-500 text-sm mt-1">{errors.climate}</p>}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Account Information</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{user?.primaryEmailAddress?.emailAddress || 'Not available'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Full Name:</span>
              <span>{user?.fullName || 'Not available'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">User ID:</span>
              <span className="text-xs font-mono">{user?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
