'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import ReactMarkdown from 'react-markdown';
import ThemeToggle from '@/components/ThemeToggle';

export default function WeatherPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  // Load user's location from profile
  useEffect(() => {
    if (!isLoaded) return;

    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.location) {
          setLocation(data.data.location);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, [isLoaded]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, userId: user?.id })
      });

      const data = await res.json();

      if (data.success) {
        setWeatherData(data.data);
      } else {
        setError(data.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen weather-bg flex items-center justify-center">
        <div className="text-center card-bg p-8 rounded-2xl">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen weather-bg p-4">
      <ThemeToggle />
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="card-bg bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Image src={assets.logo_icon} alt="AgriFlow" className="w-12 h-auto" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">🌤️ Weather Forecast</h1>
                <p className="text-gray-600 mt-1">Get weather updates and farming advice</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="btn-back px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (City/Area)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Pune, Punjab, Mumbai..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Your profile location ({location || 'not set'}) is pre-filled
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Fetching Weather...
                </span>
              ) : (
                '🌡️ Get Weather Report'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {weatherData && (
          <div className="card-bg bg-white rounded-2xl shadow-2xl p-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{weatherData.weatherInfo}</ReactMarkdown>
            </div>
            
            {/* Source Links */}
            {weatherData.sources && weatherData.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Weather Data Sources ({weatherData.resultsCount} sources)</h3>
                <div className="space-y-3">
                  {weatherData.sources.map((source, idx) => (
                    <div key={idx} className="source-card p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {source.title}
                          </a>
                          {source.content && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {source.content.substring(0, 200)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>📍 Location: <strong>{weatherData.location}</strong></span>
                <span>📅 Generated: {new Date(weatherData.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setWeatherData(null);
                setError('');
              }}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              🔄 Refresh Weather
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card-bg bg-white rounded-2xl shadow-2xl p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fetching Weather Data...</h3>
              <p className="text-gray-600">
                Getting current conditions and forecast for {location}
              </p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!weatherData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features Card */}
            <div className="card-bg bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> Features
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Current weather conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>7-day weather forecast</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Agricultural advisory</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Farming activity recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Weather alerts & warnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Best times for irrigation, spraying, harvesting</span>
                </li>
              </ul>
            </div>

            {/* Quick Tips Card */}
            <div className="card-bg bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Quick Tips
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Check weather before planning farm activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Follow agricultural advisory for best results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Avoid spraying during high winds or rain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Monitor humidity for disease prevention</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Plan irrigation based on rainfall forecast</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
