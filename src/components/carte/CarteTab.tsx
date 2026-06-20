import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useParcelles } from '../../hooks/useParcelles';
import { Layers, Search, Crosshair, MapPin, Loader2 } from 'lucide-react';

// Fix Tailwind preflight breaking Leaflet tile images
const style = document.createElement('style');
style.textContent = '.leaflet-container img { max-width: none !important; max-height: none !important; }';
document.head.appendChild(style);

// Fix broken default marker icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TILE_LAYERS = {
  osm:       { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                          attribution: '© OpenStreetMap contributors', label: 'Plan'      },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',               attribution: 'Tiles © Esri',                 label: 'Satellite' },
  topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                                           attribution: '© OpenTopoMap',                label: 'Topo'      },
};

const CULTURE_COLORS: Record<string, string> = {
  Tomates: '#ef4444', Maïs: '#f59e0b', Manioc: '#8b5cf6', Riz: '#3b82f6',
  Poivrons: '#f97316', Café: '#92400e', Cacao: '#78350f', Igname: '#059669',
  Sorgho: '#d97706', Arachides: '#b45309', Plantain: '#65a30d', Haricots: '#16a34a',
  Oignons: '#9333ea', Piment: '#dc2626', Gombo: '#15803d', 'Patate douce': '#ea580c',
  'Légumes verts': '#16a34a', Autre: '#6b7280',
};

const CULTURE_ICONS: Record<string, string> = {
  Tomates: '🍅', Maïs: '🌽', Manioc: '🌿', Riz: '🌾', Poivrons: '🫑', Café: '☕',
  Cacao: '🍫', Igname: '🥔', Sorgho: '🌾', Arachides: '🥜', Plantain: '🍌',
  Haricots: '🫘', Oignons: '🧅', Piment: '🌶️', Gombo: '🌿', 'Patate douce': '🍠',
  'Légumes verts': '🥬', Autre: '🌱',
};

function createParcelleIcon(culture: string, color: string) {
  const emoji = CULTURE_ICONS[culture] ?? '🌱';
  return L.divIcon({
    className: '',
    html: `<div style="width:40px;height:40px;border-radius:50%;background:white;border:3px solid ${color};box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1">${emoji}</div>`,
    iconSize:    [40, 40],
    iconAnchor:  [20, 40],
    popupAnchor: [0, -42],
  });
}

export function CarteTab({ userId }: { userId: string }) {
  const { parcelles, loading } = useParcelles(userId);
  const [layer, setLayer] = useState<keyof typeof TILE_LAYERS>('osm');
  const mapRef   = useRef<HTMLDivElement>(null);
  const mapObj   = useRef<L.Map | null>(null);
  const tileRef  = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const parcellesWithCoords = parcelles.filter(p => p.latitude && p.longitude);
  const defaultCenter: [number, number] = parcellesWithCoords.length > 0
    ? [parcellesWithCoords[0].latitude!, parcellesWithCoords[0].longitude!]
    : [3.848, 11.502];

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    const map = L.map(mapRef.current, {
      center:   defaultCenter,
      zoom:     13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    tileRef.current = L.tileLayer(TILE_LAYERS[layer].url, {
      attribution: TILE_LAYERS[layer].attribution,
    }).addTo(map);

    mapObj.current = map;

    return () => {
      map.remove();
      mapObj.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layer when user changes it
  useEffect(() => {
    if (!mapObj.current) return;
    if (tileRef.current) {
      mapObj.current.removeLayer(tileRef.current);
    }
    tileRef.current = L.tileLayer(TILE_LAYERS[layer].url, {
      attribution: TILE_LAYERS[layer].attribution,
    }).addTo(mapObj.current);
  }, [layer]);

  // Add/refresh markers when parcelles load
  useEffect(() => {
    if (!mapObj.current || loading) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    parcellesWithCoords.forEach(p => {
      const color  = CULTURE_COLORS[p.culture] ?? '#16a34a';
      const marker = L.marker([p.latitude!, p.longitude!], { icon: createParcelleIcon(p.culture, color) });

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:8px;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:32px;height:32px;border-radius:8px;background:${color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
              <p style="font-weight:700;color:#111;font-size:14px;margin:0">${p.nom}</p>
              <p style="color:#6b7280;font-size:12px;margin:0">${p.culture} · ${p.superficie} ha</p>
            </div>
          </div>
          ${p.zone ? `<p style="font-size:12px;color:#6b7280;margin:4px 0">📍 ${p.zone}</p>` : ''}
          ${p.irrigation_active ? `<p style="font-size:12px;color:#2563eb;margin:4px 0">💧 Irrigation active</p>` : ''}
          <p style="font-size:12px;font-weight:600;color:${p.statut === 'active' ? '#16a34a' : '#9ca3af'};margin:4px 0">● ${p.statut === 'active' ? 'Active' : p.statut}</p>
        </div>
      `);

      marker.addTo(mapObj.current!);
      markersRef.current.push(marker);
    });

    // Fit bounds if multiple parcelles
    if (parcellesWithCoords.length > 1) {
      const bounds = L.latLngBounds(parcellesWithCoords.map(p => [p.latitude!, p.longitude!]));
      mapObj.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [parcelles, loading]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Carte agricole</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {parcellesWithCoords.length} parcelle{parcellesWithCoords.length !== 1 ? 's' : ''} localisée{parcellesWithCoords.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
          {Object.entries(TILE_LAYERS).map(([key, val]) => (
            <button key={key} onClick={() => setLayer(key as keyof typeof TILE_LAYERS)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                layer === key ? 'bg-white dark:bg-slate-600 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'
              }`}>
              <Layers className="w-3.5 h-3.5" />{val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden" style={{ height: '520px' }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-800/80">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Location button */}
        <button
          onClick={() => mapObj.current?.locate({ setView: true, maxZoom: 14 })}
          className="absolute bottom-6 right-3 z-[1000] w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
          title="Ma position"
        >
          <Crosshair className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        </button>

        {/* Parcelle search */}
        <ParcelleSearchBox parcelles={parcellesWithCoords} mapRef={mapObj} />

        {/* Actual map div */}
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Sensor simulation notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">📡</span>
        <div>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Capteurs en mode simulation</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-500/80">Les données de température et d'humidité sont simulées. Connectez un vrai capteur IoT pour recevoir des données en temps réel.</p>
        </div>
      </div>

      {/* Legend */}
      {parcellesWithCoords.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">Légende des parcelles</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {parcellesWithCoords.map(p => (
              <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CULTURE_COLORS[p.culture] ?? '#16a34a' }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{p.nom}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{p.culture} · {p.superficie} ha</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {parcellesWithCoords.length === 0 && !loading && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-8 text-center">
          <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Aucune parcelle localisée</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
            Ajoutez des coordonnées GPS à vos parcelles pour les afficher sur la carte
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Parcelle search box ──────────────────────────────────────────────────────
interface ParcelleCoord { id: string; nom: string; culture: string; latitude: number; longitude: number; }
function ParcelleSearchBox({ parcelles, mapRef }: { parcelles: ParcelleCoord[]; mapRef: React.RefObject<L.Map | null> }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim().length > 0
    ? parcelles.filter(p => p.nom.toLowerCase().includes(query.toLowerCase()) || p.culture.toLowerCase().includes(query.toLowerCase()))
    : [];

  const select = (p: ParcelleCoord) => {
    mapRef.current?.setView([p.latitude, p.longitude], 16);
    setQuery('');
  };

  return (
    <div className="absolute top-3 left-3 z-[1000] w-72">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher une parcelle..."
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm shadow-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>
      {filtered.length > 0 && (
        <div className="mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {filtered.map(p => (
            <button key={p.id} onClick={() => select(p)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0 flex items-center gap-3">
              <span className="text-xl">{CULTURE_ICONS[p.culture] ?? '🌱'}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{p.nom}</p>
                <p className="text-xs text-gray-400">{p.culture}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {query.trim().length > 0 && filtered.length === 0 && (
        <div className="mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
          <p className="text-sm text-gray-400">Aucune parcelle trouvée</p>
        </div>
      )}
    </div>
  );
}
