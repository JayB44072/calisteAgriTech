import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import type { Profile, Parcelle } from '../../types/database';
import { Truck, Sprout, MapPin, Phone, Mail, Search } from 'lucide-react';

export function FournisseurView() {
  const { lang } = useLang();
  const [farmers, setFarmers] = useState<Profile[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('all');

  useEffect(() => {
    async function fetch() {
      const [farmersRes, parcellesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'agriculteur'),
        supabase.from('parcelles').select('*'),
      ]);
      if (farmersRes.data) setFarmers(farmersRes.data);
      if (parcellesRes.data) setParcelles(parcellesRes.data);
      setLoading(false);
    }
    fetch();
  }, []);

  const allCrops = [...new Set(parcelles.map(p => p.culture))];

  const filteredFarmers = farmers.filter(f => {
    if (search) {
      const s = search.toLowerCase();
      if (!(f.full_name?.toLowerCase().includes(s) || f.city?.toLowerCase().includes(s))) return false;
    }
    if (cropFilter !== 'all') {
      const farmerParcelles = parcelles.filter(p => p.user_id === f.id && p.culture === cropFilter);
      if (farmerParcelles.length === 0) return false;
    }
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">{lang === 'fr' ? 'Espace Fournisseur' : 'Provider Space'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{lang === 'fr' ? 'Offrez vos services aux agriculteurs' : 'Offer your services to farmers'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'fr' ? 'Rechercher un agriculteur...' : 'Search a farmer...'} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <select value={cropFilter} onChange={e => setCropFilter(e.target.value)} className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none">
          <option value="all">{lang === 'fr' ? 'Toutes les cultures' : 'All crops'}</option>
          {allCrops.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Farmers grid */}
      {filteredFarmers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <Sprout className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">{lang === 'fr' ? 'Aucun agriculteur trouvé' : 'No farmers found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map(farmer => {
            const farmerParcelles = parcelles.filter(p => p.user_id === farmer.id);
            return (
              <div key={farmer.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  {farmer.avatar_url ? <img src={farmer.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"><span className="text-primary-700 dark:text-primary-400 font-semibold text-sm">{(farmer.full_name || 'A').charAt(0)}</span></div>}
                  <div><p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{farmer.full_name || '-'}</p>{farmer.city && <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.city}</p>}</div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400"><Sprout className="w-3 h-3 inline mr-1" />{farmerParcelles.length} parcelle{farmerParcelles.length !== 1 ? 's' : ''} - {farmerParcelles.reduce((s, p) => s + Number(p.superficie), 0).toFixed(1)} ha</p>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(farmerParcelles.map(p => p.culture))].map(c => (
                      <span key={c} className="text-[10px] bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-gray-100 dark:border-slate-700 pt-3">
                  {farmer.phone && <a href={`tel:${farmer.phone}`} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"><Phone className="w-3 h-3" />{farmer.phone}</a>}
                  <a href={`mailto:${farmer.email}`} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline ml-auto"><Mail className="w-3 h-3" />{lang === 'fr' ? 'Contacter' : 'Contact'}</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
