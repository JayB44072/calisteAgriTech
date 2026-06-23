import { useState, useRef } from 'react';
import { useParcelles } from '../../hooks/useParcelles';
import { usePlan } from '../../contexts/SubscriptionContext';
import { useSensorData } from '../../hooks/useSensorData';
import { analyzeParcelle } from '../../lib/groq';
import { ZONES, CULTURES } from '../../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { CardSkeleton } from '../ui/Skeleton';
import { exportParcellesPDF, exportParcellePDF } from '../../lib/pdfExport';
import {
  Plus, MapPin, Pencil, Trash2, Power, PowerOff, X, Sprout,
  Thermometer, Droplets, Wind, Bot, Loader2, Ruler, ChevronRight,
  ChevronLeft, Check, Camera, Layers, Waves, Cpu, Calendar,
  AlertTriangle, Activity, Zap, ArrowLeft, Info, FileDown, Search,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Parcelle } from '../../types/database';

const CULTURES_EXT = ['Tomates','Maïs','Manioc','Riz','Poivrons','Café','Cacao','Igname','Sorgho','Arachides','Plantain','Haricots','Oignons','Piment','Gombo','Patate douce','Légumes verts','Autre'];

const CULTURE_ICONS: Record<string, string> = {
  Tomates:'🍅', Maïs:'🌽', Manioc:'🌿', Riz:'🌾', Poivrons:'🫑', Café:'☕', Cacao:'🍫',
  Igname:'🥔', Sorgho:'🌾', Arachides:'🥜', Plantain:'🍌', Haricots:'🫘', Oignons:'🧅',
  Piment:'🌶️', Gombo:'🌿', 'Patate douce':'🍠', 'Légumes verts':'🥬', Autre:'🌱',
};

// Données réelles de sols par région du Cameroun (FAO / IRAD)
const CAMEROON_SOIL_MAP: Record<string, { type: string; ph: string; drainage: string; fertilite: string; description: string }> = {
  'Centre':       { type:'Ferrallitique (latéritique)', ph:'5.5', drainage:'Bon',        fertilite:'Moyenne',  description:'Sols rouges ferrallitiques du Plateau Central, riches en fer et aluminium.' },
  'Littoral':     { type:'Hydromorphe argileux',        ph:'6.0', drainage:'Faible',     fertilite:'Élevée',   description:'Sols argileux à forte rétention d\'eau, riches en matière organique côtière.' },
  'Adamaoua':     { type:'Ferrugineux tropical',        ph:'6.2', drainage:'Bon',        fertilite:'Moyenne',  description:'Sols ferrugineux sur le plateau basaltique de l\'Adamaoua.' },
  'Nord':         { type:'Vertisol (argile noire)',     ph:'7.2', drainage:'Moyen',      fertilite:'Élevée',   description:'Vertisols gonflants à fissures larges en saison sèche, très fertiles.' },
  'Extrême-Nord': { type:'Halomorphe / Vertisol',       ph:'8.0', drainage:'Très faible',fertilite:'Faible',   description:'Sols sodiques et vertisols en zones inondables, risque salinité.' },
  'Ouest':        { type:'Andosol volcanique',          ph:'5.8', drainage:'Excellent',  fertilite:'Élevée',   description:'Sols volcaniques très fertiles des Hautes Terres de l\'Ouest camerounais.' },
  'Sud':          { type:'Ferrallitique profond',       ph:'5.2', drainage:'Bon',        fertilite:'Faible',   description:'Sols ferrallitiques sous forêt équatoriale dense, lessivés en profondeur.' },
  'Est':          { type:'Ferrallitique sableux',       ph:'5.0', drainage:'Excellent',  fertilite:'Faible',   description:'Sols sableux à faible rétention d\'eau, forêt semi-caducifoliée.' },
  'Sud-Ouest':    { type:'Andosol volcanique-ferrallitique', ph:'5.5', drainage:'Bon',   fertilite:'Élevée',   description:'Sols volcaniques du Mont Cameroun et zones de montagne, très productifs.' },
  'Nord-Ouest':   { type:'Andosol highland riche',     ph:'5.7', drainage:'Bon',        fertilite:'Élevée',   description:'Andosols volcaniques des Grassfields, parmi les plus fertiles d\'Afrique.' },
};

const DRAINAGE_OPTS = ['Excellent','Bon','Moyen','Faible','Très faible'];
const FERTILITE_OPTS = ['Élevée','Moyenne','Faible','À améliorer'];
const TYPES_IRRIGATION = ['Goutte-à-goutte','Aspersion','Micro-irrigation','Submersion','Gravitaire','Manuel'];
const SOURCES_EAU = ['Forage','Puits','Réseau municipal','Rivière','Lac','Pluie','Réservoir'];

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400' },
  archivee: { label: 'Archivée', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  en_preparation: { label: 'Préparation', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
};

const CULTURE_COLORS: Record<string, string> = {
  Tomates: '#ef4444', Maïs: '#f59e0b', Manioc: '#8b5cf6', Riz: '#3b82f6',
  Poivrons: '#f97316', Café: '#92400e', Cacao: '#78350f', Igname: '#059669',
};

// ─── Wizard ──────────────────────────────────────────────────────────────────
const WIZARD_STEPS = [
  { id: 1, title: 'Informations', icon: Info, desc: 'Nom, description, superficie' },
  { id: 2, title: 'Localisation', icon: MapPin, desc: 'Zone géographique et adresse' },
  { id: 3, title: 'Culture', icon: Sprout, desc: 'Plante, variété et dates' },
  { id: 4, title: 'Sol', icon: Layers, desc: 'Type de sol et caractéristiques' },
  { id: 5, title: 'Irrigation', icon: Droplets, desc: 'Mode et source d\'eau' },
  { id: 6, title: 'Résumé', icon: Check, desc: 'Vérifier et créer' },
];

type WizardData = {
  nom: string; description: string; superficie: string; unite: string;
  zone: string; adresse: string; latitude: string; longitude: string;
  culture: string; variete: string; date_semis: string; date_recolte_estimee: string;
  type_sol: string; ph_sol: string; drainage: string; fertilite: string;
  type_irrigation: string; source_eau: string;
  statut: 'active' | 'inactive' | 'en_preparation';
};

const EMPTY_WIZARD: WizardData = {
  nom: '', description: '', superficie: '1', unite: 'ha',
  zone: ZONES[0] ?? 'Centre', adresse: '', latitude: '', longitude: '',
  culture: 'Tomates', variete: '', date_semis: '', date_recolte_estimee: '',
  type_sol: 'Argileux', ph_sol: '7', drainage: 'Bon', fertilite: 'Moyenne',
  type_irrigation: 'Goutte-à-goutte', source_eau: 'Forage',
  statut: 'active',
};

function WizardModal({ onClose, onSave, initial }: { onClose: () => void; onSave: (d: WizardData) => Promise<void>; initial?: WizardData }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initial ?? EMPTY_WIZARD);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key: keyof WizardData, val: string) => setData(p => ({ ...p, [key]: val }));

  // ── Geocoding state (Step 2) ──────────────────────────────────────────────
  const [geoQuery, setGeoQuery] = useState(initial?.adresse ?? '');
  const [geoResults, setGeoResults] = useState<any[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchGeo = (q: string) => {
    setGeoQuery(q);
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (q.length < 3) { setGeoResults([]); return; }
    geoTimer.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`);
        const d = await r.json();
        setGeoResults(d);
      } catch { setGeoResults([]); }
      finally { setGeoLoading(false); }
    }, 400);
  };

  const selectGeo = (r: any) => {
    const adresse = r.display_name;
    const region: string = r.address?.state ?? r.address?.county ?? '';
    const matchedZone = Object.keys(CAMEROON_SOIL_MAP).find(z =>
      region.toLowerCase().includes(z.toLowerCase()) ||
      adresse.toLowerCase().includes(z.toLowerCase())
    ) ?? 'Centre';
    const soil = CAMEROON_SOIL_MAP[matchedZone];
    setData(prev => ({
      ...prev,
      adresse,
      zone: matchedZone,
      latitude: r.lat,
      longitude: r.lon,
      type_sol: soil.type,
      ph_sol: soil.ph,
      drainage: soil.drainage,
      fertilite: soil.fertilite,
    }));
    setGeoQuery([r.address?.village ?? r.address?.town ?? r.address?.city ?? '', r.address?.state ?? ''].filter(Boolean).join(', ') || adresse.split(',').slice(0,2).join(','));
    setGeoResults([]);
  };

  // ── Culture state (Step 3) ────────────────────────────────────────────────
  const [cultureInput, setCultureInput] = useState(initial?.culture ?? 'Tomates');

  const canNext = () => {
    if (step === 1) return data.nom.trim().length > 0 && parseFloat(data.superficie) > 0;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try { await onSave(data); onClose(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {initial ? 'Modifier la parcelle' : 'Nouvelle parcelle'}
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1">
            {WIZARD_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 flex-1">
                <button onClick={() => step > s.id && setStep(s.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${step > s.id ? 'bg-cyan-600 text-white cursor-pointer hover:bg-cyan-700' : step === s.id ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 dark:ring-cyan-900/40' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}>
                  {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                </button>
                {i < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s.id ? 'bg-cyan-600' : 'bg-gray-100 dark:bg-slate-700'}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 font-medium">
            Étape {step}/6 — {WIZARD_STEPS[step - 1].title} : {WIZARD_STEPS[step - 1].desc}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">

              {step === 1 && (
                <>
                  <div><label className={labelCls}>Nom de la parcelle *</label><input className={inputCls} placeholder="Ex : Parcelle Nord" value={data.nom} onChange={e => set('nom', e.target.value)} /></div>
                  <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} placeholder="Description optionnelle..." value={data.description} onChange={e => set('description', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Superficie *</label><input type="number" step="0.1" min="0.01" className={inputCls} value={data.superficie} onChange={e => set('superficie', e.target.value)} /></div>
                    <div><label className={labelCls}>Unité</label>
                      <select className={inputCls} value={data.unite} onChange={e => set('unite', e.target.value)}>
                        <option value="ha">Hectares (ha)</option><option value="m2">m²</option><option value="ares">Ares</option>
                      </select>
                    </div>
                  </div>
                  <div><label className={labelCls}>Statut</label>
                    <select className={inputCls} value={data.statut} onChange={e => set('statut', e.target.value as any)}>
                      <option value="active">Active</option><option value="en_preparation">En préparation</option><option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="relative">
                    <label className={labelCls}>Rechercher un lieu *</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      {geoLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />}
                      <input
                        className={`${inputCls} pl-9`}
                        placeholder="Ex: Yaoundé, Douala, Bafoussam..."
                        value={geoQuery}
                        onChange={e => searchGeo(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    {geoResults.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden max-h-56 overflow-y-auto">
                        {geoResults.map((r, i) => (
                          <button key={i} type="button" onClick={() => selectGeo(r)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0 flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs leading-tight">{r.display_name.split(',').slice(0,3).join(', ')}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{r.address?.state ?? r.address?.country ?? ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {data.latitude && (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/30 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-cyan-600" />
                        <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">Localisation sélectionnée</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{data.adresse}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-gray-500">📍 Région : <strong className="text-gray-700 dark:text-slate-300">{data.zone}</strong></span>
                        <span className="text-gray-500">🌍 {parseFloat(data.latitude).toFixed(4)}, {parseFloat(data.longitude).toFixed(4)}</span>
                      </div>
                      {CAMEROON_SOIL_MAP[data.zone] && (
                        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 italic">
                          Sol auto-détecté : {CAMEROON_SOIL_MAP[data.zone].type}
                        </p>
                      )}
                    </div>
                  )}

                  {!data.latitude && (
                    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                      <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">Tapez un village, quartier ou ville pour positionner la parcelle sur la carte. La latitude et longitude sont renseignées automatiquement.</p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <label className={labelCls}>Culture principale *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{CULTURE_ICONS[data.culture] ?? '🌱'}</span>
                      <input
                        className={`${inputCls} pl-10`}
                        placeholder="Tapez ou choisissez une culture..."
                        value={cultureInput}
                        onChange={e => {
                          setCultureInput(e.target.value);
                          set('culture', e.target.value);
                        }}
                        list="cultures-list"
                      />
                      <datalist id="cultures-list">
                        {CULTURES_EXT.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Quick culture grid */}
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">Sélection rapide :</p>
                    <div className="grid grid-cols-4 gap-2">
                      {CULTURES_EXT.filter(c => c !== 'Autre').map(c => (
                        <button key={c} type="button"
                          onClick={() => { setCultureInput(c); set('culture', c); }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${data.culture === c ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-cyan-300 dark:hover:border-cyan-700'}`}>
                          <span className="text-xl">{CULTURE_ICONS[c] ?? '🌱'}</span>
                          <span className="truncate w-full text-center">{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div><label className={labelCls}>Variété (optionnel)</label><input className={inputCls} placeholder="Ex: Roma, F1 Hybrid, Locale..." value={data.variete} onChange={e => set('variete', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Date de semis</label><input type="date" className={inputCls} value={data.date_semis} onChange={e => set('date_semis', e.target.value)} /></div>
                    <div><label className={labelCls}>Récolte estimée</label><input type="date" className={inputCls} value={data.date_recolte_estimee} onChange={e => set('date_recolte_estimee', e.target.value)} /></div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  {/* Auto-detected soil card */}
                  {CAMEROON_SOIL_MAP[data.zone] && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌍</span>
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">Sol détecté automatiquement — Région {data.zone}</span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{CAMEROON_SOIL_MAP[data.zone].description}</p>
                      <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-1">Source : FAO / Institut de Recherche Agronomique du Cameroun (IRAD)</p>
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Type de sol</label>
                    <input className={inputCls} value={data.type_sol} onChange={e => set('type_sol', e.target.value)}
                      placeholder="Ex: Ferrallitique, Argileux..." list="sol-list" />
                    <datalist id="sol-list">
                      {Object.values(CAMEROON_SOIL_MAP).map(s => <option key={s.type} value={s.type} />)}
                      {['Argileux','Limoneux','Sableux','Limon-argileux','Tourbeux','Calcaire'].map(t => <option key={t} value={t} />)}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div><label className={labelCls}>pH du sol</label>
                      <input type="number" step="0.1" min="0" max="14" className={inputCls} value={data.ph_sol} onChange={e => set('ph_sol', e.target.value)} />
                    </div>
                    <div><label className={labelCls}>Drainage</label>
                      <select className={inputCls} value={data.drainage} onChange={e => set('drainage', e.target.value)}>
                        {DRAINAGE_OPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Fertilité</label>
                      <select className={inputCls} value={data.fertilite} onChange={e => set('fertilite', e.target.value)}>
                        {FERTILITE_OPTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <div><label className={labelCls}>Type d'irrigation</label>
                    <select className={inputCls} value={data.type_irrigation} onChange={e => set('type_irrigation', e.target.value)}>
                      {TYPES_IRRIGATION.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Source d'eau</label>
                    <select className={inputCls} value={data.source_eau} onChange={e => set('source_eau', e.target.value)}>
                      {SOURCES_EAU.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}

              {step === 6 && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-5 border border-cyan-100 dark:border-cyan-800/30">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{data.nom || 'Sans nom'}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        ['Culture', data.culture], ['Superficie', `${data.superficie} ${data.unite}`],
                        ['Zone', data.zone || '—'], ['Sol', data.type_sol],
                        ['Irrigation', data.type_irrigation], ['Source eau', data.source_eau],
                        ['Statut', STATUS_CONFIG[data.statut].label],
                        ['Coordonnées', data.latitude ? `${parseFloat(data.latitude).toFixed(4)}, ${parseFloat(data.longitude).toFixed(4)}` : '—'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{k}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {error && <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm"><AlertTriangle className="w-4 h-4" />{error}</div>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          )}
          <button
            onClick={step < 6 ? () => { if (canNext()) setStep(s => s + 1); } : handleSave}
            disabled={saving || (step < 6 && !canNext())}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-cyan-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : step < 6 ? <ChevronRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : step < 6 ? 'Suivant' : (initial ? 'Modifier la parcelle' : 'Créer la parcelle')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Parcelle Card ────────────────────────────────────────────────────────────
function ParcelleCard({ p, onSelect, onEdit, onDelete, onToggleIrr, index }: {
  p: Parcelle; onSelect: () => void; onEdit: () => void; onDelete: () => void; onToggleIrr: () => void; index: number;
}) {
  const color = CULTURE_COLORS[p.culture] ?? '#0891b2';
  const statusCfg = STATUS_CONFIG[p.statut] ?? STATUS_CONFIG.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onSelect}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Top accent */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
              <Sprout className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{p.nom}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{p.culture}{p.variete ? ` · ${p.variete}` : ''}</p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-2.5 py-1.5">
            <Ruler className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{p.superficie} {p.unite || 'ha'}</span>
          </div>
          {p.zone && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-2.5 py-1.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{p.zone}</span>
            </div>
          )}
          {p.type_sol && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-2.5 py-1.5">
              <Layers className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{p.type_sol}</span>
            </div>
          )}
        </div>

        {p.date_semis && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-3">
            <Calendar className="w-3 h-3" />
            Semis {new Date(p.date_semis).toLocaleDateString('fr-FR')}
            {p.date_recolte_estimee && ` → Récolte ${new Date(p.date_recolte_estimee).toLocaleDateString('fr-FR')}`}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-gray-50 dark:border-slate-700/50 pt-3">
          <button onClick={e => { e.stopPropagation(); onToggleIrr(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${p.irrigation_active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
            {p.irrigation_active ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
            {p.irrigation_active ? 'Couper' : 'Irriguer'}
          </button>
          <div className="flex-1" />
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Parcelle Detail ──────────────────────────────────────────────────────────
function ParcelleDetail({ parcelleId, parcelles, onBack, onToggleIrrigation, onDelete }: {
  parcelleId: string; parcelles: Parcelle[]; onBack: () => void;
  onToggleIrrigation: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const parcelle = parcelles.find(p => p.id === parcelleId)!;
  const { sensorData, latestData, loading } = useSensorData(parcelleId);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const color = CULTURE_COLORS[parcelle?.culture] ?? '#0891b2';

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeParcelle(parcelle.nom, parcelle.culture, parcelle.zone ?? 'Centre', sensorData);
      setAiAnalysis(result);
    } catch (err: any) { setAiAnalysis(`Erreur: ${err.message}`); }
    finally { setAnalyzing(false); }
  };

  const chartData = sensorData.slice(0, 48).reverse().map(d => ({
    time: new Date(d.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    temperature: d.temperature ?? d.temperature_air ?? 0,
    humidite_sol: d.humidite_sol ?? 0,
    humidite_air: d.humidite_air ?? 0,
  }));

  if (!parcelle) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)`, border: `1px solid ${color}30` }}>
        <div className="p-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour aux parcelles
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '25' }}>
              <Sprout className="w-7 h-7" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{parcelle.nom}</h2>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 dark:text-slate-400">
                <span>{parcelle.culture}{parcelle.variete ? ` · ${parcelle.variete}` : ''}</span>
                <span>·</span><span>{parcelle.superficie} {parcelle.unite || 'ha'}</span>
                {parcelle.zone && <><span>·</span><span>{parcelle.zone}</span></>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportParcellePDF(parcelle, latestData ? { temperature: latestData.temperature ?? undefined, humidite_sol: latestData.humidite_sol ?? undefined, humidite_air: latestData.humidite_air ?? undefined } : undefined)}
                className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                <FileDown className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={() => onToggleIrrigation(parcelleId, !parcelle.irrigation_active)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${parcelle.irrigation_active ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200'}`}>
                {parcelle.irrigation_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                {parcelle.irrigation_active ? 'Couper Irrigation' : 'Activer Irrigation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor KPIs */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-2xl h-24 animate-pulse" />)}</div>
      ) : latestData && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Température', value: `${(latestData.temperature ?? latestData.temperature_air ?? 0).toFixed(1)}°C`, icon: Thermometer, color: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20', textColor: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-100 dark:bg-red-900/40' },
            { label: 'Humidité Sol', value: `${(latestData.humidite_sol ?? 0).toFixed(1)}%`, icon: Droplets, color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20', textColor: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
            { label: 'Humidité Air', value: `${(latestData.humidite_air ?? 0).toFixed(1)}%`, icon: Wind, color: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20', textColor: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40' },
          ].map(({ label, value, icon: Icon, color, textColor, iconBg }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 border border-gray-100/50 dark:border-slate-700/50`}>
              <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${textColor}`} /></div>
              <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Infos parcelle */}
      {(parcelle.type_sol || parcelle.ph_sol || parcelle.type_irrigation) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {parcelle.type_sol && <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"><p className="text-xs text-gray-400 mb-1">Type sol</p><p className="text-sm font-bold text-gray-900 dark:text-white">{parcelle.type_sol}</p></div>}
          {parcelle.ph_sol && <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"><p className="text-xs text-gray-400 mb-1">pH sol</p><p className="text-sm font-bold text-gray-900 dark:text-white">{parcelle.ph_sol}</p></div>}
          {parcelle.type_irrigation && <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"><p className="text-xs text-gray-400 mb-1">Irrigation</p><p className="text-sm font-bold text-gray-900 dark:text-white">{parcelle.type_irrigation}</p></div>}
          {parcelle.fertilite && <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"><p className="text-xs text-gray-400 mb-1">Fertilité</p><p className="text-sm font-bold text-gray-900 dark:text-white">{parcelle.fertilite}</p></div>}
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { title: 'Température', dataKey: 'temperature', unit: '°C', color: '#ef4444', gradId: 'dTemp' },
            { title: 'Humidité', dataKey: 'humidite_sol', unit: '%', color: '#3b82f6', gradId: 'dHum' },
          ].map(({ title, dataKey, unit, color: c, gradId }) => (
            <div key={title} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">{title}</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData}>
                  <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.25}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" unit={unit} width={35} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey={dataKey} stroke={c} fill={`url(#${gradId})`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2"><Bot className="w-4 h-4 text-cyan-500" /> Analyse IA de la parcelle</h3>
          <button onClick={handleAnalyze} disabled={analyzing || sensorData.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50">
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {analyzing ? 'Analyse...' : 'Analyser avec Gemini'}
          </button>
        </div>
        {aiAnalysis ? (
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 whitespace-pre-wrap bg-cyan-50/50 dark:bg-cyan-900/20 rounded-xl p-4 border border-cyan-100 dark:border-cyan-800/30">{aiAnalysis}</div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-slate-500">
            {sensorData.length === 0 ? 'Aucune donnée capteur disponible.' : 'Cliquez sur "Analyser" pour obtenir des recommandations personnalisées.'}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => { if (confirm('Supprimer cette parcelle ?')) { onDelete(parcelleId); onBack(); } }}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
          <Trash2 className="w-4 h-4" /> Supprimer cette parcelle
        </button>
      </div>
    </div>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────────────
interface ParcellesTabProps {
  userId: string;
  selectedParcelleId: string | null;
  onSelectParcelle: (id: string | null) => void;
}

export function ParcellesTab({ userId, selectedParcelleId, onSelectParcelle }: ParcellesTabProps) {
  const { parcelles, loading, isDemo, createParcelle, updateParcelle, deleteParcelle, toggleIrrigation } = useParcelles(userId);
  const { canAddParcelle, plan } = usePlan();
  const [showWizard, setShowWizard] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState<Parcelle | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [planAlert, setPlanAlert] = useState(false);

  if (selectedParcelleId) {
    return (
      <ParcelleDetail parcelleId={selectedParcelleId} parcelles={parcelles} onBack={() => onSelectParcelle(null)}
        onToggleIrrigation={toggleIrrigation} onDelete={deleteParcelle} />
    );
  }

  const handleSave = async (data: WizardData) => {
    const payload = {
      nom: data.nom, description: data.description || null, superficie: parseFloat(data.superficie),
      unite: data.unite, culture: data.culture, variete: data.variete || null,
      type_sol: data.type_sol, ph_sol: data.ph_sol ? parseFloat(data.ph_sol) : null,
      drainage: data.drainage, fertilite: data.fertilite, statut: data.statut as any,
      type_irrigation: data.type_irrigation, source_eau: data.source_eau,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      adresse: data.adresse || null, zone: data.zone || null,
      date_semis: data.date_semis || null, date_recolte_estimee: data.date_recolte_estimee || null,
    };
    if (editingParcelle) await updateParcelle(editingParcelle.id, payload);
    else await createParcelle(payload);
    setEditingParcelle(null);
  };

  const filtered = filter === 'all' ? parcelles : parcelles.filter(p => p.statut === filter);
  const totalHa = parcelles.reduce((s, p) => s + Number(p.superficie), 0);
  const activeCount = parcelles.filter(p => p.statut === 'active').length;
  const irrigationCount = parcelles.filter(p => p.irrigation_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Parcelles</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{parcelles.length} parcelle{parcelles.length > 1 ? 's' : ''} · {totalHa.toFixed(1)} ha · {irrigationCount} en irrigation</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (!plan.limits.exportPDF) { setPlanAlert(true); return; } exportParcellesPDF(parcelles); }}
            className={`flex items-center gap-2 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!plan.limits.exportPDF ? 'opacity-60' : ''}`}>
            <FileDown className="w-4 h-4" /> Exporter PDF {!plan.limits.exportPDF && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded-full">PRO</span>}
          </button>
          <button onClick={() => {
            if (!canAddParcelle(parcelles.length)) { setPlanAlert(true); return; }
            setEditingParcelle(null); setShowWizard(true);
          }}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-600/20 hover:shadow-xl active:scale-[0.98]">
            <Plus className="w-4 h-4" /> Nouvelle parcelle
          </button>
        </div>
      </div>

      {/* Plan limit alert */}
      {planAlert && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3">
          <span className="text-red-500 text-lg">🔒</span>
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">
            <span className="font-semibold">Limite atteinte</span> — Le plan <strong>{plan.name}</strong> autorise {plan.limits.parcelles === -1 ? 'illimité' : plan.limits.parcelles} parcelle(s) maximum.
            Passez à un forfait supérieur pour en créer davantage.
          </p>
          <button onClick={() => setPlanAlert(false)} className="text-red-400 hover:text-red-600 ml-auto">✕</button>
        </div>
      )}

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3">
          <Activity className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Mode démonstration</span> — Données simulées. Créez vos propres parcelles pour les voir ici.
          </p>
        </div>
      )}

      {/* Stats row */}
      {parcelles.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: parcelles.length, color: 'text-gray-900 dark:text-white' },
            { label: 'Actives', value: activeCount, color: 'text-cyan-600 dark:text-cyan-400' },
            { label: 'Irrigation ON', value: irrigationCount, color: 'text-blue-600 dark:text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      {parcelles.length > 0 && (
        <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 gap-1 w-fit">
          {[['all', 'Toutes'], ['active', 'Actives'], ['en_preparation', 'Préparation'], ['archivee', 'Archivées']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === val ? 'bg-white dark:bg-slate-600 text-cyan-700 dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>
              {lbl}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-gray-300 dark:text-slate-500" />
          </div>
          <h3 className="font-semibold text-gray-600 dark:text-slate-300 mb-1">Aucune parcelle</h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-5">Créez votre première parcelle agricole</p>
          <button onClick={() => setShowWizard(true)} className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Ajouter une parcelle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <ParcelleCard key={p.id} p={p} index={i}
              onSelect={() => onSelectParcelle(p.id)}
              onEdit={() => { setEditingParcelle(p); setShowWizard(true); }}
              onDelete={() => { if (confirm('Supprimer cette parcelle ?')) deleteParcelle(p.id); }}
              onToggleIrr={() => toggleIrrigation(p.id, !p.irrigation_active)}
            />
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <WizardModal
            onClose={() => { setShowWizard(false); setEditingParcelle(null); }}
            onSave={handleSave}
            initial={editingParcelle ? {
              nom: editingParcelle.nom, description: editingParcelle.description ?? '',
              superficie: editingParcelle.superficie.toString(), unite: editingParcelle.unite || 'ha',
              zone: editingParcelle.zone ?? ZONES[0] ?? 'Centre', adresse: editingParcelle.adresse ?? '',
              latitude: editingParcelle.latitude?.toString() ?? '', longitude: editingParcelle.longitude?.toString() ?? '',
              culture: editingParcelle.culture, variete: editingParcelle.variete ?? '',
              date_semis: editingParcelle.date_semis ?? '', date_recolte_estimee: editingParcelle.date_recolte_estimee ?? '',
              type_sol: editingParcelle.type_sol ?? 'Argileux', ph_sol: editingParcelle.ph_sol?.toString() ?? '7',
              drainage: editingParcelle.drainage ?? 'Bon', fertilite: editingParcelle.fertilite ?? 'Moyenne',
              type_irrigation: editingParcelle.type_irrigation ?? 'Goutte-à-goutte', source_eau: editingParcelle.source_eau ?? 'Forage',
              statut: editingParcelle.statut,
            } : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
