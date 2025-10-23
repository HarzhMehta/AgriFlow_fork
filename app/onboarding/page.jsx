'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const commonCrops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Vegetables', 'Fruits', 'Tea', 'Coffee', 'Spices', 'Oilseeds'];
const climateTypes = ['Tropical', 'Semi-arid', 'Temperate', 'Subtropical', 'Arid', 'Coastal'];

// Input field component (defined outside to prevent re-creation)
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

// Progress step component
const ProgressStep = ({ number, active }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
    {number}
  </div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', location: '', fieldSize: '', cropsGrown: [], climate: ''
  });
  const [errors, setErrors] = useState({});

  // Check if profile already exists
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.profileCompleted === true) {
          router.push('/');
        }
      })
      .catch(console.error)
      .finally(() => setCheckingProfile(false));
  }, [isLoaded, isSignedIn, user, router]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCropToggle = (crop) => {
    setFormData(prev => ({
      ...prev,
      cropsGrown: prev.cropsGrown.includes(crop) 
        ? prev.cropsGrown.filter(c => c !== crop) 
        : [...prev.cropsGrown, crop]
    }));
  };

  const validate = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    } else {
      if (!formData.fieldSize.trim()) newErrors.fieldSize = 'Field size is required';
      if (!formData.cropsGrown.length) newErrors.cropsGrown = 'Select at least one crop';
      if (!formData.climate) newErrors.climate = 'Climate type is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => validate(1) && setStep(2);

  const handleSubmit = async () => {
    if (!validate(2)) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        router.push('/');
      } else {
        alert(data.message || data.error || 'Failed to save profile');
      }
    } catch (error) {
      alert('Error saving profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen
  if (!isLoaded || checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">{!isLoaded ? 'Loading...' : 'Checking your profile...'}</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Image src={assets.logo_icon} alt="AgriFlow" className="w-16 h-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to AgriFlow AI! 🌾</h1>
          <p className="text-gray-600">Let's set up your agricultural profile for personalized assistance</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <ProgressStep number={1} active={step >= 1} />
          <div className={`w-20 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
          <ProgressStep number={2} active={step >= 2} />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
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
            <button onClick={handleNext} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Agricultural Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Agricultural Details</h2>
            
            <InputField 
              label="Field Area/Size" 
              name="fieldSize" 
              value={formData.fieldSize}
              onChange={handleInputChange}
              placeholder="e.g., 5 acres or 2 hectares" 
              error={errors.fieldSize} 
            />
            
            {/* Crops */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crops You Grow * (Select all that apply)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {commonCrops.map(crop => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => handleCropToggle(crop)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.cropsGrown.includes(crop) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
              {errors.cropsGrown && <p className="text-red-500 text-sm mt-1">{errors.cropsGrown}</p>}
            </div>

            {/* Climate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Climate Type * (Whole year average)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {climateTypes.map(climate => (
                  <button
                    key={climate}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, climate }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.climate === climate ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {climate}
                  </button>
                ))}
              </div>
              {errors.climate && <p className="text-red-500 text-sm mt-1">{errors.climate}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Complete Setup ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
