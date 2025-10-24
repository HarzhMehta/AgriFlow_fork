export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location') || 'New Delhi';

  if (!process.env.WEATHER_API_KEY) {
    return Response.json(
      { success: false, error: 'Weather API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch current weather and forecast
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    // Extract current weather
    const current = data.current;

    // Extract forecast days
    const forecast = data.forecast?.forecastday || [];

    return Response.json({
      success: true,
      current: {
        temp_c: current.temp_c,
        temp_f: current.temp_f,
        condition: {
          text: current.condition.text,
          icon: current.condition.icon,
        },
        humidity: current.humidity,
        wind_kph: current.wind_kph,
        feelslike_c: current.feelslike_c,
        feelslike_f: current.feelslike_f,
        pressure_mb: current.pressure_mb,
        visibility_km: current.vis_km,
        uv: current.uv,
      },
      forecast: forecast.map((day) => ({
        date: day.date,
        max_temp_c: day.day.maxtemp_c,
        min_temp_c: day.day.mintemp_c,
        avg_temp_c: day.day.avgtemp_c,
        condition: {
          text: day.day.condition.text,
          icon: day.day.condition.icon,
        },
        rain_chance: day.day.daily_chance_of_rain,
        avg_humidity: day.day.avghumidity,
      })),
      location: `${data.location.name}, ${data.location.region}, ${data.location.country}`,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
