// Open-Meteo — gratuit, aucune clé API requise
// Docs: https://open-meteo.com/en/docs

export const CAMEROON_CITIES: Record<string, { lat: number; lon: number; label: string }> = {
  yaounde:   { lat: 3.848,  lon: 11.502, label: 'Yaoundé' },
  douala:    { lat: 4.050,  lon: 9.704,  label: 'Douala' },
  bafoussam: { lat: 5.478,  lon: 10.417, label: 'Bafoussam' },
  bamenda:   { lat: 5.960,  lon: 10.159, label: 'Bamenda' },
  garoua:    { lat: 9.302,  lon: 13.397, label: 'Garoua' },
  maroua:    { lat: 10.591, lon: 14.316, label: 'Maroua' },
  ngaoundere:{ lat: 7.314,  lon: 13.584, label: 'Ngaoundéré' },
  bertoua:   { lat: 4.578,  lon: 13.682, label: 'Bertoua' },
  ebolowa:   { lat: 2.900,  lon: 11.150, label: 'Ebolowa' },
  kribi:     { lat: 2.940,  lon: 9.910,  label: 'Kribi' },
};

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipSum: number;
  weathercode: number;
}

export interface WeatherHour {
  time: string;
  temperature: number;
  precipProbability: number;
}

export interface WeatherData {
  city: string;
  current: WeatherCurrent;
  daily: WeatherDay[];
  hourly: WeatherHour[];
}

// WMO Weather code → description + icon name
export function decodeWeatherCode(code: number): { label: string; condition: 'ensoleille' | 'nuageux' | 'pluvieux' | 'orageux' | 'brumeux' } {
  if (code === 0) return { label: 'Ciel dégagé', condition: 'ensoleille' };
  if (code <= 2) return { label: 'Partiellement nuageux', condition: 'nuageux' };
  if (code === 3) return { label: 'Couvert', condition: 'nuageux' };
  if (code <= 49) return { label: 'Brume / Brouillard', condition: 'brumeux' };
  if (code <= 59) return { label: 'Bruine', condition: 'pluvieux' };
  if (code <= 69) return { label: 'Pluie', condition: 'pluvieux' };
  if (code <= 79) return { label: 'Neige / Grésil', condition: 'nuageux' };
  if (code <= 84) return { label: 'Averses', condition: 'pluvieux' };
  if (code <= 94) return { label: 'Orage', condition: 'orageux' };
  return { label: 'Orage violent', condition: 'orageux' };
}

export async function fetchWeather(cityKey: string = 'yaounde'): Promise<WeatherData> {
  const city = CAMEROON_CITIES[cityKey] ?? CAMEROON_CITIES.yaounde;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', city.lat.toString());
  url.searchParams.set('longitude', city.lon.toString());
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
  url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'Africa/Douala');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const d = await res.json();

  const current: WeatherCurrent = {
    temperature: d.current.temperature_2m,
    humidity: d.current.relative_humidity_2m,
    windspeed: d.current.wind_speed_10m,
    weathercode: d.current.weather_code,
    time: d.current.time,
  };

  const daily: WeatherDay[] = (d.daily.time as string[]).map((date, i) => ({
    date,
    tempMax: d.daily.temperature_2m_max[i],
    tempMin: d.daily.temperature_2m_min[i],
    precipSum: d.daily.precipitation_sum[i] ?? 0,
    weathercode: d.daily.weather_code[i],
  }));

  const hourly: WeatherHour[] = (d.hourly.time as string[]).slice(0, 24).map((time, i) => ({
    time,
    temperature: d.hourly.temperature_2m[i],
    precipProbability: d.hourly.precipitation_probability[i] ?? 0,
  }));

  return { city: city.label, current, daily, hourly };
}
