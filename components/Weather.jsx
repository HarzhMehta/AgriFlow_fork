'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';

export default function Weather() {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Use the location saved in the user's profile if available; fallback to IP geolocation.
    const fetchWeather = async () => {
      if (hasFetchedRef.current) return; // avoid duplicate fetches when user clicks repeatedly
      hasFetchedRef.current = true;

      try {
        setLoading(true);
        setError('');

        // Try to get user's saved profile location from backend
        let loc = null;
        try {
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            loc = profileJson?.data?.location || null;
          }
        } catch (e) {
          // continue to fallback
          console.warn('Failed to fetch profile for location, falling back to IP geolocation', e);
        }

        // If no profile location, fallback to IP geolocation
        let cityForQuery = null;
        if (loc) {
          // profile location may be a full string like "City, Region, Country"; use first token (city)
          setLocation(loc);
          cityForQuery = loc.split(',')[0].trim();
        } else {
          try {
            const geoRes = await fetch('https://ipapi.co/json/');
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const userLocation = `${geoData.city}, ${geoData.country_name}`;
              setLocation(userLocation);
              cityForQuery = geoData.city;
            }
          } catch (e) {
            console.warn('IP geolocation failed', e);
          }
        }

        if (!cityForQuery) {
          setError('No location available to fetch weather');
          return;
        }

        // Check sessionStorage cache to avoid refetching repeatedly
        const cacheKey = `weather_cache_${cityForQuery}`;
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            // Use cached data (no freshness check for now)
            setCurrent(parsed.current || null);
            setForecast(parsed.forecast || []);
            return;
          }
        } catch (e) {
          // ignore cache errors
        }

        // Fetch current weather and forecast from our backend API
        const weatherRes = await fetch(`/api/weather?location=${encodeURIComponent(cityForQuery)}`);
        if (!weatherRes.ok) {
          setError('Could not fetch weather data');
          return;
        }
        const weatherData = await weatherRes.json();

        if (weatherData.success) {
          setCurrent(weatherData.current);
          setForecast(weatherData.forecast || []);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ current: weatherData.current, forecast: weatherData.forecast }));
          } catch (e) {
            // ignore storage errors
          }
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
    <div className="weather-widget mb-6 w-full">
      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500 rounded-xl p-5 mb-4 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-semibold mb-1 truncate">📍 {location}</h3>
            <p className="text-sm opacity-90">Current Weather</p>
          </div>
          <div className="text-4xl md:text-5xl font-extrabold">{Math.round(current.temp_c)}°C</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4 flex flex-col items-center justify-center min-h-[72px] text-center">
            <p className="text-xs opacity-75">Condition</p>
            <p className="text-sm font-semibold break-words">{current.condition?.text}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 flex flex-col items-center justify-center min-h-[72px] text-center">
            <p className="text-xs opacity-75">Humidity</p>
            <p className="text-sm font-semibold">{current.humidity}%</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 flex flex-col items-center justify-center min-h-[72px] text-center">
            <p className="text-xs opacity-75">Wind Speed</p>
            <p className="text-sm font-semibold">{Math.round(current.wind_kph)} km/h</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 flex flex-col items-center justify-center min-h-[72px] text-center">
            <p className="text-xs opacity-75">Feels Like</p>
            <p className="text-sm font-semibold">{Math.round(current.feelslike_c)}°C</p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <h4 className="text-sm md:text-base font-semibold text-gray-200 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {forecast.slice(0, 3).map((day, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-gray-700/50 to-gray-800/50 rounded-lg p-4 text-center text-white text-sm"
              >
                <p className="text-xs md:text-sm opacity-75 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="font-semibold mb-2 text-lg md:text-xl">{Math.round(day.avg_temp_c)}°C</p>
                <p className="text-xs md:text-sm opacity-75 break-words">{day.condition?.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
