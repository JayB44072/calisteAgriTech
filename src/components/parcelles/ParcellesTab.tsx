import { useState } from 'react';
import { useParcelles } from '../../hooks/useParcelles';
import { useSensorData } from '../../hooks/useSensorData';
import { analyzeParcelle } from '../../lib/gemini';
import { ZONES, CULTURES } from '../../lib/constants';
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  X,
  Sprout,
  Thermometer,
  Droplets,
  Wind,
  Bot,
  Loader2,
  Ruler,
} from 'lucide-react';
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

interface ParcellesTabProps {
  userId: string;
  selectedParcelleId: string | null;
  onSelectParcelle: (id: string | null) => void;
}

export function ParcellesTab({ userId, selectedParcelleId, onSelectParcelle }: ParcellesTabProps) {
  const { parcelles, loading, createParcelle, updateParcelle, deleteParcelle, toggleIrrigation } = useParcelles(userId);
  const [showForm, setShowForm] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState<Parcelle | null>(null);
  const [formData, setFormData] = useState({ nom: '', culture: 'Tomates', superficie: 1, zone: 'Centre' });
  const [saving, setSaving] = useState(false);

  if (selectedParcelleId) {
    return (
      <ParcelleDetail
        parcelleId={selectedParcelleId}
        parcelles={parcelles}
        onBack={() => onSelectParcelle(null)}
        onToggleIrrigation={toggleIrrigation}
        onDelete={deleteParcelle}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingParcelle) {
        await updateParcelle(editingParcelle.id, formData);
      } else {
        await createParcelle(formData);
      }
      setShowForm(false);
      setEditingParcelle(null);
      setFormData({ nom: '', culture: 'Tomates', superficie: 1, zone: 'Centre' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: Parcelle) => {
    setEditingParcelle(p);
    setFormData({ nom: p.nom, culture: p.culture, superficie: Number(p.superficie), zone: p.zone });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette parcelle et toutes ses données ?')) {
      await deleteParcelle(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Mes Parcelles</h2>
        <button
          onClick={() => { setShowForm(true); setEditingParcelle(null); setFormData({ nom: '', culture: 'Tomates', superficie: 1, zone: 'Centre' }); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                {editingParcelle ? 'Modifier la parcelle' : 'Nouvelle parcelle'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
                  required
                  placeholder="Ex: Parcelle Nord"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Culture</label>
                  <select
                    value={formData.culture}
                    onChange={e => setFormData(prev => ({ ...prev, culture: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
                  >
                    {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={e => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
                  >
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Superficie (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.superficie}
                  onChange={e => setFormData(prev => ({ ...prev, superficie: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : editingParcelle ? 'Modifier' : 'Créer la parcelle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Parcelles Grid */}
      {parcelles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 dark:text-slate-300">Aucune parcelle</h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Ajoutez votre première parcelle agricole</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {parcelles.map((p, i) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => onSelectParcelle(p.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.irrigation_active ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                    <Sprout className={`w-5 h-5 ${p.irrigation_active ? 'text-blue-500' : 'text-primary-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">{p.nom}</h4>
                    <p className="text-xs text-gray-400 dark:text-slate-400">{p.culture}</p>
                  </div>
                </div>
                {p.irrigation_active && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> ON
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{p.superficie} ha</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.zone}</span>
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 dark:border-slate-700 pt-3">
                <button
                  onClick={e => { e.stopPropagation(); toggleIrrigation(p.id, !p.irrigation_active); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    p.irrigation_active
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                  }`}
                >
                  {p.irrigation_active ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                  {p.irrigation_active ? 'Couper' : 'Irriguer'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); startEdit(p); }}
                  className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-md transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                  className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParcelleDetail({
  parcelleId,
  parcelles,
  onBack,
  onToggleIrrigation,
  onDelete,
}: {
  parcelleId: string;
  parcelles: Parcelle[];
  onBack: () => void;
  onToggleIrrigation: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const parcelle = parcelles.find(p => p.id === parcelleId)!;
  const { sensorData, latestData, loading } = useSensorData(parcelleId);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeParcelle(
        parcelle.nom,
        parcelle.culture,
        parcelle.zone,
        sensorData
      );
      setAiAnalysis(result);
    } catch (err: any) {
      setAiAnalysis(`Erreur: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = sensorData.slice(0, 48).reverse().map(d => ({
    time: new Date(d.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    temperature: d.temperature ?? 0,
    humidite_sol: d.humidite_sol ?? 0,
    humidite_air: d.humidite_air ?? 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">{parcelle.nom}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{parcelle.culture} - {parcelle.zone} - {parcelle.superficie} ha</p>
        </div>
        <button
          onClick={() => onToggleIrrigation(parcelleId, !parcelle.irrigation_active)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            parcelle.irrigation_active
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40'
          }`}
        >
          {parcelle.irrigation_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          {parcelle.irrigation_active ? 'Couper Irrigation' : 'Activer Irrigation'}
        </button>
      </div>

      {/* Sensor cards */}
      {latestData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-4 text-center">
            <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{latestData.temperature?.toFixed(1)}°C</p>
            <p className="text-xs text-red-400 dark:text-red-500">Température</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 text-center">
            <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{latestData.humidite_sol?.toFixed(1)}%</p>
            <p className="text-xs text-blue-400 dark:text-blue-500">Humidité Sol</p>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 rounded-xl p-4 text-center">
            <Wind className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{latestData.humidite_air?.toFixed(1)}%</p>
            <p className="text-xs text-cyan-400 dark:text-cyan-500">Humidité Air</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-500" /> Température
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="detailTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" unit="°C" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#detailTemp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" /> Humidité
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="detailSol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="detailAir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="humidite_sol" stroke="#3b82f6" fill="url(#detailSol)" strokeWidth={2} name="Sol" />
                <Area type="monotone" dataKey="humidite_air" stroke="#06b6d4" fill="url(#detailAir)" strokeWidth={2} name="Air" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary-500" /> Analyse IA de la Parcelle
          </h3>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || sensorData.length === 0}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            {analyzing ? 'Analyse en cours...' : 'Analyser avec l\'IA'}
          </button>
        </div>

        {aiAnalysis ? (
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 whitespace-pre-wrap bg-primary-50/50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-100 dark:border-primary-800/30">
            {aiAnalysis}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-slate-400">
            {sensorData.length === 0
              ? 'Aucune donnée capteur. Simulez des données pour activer l\'analyse IA.'
              : 'Cliquez sur "Analyser avec l\'IA" pour obtenir des recommandations d\'irrigation personnalisées.'}
          </p>
        )}
      </div>

      {/* Delete */}
      <div className="flex justify-end">
        <button
          onClick={() => { if (confirm('Supprimer cette parcelle ?')) { onDelete(parcelleId); onBack(); } }}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Supprimer cette parcelle
        </button>
      </div>
    </div>
  );
}
