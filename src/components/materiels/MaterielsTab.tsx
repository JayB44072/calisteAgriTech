import { useState } from 'react';
import { useParcelles } from '../../hooks/useParcelles';
import { useMaterials, type NewMaterial } from '../../hooks/useMaterials';
import { useLang } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Wifi, WifiOff, Battery, BatteryLow, AlertTriangle, CheckCircle,
  Wrench, Plus, Search, RefreshCw, Signal, Zap, X, Loader2, Activity,
} from 'lucide-react';

type MaterialStatus = 'actif' | 'inactif' | 'maintenance' | 'hors_service';

const STATUS_CONFIG: Record<MaterialStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  actif:       { label: 'Actif',        color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',  icon: CheckCircle  },
  inactif:     { label: 'Inactif',      color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-900/20',    icon: WifiOff      },
  maintenance: { label: 'Maintenance',  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: Wrench       },
  hors_service:{ label: 'Hors service', color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20',      icon: AlertTriangle},
};

const TYPE_ICONS: Record<string, typeof Cpu> = {
  capteur: Cpu, pompe: Zap, station_meteo: Signal, drone: RefreshCw,
  vehicule: RefreshCw, outil: Wrench, autre: Cpu,
};

const TYPES_MAT = ['capteur','pompe','station_meteo','drone','vehicule','outil','autre'];

function BatteryIndicator({ level }: { level: number }) {
  const color = level > 50 ? 'text-green-500' : level > 20 ? 'text-amber-500' : 'text-red-500';
  const Icon = level < 20 ? BatteryLow : Battery;
  return <div className="flex items-center gap-1"><Icon className={`w-4 h-4 ${color}`} /><span className={`text-xs font-medium ${color}`}>{level}%</span></div>;
}
function SignalIndicator({ level }: { level: number }) {
  const color = level > 70 ? 'text-green-500' : level > 40 ? 'text-amber-500' : 'text-red-500';
  return <div className="flex items-center gap-1"><Wifi className={`w-4 h-4 ${color}`} /><span className={`text-xs font-medium ${color}`}>{level}%</span></div>;
}

// ─── Modale ajout appareil ────────────────────────────────────────────────────
function AddDeviceModal({ parcelles, onClose, onSave }: {
  parcelles: { id: string; nom: string }[];
  onClose: () => void;
  onSave: (d: NewMaterial) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<NewMaterial>>({ statut: 'actif', type: 'capteur' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof NewMaterial, v: any) => setForm(p => ({ ...p, [k]: v }));

  const inputCls = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5";

  const handleSave = async () => {
    if (!form.nom?.trim()) { setError('Le nom est requis'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form as NewMaterial);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ajouter un appareil</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Capteur, pompe, drone, station météo...</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelCls}>Nom de l'appareil *</label>
            <input className={inputCls} placeholder="Ex: Capteur humidité N1" value={form.nom ?? ''} onChange={e => set('nom', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type *</label>
              <select className={inputCls} value={form.type ?? 'capteur'} onChange={e => set('type', e.target.value)}>
                {TYPES_MAT.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select className={inputCls} value={form.statut ?? 'actif'} onChange={e => set('statut', e.target.value as MaterialStatus)}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="maintenance">Maintenance</option>
                <option value="hors_service">Hors service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fabricant</label>
              <input className={inputCls} placeholder="Ex: AgriSense" value={form.fabricant ?? ''} onChange={e => set('fabricant', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Modèle</label>
              <input className={inputCls} placeholder="Ex: AS-200" value={form.modele ?? ''} onChange={e => set('modele', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Numéro de série</label>
            <input className={inputCls} placeholder="Ex: AS200-001" value={form.numero_serie ?? ''} onChange={e => set('numero_serie', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Parcelle associée</label>
            <select className={inputCls} value={form.parcelle_id ?? ''} onChange={e => set('parcelle_id', e.target.value || null)}>
              <option value="">Aucune (appareil non assigné)</option>
              {parcelles.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Localisation</label>
            <input className={inputCls} placeholder="Ex: Zone Nord, Hangar principal..." value={form.localisation ?? ''} onChange={e => set('localisation', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dernière maintenance</label>
              <input type="date" className={inputCls} value={form.derniere_maintenance ?? ''} onChange={e => set('derniere_maintenance', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Prochaine maintenance</label>
              <input type="date" className={inputCls} value={form.prochaine_maintenance ?? ''} onChange={e => set('prochaine_maintenance', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={2} placeholder="Notes optionnelles..." value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : 'Ajouter l\'appareil'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function MaterielsTab({ userId }: { userId: string }) {
  const { parcelles } = useParcelles(userId);
  const { materials, loading, isDemo, addMaterial, deleteMaterial } = useMaterials(userId);
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<MaterialStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);

  const parcelleMap = Object.fromEntries(parcelles.map(p => [p.id, p.nom]));

  const enriched = materials.map(m => ({
    ...m,
    parcelleNom: m.parcelle_id ? (parcelleMap[m.parcelle_id] ?? 'Parcelle inconnue') : 'Non assigné',
  }));

  const filtered = enriched.filter(m => {
    if (filterStatus !== 'all' && m.statut !== filterStatus) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return m.nom.toLowerCase().includes(s) || m.parcelleNom.toLowerCase().includes(s);
    }
    return true;
  });

  const types = Array.from(new Set(materials.map(m => m.type)));
  const activeCount = materials.filter(m => m.statut === 'actif').length;
  const alertCount = materials.filter(m => m.statut === 'maintenance' || m.statut === 'hors_service' || (m.batterie ?? 100) < 20).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Matériels IoT</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            {isDemo && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                ⚠️ DEMO
              </span>
            )}
            {materials.length} appareil{materials.length !== 1 ? 's' : ''} · {activeCount} actif{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20">
          <Plus className="w-4 h-4" /> Ajouter un appareil
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total appareils', value: materials.length, icon: Cpu, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Actifs', value: activeCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Alertes', value: alertCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Parcelles couvertes', value: new Set(materials.filter(m => m.parcelle_id).map(m => m.parcelle_id)).size, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
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

      {alertCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{alertCount} appareil(s) nécessitent votre attention</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Batterie faible ou maintenance requise</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un appareil..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none">
          <option value="all">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactif">Inactif</option>
          <option value="hors_service">Hors service</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none">
          <option value="all">Tous les types</option>
          {types.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-xl h-36 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <Cpu className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 dark:text-slate-300 mb-1">Aucun appareil trouvé</h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">Ajoutez votre premier appareil IoT</p>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Ajouter un appareil
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((m, i) => {
            const cfg = STATUS_CONFIG[m.statut as MaterialStatus] ?? STATUS_CONFIG.inactif;
            const StatusIcon = cfg.icon;
            const TypeIcon = TYPE_ICONS[m.type] ?? Cpu;
            const isCritical = (m.batterie ?? 100) < 20 || m.statut === 'hors_service';

            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`bg-white dark:bg-slate-800 rounded-xl border ${isCritical ? 'border-red-200 dark:border-red-700/40' : 'border-gray-200 dark:border-slate-700'} p-5 hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                      <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">{m.nom}</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-400">{m.parcelleNom}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color} ${cfg.bg} px-2 py-1 rounded-full`}>
                    <StatusIcon className="w-3 h-3" />{cfg.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-gray-400 dark:text-slate-500">Type : </span><span className="font-medium text-gray-700 dark:text-slate-300 capitalize">{m.type.replace('_', ' ')}</span></div>
                  {m.fabricant && <div><span className="text-gray-400 dark:text-slate-500">Fabricant : </span><span className="font-medium text-gray-700 dark:text-slate-300">{m.fabricant}</span></div>}
                  {m.numero_serie && <div><span className="text-gray-400 dark:text-slate-500">S/N : </span><span className="font-mono text-gray-700 dark:text-slate-300">{m.numero_serie}</span></div>}
                  {m.localisation && <div><span className="text-gray-400 dark:text-slate-500">Lieu : </span><span className="font-medium text-gray-700 dark:text-slate-300">{m.localisation}</span></div>}
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                  {m.batterie != null && <BatteryIndicator level={m.batterie} />}
                  {m.signal != null && <SignalIndicator level={m.signal} />}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => deleteMaterial(m.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modale ajout */}
      <AnimatePresence>
        {showAdd && (
          <AddDeviceModal
            parcelles={parcelles.map(p => ({ id: p.id, nom: p.nom }))}
            onClose={() => setShowAdd(false)}
            onSave={addMaterial}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
