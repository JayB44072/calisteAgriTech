import { useParcelles } from '../../hooks/useParcelles';
import { useAllSensorData } from '../../hooks/useSensorData';
import { useBackgroundSimulation } from '../../hooks/useBackgroundSimulation';
import { useSensorAlerts } from '../../hooks/useNotifications';
import { useLang } from '../../contexts/LanguageContext';
import {
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  Power,
  TrendingUp,
  Activity,
  Sprout,
  Radio,
  FileDown,
} from 'lucide-react';
import { exportDashboardPDF } from '../../lib/pdfExport';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Parcelle } from '../../types/database';
import { motion } from 'framer-motion';

interface OverviewTabProps {
  userId: string;
  onNavigateToParcelle: (id: string) => void;
  onTabChange: (tab: string) => void;
}

export function OverviewTab({ userId, onNavigateToParcelle, onTabChange }: OverviewTabProps) {
  const { parcelles, loading: parcellesLoading } = useParcelles(userId);
  const parcelleIds = parcelles.map(p => p.id);
  const { latestAll, allData, loading: sensorLoading } = useAllSensorData(parcelleIds);
  const { lang } = useLang();

  // Real sensor alerts → in-app + browser notifications
  const parcelleNames = Object.fromEntries(parcelles.map(p => [p.id, p.nom]));
  useSensorAlerts(userId, latestAll, parcelleNames);

  // Background IoT simulation - invisible, no button
  useBackgroundSimulation(parcelles, latestAll);

  if (parcellesLoading || sensorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  const totalParcelles = parcelles.length;
  const totalSuperficie = parcelles.reduce((s, p) => s + Number(p.superficie), 0);
  const activeIrrigation = parcelles.filter(p => p.irrigation_active).length;

  const latestEntries = Object.values(latestAll).filter(Boolean);
  const avgTemp = latestEntries.length > 0
    ? latestEntries.reduce((s, d) => s + (d.temperature ?? 0), 0) / latestEntries.length : 0;
  const avgHumSol = latestEntries.length > 0
    ? latestEntries.reduce((s, d) => s + (d.humidite_sol ?? 0), 0) / latestEntries.length : 0;
  const avgHumAir = latestEntries.length > 0
    ? latestEntries.reduce((s, d) => s + (d.humidite_air ?? 0), 0) / latestEntries.length : 0;

  const chartData: Array<Record<string, string | number>> = [];
  for (const pid of parcelleIds) {
    const data = allData[pid] ?? [];
    const parcelle = parcelles.find(p => p.id === pid);
    for (const entry of data.slice(0, 24).reverse()) {
      chartData.push({
        time: new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        temperature: entry.temperature ?? 0,
        humidite_sol: entry.humidite_sol ?? 0,
        humidite_air: entry.humidite_air ?? 0,
        parcelle: parcelle?.nom ?? '',
      });
    }
  }

  const statCards = [
    { label: lang === 'fr' ? 'Température' : 'Temperature', value: `${avgTemp.toFixed(1)}°C`, icon: Thermometer, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/30' },
    { label: lang === 'fr' ? 'Humidité Sol' : 'Soil Humidity', value: `${avgHumSol.toFixed(1)}%`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/30' },
    { label: lang === 'fr' ? 'Humidité Air' : 'Air Humidity', value: `${avgHumAir.toFixed(1)}%`, icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-100 dark:border-cyan-800/30' },
    { label: lang === 'fr' ? 'Irrigation Active' : 'Active Irrigation', value: `${activeIrrigation}/${totalParcelles}`, icon: Power, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-100 dark:border-primary-800/30' },
  ];

  const tooltipStyle = { fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
            {lang === 'fr' ? 'Vue d\'ensemble' : 'Overview'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {totalParcelles} {lang === 'fr' ? `parcelle${totalParcelles !== 1 ? 's' : ''}` : `parcel${totalParcelles !== 1 ? 's' : ''}`} - {totalSuperficie.toFixed(1)} ha
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const firstSensor = Object.values(latestAll)[0];
              exportDashboardPDF({
                parcelles,
                sensorSummary: firstSensor ? { temperature: firstSensor.temperature ?? undefined, humidite_sol: firstSensor.humidite_sol ?? undefined, humidite_air: firstSensor.humidite_air ?? undefined } : undefined,
              });
            }}
            className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all">
            <FileDown className="w-4 h-4" /> Rapport PDF
          </button>
          {/* Live indicator */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400"
          >
            <Radio className="w-4 h-4" />
            {lang === 'fr' ? 'Capteurs en direct' : 'Live Sensors'}
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className={`${card.bg} ${card.border} border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{card.label}</span>
              <div className={`${card.bg} p-1.5 rounded-lg`}><card.icon className={`w-4 h-4 ${card.color}`} /></div>
            </div>
            <motion.p
              key={card.value}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`text-2xl font-bold ${card.color}`}
            >
              {card.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{lang === 'fr' ? 'Température' : 'Temperature'}</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="°C" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#tempGrad)" strokeWidth={2} animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{lang === 'fr' ? 'Humidité' : 'Humidity'}</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="solGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="airGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="humidite_sol" stroke="#3b82f6" fill="url(#solGrad)" strokeWidth={2} name="Sol" animationDuration={500} />
                <Area type="monotone" dataKey="humidite_air" stroke="#06b6d4" fill="url(#airGrad)" strokeWidth={2} name="Air" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 dark:text-slate-300">{lang === 'fr' ? 'En attente de données capteurs' : 'Waiting for sensor data'}</h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
            {lang === 'fr' ? 'Les données apparaîtront automatiquement une fois vos parcelles créées' : 'Data will appear automatically once you create parcels'}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500" /><h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{lang === 'fr' ? 'Mes Parcelles' : 'My Parcels'}</h3></div>
          <button onClick={() => onTabChange('parcelles')} className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">{lang === 'fr' ? 'Voir tout' : 'View all'}</button>
        </div>
        {parcelles.length === 0 ? (
          <div className="p-8 text-center"><MapPin className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" /><p className="text-sm text-gray-500 dark:text-slate-400">{lang === 'fr' ? 'Aucune parcelle. Ajoutez-en depuis l\'onglet Parcelles.' : 'No parcels. Add one from the Parcels tab.'}</p></div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {parcelles.slice(0, 5).map((p: Parcelle) => {
              const latest = latestAll[p.id];
              return (
                <button key={p.id} onClick={() => onNavigateToParcelle(p.id)} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.irrigation_active ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}><Sprout className={`w-5 h-5 ${p.irrigation_active ? 'text-blue-500' : 'text-primary-500'}`} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{p.nom}</p><p className="text-xs text-gray-400 dark:text-slate-500">{p.culture} - {p.zone} - {p.superficie} ha</p></div>
                  {latest && <div className="hidden sm:flex items-center gap-4 text-xs"><span className="text-red-500">{latest.temperature?.toFixed(1)}°C</span><span className="text-blue-500">{latest.humidite_sol?.toFixed(1)}%</span></div>}
                  <TrendingUp className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
