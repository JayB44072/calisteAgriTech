import { useState } from 'react';
import { useParcelles } from '../../hooks/useParcelles';
import { useSensorData } from '../../hooks/useSensorData';
import { useLang } from '../../contexts/LanguageContext';
import {
  Droplets, Power, PowerOff, Clock, CheckCircle, AlertTriangle,
  Plus, Zap, BarChart2, Calendar, Settings, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import type { Parcelle } from '../../types/database';

// ─── Irrigation plan stored locally per user session ─────────────────────────
interface IrrigationPlan {
  id: string;
  parcelle_id: string;
  parcelle_nom: string;
  methode: string;
  volume_eau: number;
  date_debut: string;
  automatique: boolean;
  seuil_humidite: number;
  status: 'planifie' | 'en_cours' | 'termine';
  created_at: string;
}

interface IrrigationSession {
  id: string;
  parcelle_id: string;
  parcelle_nom: string;
  date: string;
  duration_min: number;
  volume: number;
}

const statusConfig = {
  planifie: { label: 'Planifié', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock },
  en_cours: { label: 'En cours', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Zap },
  termine:  { label: 'Terminé',  color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20',  icon: CheckCircle },
};

function ParcelleIrrigationStatus({ parcelle, onToggle, lang }: { parcelle: Parcelle; onToggle: () => void; lang: string }) {
  const { latestData } = useSensorData(parcelle.id);
  const humidite = latestData?.humidite_sol ?? null;
  const needsIrrigation = humidite !== null && humidite < 40;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${parcelle.irrigation_active ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
          <Droplets className={`w-4 h-4 ${parcelle.irrigation_active ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{parcelle.nom}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 dark:text-slate-500">{parcelle.culture}</span>
            {humidite !== null && (
              <span className={`text-xs font-medium ${humidite < 35 ? 'text-red-500' : humidite < 50 ? 'text-amber-500' : 'text-green-500'}`}>
                Sol: {humidite.toFixed(0)}%
              </span>
            )}
            {needsIrrigation && !parcelle.irrigation_active && (
              <span className="text-xs text-amber-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                {lang === 'fr' ? 'À irriguer' : 'Needs water'}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          parcelle.irrigation_active
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200'
        }`}
      >
        {parcelle.irrigation_active
          ? <><PowerOff className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Couper' : 'Stop'}</>
          : <><Power className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Activer' : 'Start'}</>
        }
      </button>
    </div>
  );
}

function PlanCard({ plan, onDelete }: { plan: IrrigationPlan; onDelete: (id: string) => void }) {
  const cfg = statusConfig[plan.status];
  const Icon = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center`}>
            <Droplets className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-50">{plan.parcelle_nom}</p>
            <p className="text-xs text-gray-400 dark:text-slate-400">{plan.methode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color} ${cfg.bg} px-2.5 py-1 rounded-full`}>
            <Icon className="w-3 h-3" />{cfg.label}
          </span>
          <button onClick={() => onDelete(plan.id)} className="p-1 text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center py-3 border-y border-gray-100 dark:border-slate-700/50">
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Volume</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{plan.volume_eau}L</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Déclenchement</p>
          <p className="text-sm font-bold text-gray-900 dark:text-slate-50">{plan.automatique ? 'Auto' : 'Manuel'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Seuil</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">&lt;{plan.seuil_humidite}%</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <span>Prévu le</span>
        <span className="font-medium text-gray-900 dark:text-slate-100">
          {new Date(plan.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export function IrrigationTab({ userId }: { userId: string }) {
  const { parcelles, toggleIrrigation } = useParcelles(userId);
  const { lang } = useLang();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'plans' | 'history'>('overview');

  // Local state: plans and sessions created this session
  const [plans, setPlans] = useState<IrrigationPlan[]>([]);
  const [sessions, setSessions] = useState<IrrigationSession[]>([]);

  // Form state
  const [formParcelle, setFormParcelle] = useState('');
  const [formMethode, setFormMethode] = useState('Goutte-à-goutte');
  const [formVolume, setFormVolume] = useState('300');
  const [formDate, setFormDate] = useState('');
  const [formAuto, setFormAuto] = useState(true);
  const [formSeuil, setFormSeuil] = useState('35');

  // Stats
  const activeCount = parcelles.filter(p => p.irrigation_active).length;
  const activeParcelles = parcelles.filter(p => !p.id.startsWith('mock-'));

  // Weekly chart data based on real sessions + current week baseline 0 if no sessions
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.now() - (6 - i) * 86400000);
    const dayLabel = day.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dayStr = day.toISOString().slice(0, 10);
    const volume = sessions
      .filter(s => s.date.startsWith(dayStr))
      .reduce((sum, s) => sum + s.volume, 0);
    return { day: dayLabel, volume };
  });

  const totalVolume = sessions.reduce((s, sess) => s + sess.volume, 0);
  const tooltipStyle = { fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' };

  const handleCreatePlan = () => {
    if (!formParcelle || !formDate) return;
    const parcelle = activeParcelles.find(p => p.id === formParcelle);
    if (!parcelle) return;
    const newPlan: IrrigationPlan = {
      id: `plan-${Date.now()}`,
      parcelle_id: formParcelle,
      parcelle_nom: parcelle.nom,
      methode: formMethode,
      volume_eau: parseInt(formVolume) || 300,
      date_debut: formDate,
      automatique: formAuto,
      seuil_humidite: parseInt(formSeuil) || 35,
      status: 'planifie',
      created_at: new Date().toISOString(),
    };
    setPlans(prev => [newPlan, ...prev]);
    // Also record as a session
    const newSession: IrrigationSession = {
      id: `sess-${Date.now()}`,
      parcelle_id: formParcelle,
      parcelle_nom: parcelle.nom,
      date: new Date().toISOString(),
      duration_min: Math.round((newPlan.volume_eau / 10)),
      volume: newPlan.volume_eau,
    };
    setSessions(prev => [newSession, ...prev]);
    setShowPlanForm(false);
    setFormParcelle('');
    setFormDate('');
  };

  const deletePlan = (id: string) => setPlans(prev => prev.filter(p => p.id !== id));

  const realParcelles = parcelles.filter(p => !p.id.startsWith('mock-'));
  const hasRealParcelles = realParcelles.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Irrigation</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {activeCount > 0
              ? `${activeCount} irrigation${activeCount > 1 ? 's' : ''} active${activeCount > 1 ? 's' : ''}`
              : 'Gérez l\'irrigation de vos parcelles'
            }
          </p>
        </div>
        <button
          onClick={() => { setFormParcelle(realParcelles[0]?.id ?? ''); setShowPlanForm(true); }}
          disabled={!hasRealParcelles}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nouveau plan
        </button>
      </div>

      {/* No real parcelles warning */}
      {!hasRealParcelles && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Créez d'abord vos parcelles dans l'onglet <strong>Parcelles</strong> pour gérer l'irrigation.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Irrigations actives', value: activeCount, icon: Power, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Plans créés', value: plans.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Volume total', value: `${totalVolume}L`, icon: Droplets, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Sessions', value: sessions.length, icon: BarChart2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`${kpi.bg} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        {[
          { id: 'overview' as const, label: 'Vue globale', icon: BarChart2 },
          { id: 'plans' as const, label: 'Plans', icon: Calendar },
          { id: 'history' as const, label: 'Historique', icon: Clock },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeView === tab.id
                ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}>
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Vue globale */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                Contrôle rapide
              </h3>
              {activeCount > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                  {activeCount} active{activeCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {realParcelles.length === 0 ? (
              <div className="p-8 text-center">
                <Droplets className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Aucune parcelle. Créez des parcelles pour gérer l'irrigation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {realParcelles.map(p => (
                  <ParcelleIrrigationStatus key={p.id} parcelle={p} onToggle={() => toggleIrrigation(p.id, !p.irrigation_active)} lang={lang} />
                ))}
              </div>
            )}
          </div>

          {/* Chart — only show if sessions exist */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              Consommation d'eau (7 jours)
            </h3>
            {sessions.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                Aucune session enregistrée — créez un plan d'irrigation pour commencer.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="L" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume (L)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      {activeView === 'plans' && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-600 dark:text-slate-300 mb-1">Aucun plan d'irrigation</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500">
                {hasRealParcelles
                  ? 'Cliquez sur "Nouveau plan" pour planifier une irrigation.'
                  : 'Créez d\'abord vos parcelles dans l\'onglet Parcelles.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {plans.map(plan => <PlanCard key={plan.id} plan={plan} onDelete={deletePlan} />)}
            </div>
          )}
        </div>
      )}

      {/* Historique */}
      {activeView === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">Historique des sessions</h3>
          </div>
          {sessions.length === 0 ? (
            <div className="p-10 text-center">
              <Clock className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Aucune session pour le moment. Les irrigations planifiées apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {sessions.map(sess => (
                <div key={sess.id} className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{sess.parcelle_nom}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(sess.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })} — {sess.duration_min} min — {sess.volume}L
                    </p>
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Planifié
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal nouveau plan */}
      <AnimatePresence>
        {showPlanForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPlanForm(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">Nouveau plan d'irrigation</h3>
                <button onClick={() => setShowPlanForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Parcelle</label>
                  <select
                    value={formParcelle}
                    onChange={e => setFormParcelle(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">— Sélectionner une parcelle —</option>
                    {realParcelles.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.culture})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Méthode</label>
                    <select value={formMethode} onChange={e => setFormMethode(e.target.value)}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500">
                      {['Goutte-à-goutte', 'Aspersion', 'Gravitaire', 'Manuel'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Volume (L)</label>
                    <input type="number" value={formVolume} onChange={e => setFormVolume(e.target.value)} min="1"
                      placeholder="Litres"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date et heure de début</label>
                  <input type="datetime-local" value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="auto" checked={formAuto} onChange={e => setFormAuto(e.target.checked)} className="w-4 h-4 accent-primary-600" />
                  <label htmlFor="auto" className="text-sm text-gray-700 dark:text-slate-300">
                    Déclenchement automatique si humidité sol &lt;
                    <input type="number" value={formSeuil} onChange={e => setFormSeuil(e.target.value)}
                      className="inline-block w-12 mx-1 border-b border-gray-400 dark:border-slate-500 bg-transparent text-center text-sm font-bold text-primary-600 outline-none" min="10" max="80" />
                    %
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCreatePlan}
                    disabled={!formParcelle || !formDate}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Créer le plan
                  </button>
                  <button onClick={() => setShowPlanForm(false)}
                    className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
