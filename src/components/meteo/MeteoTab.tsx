import { useState, useEffect } from 'react';
import { useParcelles } from '../../hooks/useParcelles';
import { useLang } from '../../contexts/LanguageContext';
import { fetchWeather, decodeWeatherCode, CAMEROON_CITIES, type WeatherData } from '../../lib/weather';
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, AlertTriangle, CloudSnow, Zap, MapPin, RefreshCw, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { motion } from 'framer-motion';

const conditionIcons = {
  ensoleille: Sun,
  nuageux:    Cloud,
  pluvieux:   CloudRain,
  orageux:    Zap,
  brumeux:    CloudSnow,
};

const conditionColors = {
  ensoleille: { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  nuageux:    { color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-900/20' },
  pluvieux:   { color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  orageux:    { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  brumeux:    { color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-900/20' },
};

function WeatherIcon({ code, size = 'md' }: { code: number; size?: 'sm' | 'md' | 'lg' }) {
  const { condition } = decodeWeatherCode(code);
  const Icon = conditionIcons[condition];
  const sizeClass = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-4 h-4' : 'w-7 h-7';
  return <Icon className={`${sizeClass} ${conditionColors[condition].color}`} />;
}

export function MeteoTab({ userId }: { userId: string }) {
  const { parcelles } = useParcelles(userId);
  const { lang } = useLang();
  const [selectedCity, setSelectedCity] = useState('yaounde');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(selectedCity);
      setWeather(data);
      setLastUpdate(new Date());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detect city from user's parcelles location if any
    if (parcelles.length > 0) {
      const city = parcelles[0]?.zone?.toLowerCase() ?? parcelles[0]?.adresse?.toLowerCase() ?? '';
      const match = Object.keys(CAMEROON_CITIES).find(k => city.includes(k));
      if (match) setSelectedCity(match);
    }
    loadWeather();
  }, [selectedCity]);

  const tooltipStyle = { fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' };

  // Irrigations alerts from weather
  const alerts = weather?.daily.filter(d => d.precipSum > 15 || d.tempMax > 35) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
            {lang === 'fr' ? 'Météo Agricole' : 'Agricultural Weather'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {weather?.city ?? '…'} — Open-Meteo
            {lastUpdate && <span className="text-xs text-gray-400">· {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            {Object.entries(CAMEROON_CITIES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button
            onClick={loadWeather}
            disabled={loading}
            className="p-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && !weather && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Chargement des données météo réelles…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Erreur météo</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
          <button onClick={loadWeather} className="ml-auto text-xs text-red-600 hover:underline">Réessayer</button>
        </div>
      )}

      {weather && (
        <>
          {/* Current weather card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-800 dark:to-cyan-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">{lang === 'fr' ? 'Maintenant' : 'Now'} · {weather.city}</p>
                <p className="text-5xl font-bold mt-1">{weather.current.temperature.toFixed(0)}°C</p>
                <p className="text-blue-100 text-sm mt-1">{decodeWeatherCode(weather.current.weathercode).label}</p>
              </div>
              <WeatherIcon code={weather.current.weathercode} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 bg-white/10 rounded-xl p-4">
              <div className="text-center">
                <Droplets className="w-4 h-4 text-blue-200 mx-auto mb-1" />
                <p className="text-lg font-bold">{weather.current.humidity}%</p>
                <p className="text-xs text-blue-200">{lang === 'fr' ? 'Humidité' : 'Humidity'}</p>
              </div>
              <div className="text-center">
                <Wind className="w-4 h-4 text-blue-200 mx-auto mb-1" />
                <p className="text-lg font-bold">{weather.current.windspeed.toFixed(0)}</p>
                <p className="text-xs text-blue-200">km/h</p>
              </div>
              <div className="text-center">
                <Thermometer className="w-4 h-4 text-blue-200 mx-auto mb-1" />
                <p className="text-lg font-bold">{weather.daily[0]?.precipSum.toFixed(0)}mm</p>
                <p className="text-xs text-blue-200">{lang === 'fr' ? 'Pluie auj.' : 'Rain today'}</p>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {lang === 'fr' ? 'Alertes agricoles' : 'Agricultural alerts'}
              </p>
              {alerts.map((d, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">
                  {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} :
                  {d.precipSum > 15 ? ` Fortes pluies prévues (${d.precipSum.toFixed(0)} mm) — réduire l'irrigation.` : ''}
                  {d.tempMax > 35 ? ` Chaleur extrême (${d.tempMax.toFixed(0)}°C) — irriguer tôt le matin.` : ''}
                </p>
              ))}
            </div>
          )}

          {/* 7-day forecast */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4">
              {lang === 'fr' ? 'Prévisions 7 jours' : '7-day forecast'}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {weather.daily.map((day, i) => {
                const { condition } = decodeWeatherCode(day.weathercode);
                return (
                  <div key={day.date} className={`text-center p-2 rounded-xl ${i === 0 ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                      {i === 0 ? 'Auj.' : new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </p>
                    <div className="my-1.5 flex justify-center">
                      <WeatherIcon code={day.weathercode} size="sm" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{day.tempMax.toFixed(0)}°</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{day.tempMin.toFixed(0)}°</p>
                    {day.precipSum > 0.5 && (
                      <p className="text-xs text-blue-500 font-medium">{day.precipSum.toFixed(0)}mm</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly temperature chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4">
              {lang === 'fr' ? 'Températures (24h)' : 'Temperature (24h)'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weather.hourly.map(h => ({
                heure: h.time.slice(11, 16),
                temp: h.temperature,
                pluie: h.precipProbability,
              }))}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="heure" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="°C" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#tempGrad)" strokeWidth={2} name="Température (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Precipitation chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4">
              {lang === 'fr' ? 'Probabilité de pluie (24h)' : 'Rain probability (24h)'}
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={weather.hourly.filter((_, i) => i % 2 === 0).map(h => ({
                heure: h.time.slice(11, 16),
                pluie: h.precipProbability,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="heure" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={2} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pluie" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Probabilité pluie (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Irrigation advice */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-3 flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              {lang === 'fr' ? 'Conseil d\'irrigation basé sur la météo réelle' : 'Irrigation advice from live weather'}
            </h3>
            {(() => {
              const todayRain = weather.daily[0]?.precipSum ?? 0;
              const tomorrowRain = weather.daily[1]?.precipSum ?? 0;
              const temp = weather.current.temperature;
              if (todayRain > 10) return <p className="text-sm text-emerald-700 dark:text-emerald-400">Pluies significatives aujourd'hui ({todayRain.toFixed(0)} mm). <strong>Pas d'irrigation nécessaire.</strong></p>;
              if (tomorrowRain > 8) return <p className="text-sm text-emerald-700 dark:text-emerald-400">Pluies prévues demain ({tomorrowRain.toFixed(0)} mm). <strong>Réduire l'irrigation ce soir.</strong></p>;
              if (temp > 32) return <p className="text-sm text-emerald-700 dark:text-emerald-400">Températures élevées ({temp.toFixed(0)}°C). <strong>Irriguer tôt le matin (6h-8h) ou en soirée (18h-20h).</strong></p>;
              return <p className="text-sm text-emerald-700 dark:text-emerald-400">Conditions normales. <strong>Suivez votre plan d'irrigation habituel.</strong></p>;
            })()}
          </div>
        </>
      )}
    </div>
  );
}
