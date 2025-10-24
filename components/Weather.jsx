'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';

export default function Weather() {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user's location and fetch weather
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError('');

        // Get user's location via IP geolocation
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        const userLocation = `${geoData.city}, ${geoData.country_name}`;
        setLocation(userLocation);

        // Fetch current weather and forecast
        const weatherRes = await fetch(
          `/api/weather?location=${encodeURIComponent(geoData.city)}`
        );
        const weatherData = await weatherRes.json();

        if (weatherData.success) {
          setCurrent(weatherData.current);
          setForecast(weatherData.forecast || []);
        } else {
          setError('Could not fetch weather data');
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to load weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-4 mb-6 text-white">
        <p className="text-sm">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail, don't break the page
  }

  if (!current) {
    return null;
  }

  return (
    <div className="weather-widget mb-6">
      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500 rounded-xl p-6 mb-4 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">📍 {location}</h3>
            <p className="text-sm opacity-90">Current Weather</p>
          </div>
          <div className="text-4xl font-bold">{Math.round(current.temp_c)}°C</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs opacity-75">Condition</p>
            <p className="text-sm font-semibold">{current.condition?.text}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs opacity-75">Humidity</p>
            <p className="text-sm font-semibold">{current.humidity}%</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs opacity-75">Wind Speed</p>
            <p className="text-sm font-semibold">{Math.round(current.wind_kph)} km/h</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs opacity-75">Feels Like</p>
            <p className="text-sm font-semibold">{Math.round(current.feelslike_c)}°C</p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <h4 className="text-sm font-semibold text-gray-200 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-3">
            {forecast.slice(0, 3).map((day, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-gray-700/50 to-gray-800/50 rounded-lg p-3 text-center text-white text-sm"
              >
                <p className="text-xs opacity-75 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="font-semibold mb-2">{Math.round(day.avg_temp_c)}°C</p>
                <p className="text-xs opacity-75">{day.condition?.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
