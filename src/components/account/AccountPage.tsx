import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useParcelles } from '../../hooks/useParcelles';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import { ROLES, CULTURES } from '../../lib/constants';
import type { UserRole } from '../../types/database';
import {
  User,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sprout,
  Cpu,
  Droplets,
} from 'lucide-react';

export function AccountPage() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.id);
  const { parcelles } = useParcelles(user?.id ?? undefined);
  const { lang } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', city: '', farm_address: '', farm_size: '', primary_crop: '', role: 'agriculteur' as UserRole,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [aiDiagnoses, setAiDiagnoses] = useState(0);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        farm_address: profile.farm_address ?? '',
        farm_size: profile.farm_size?.toString() ?? '',
        primary_crop: profile.primary_crop ?? '',
        role: profile.role,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      supabase.from('ai_activity_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => setAiDiagnoses(count ?? 0));
    }
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        full_name: form.full_name || null,
        phone: form.phone || null,
        city: form.city || null,
        farm_address: form.farm_address || null,
        farm_size: form.farm_size ? parseFloat(form.farm_size) : null,
        primary_crop: form.primary_crop || null,
        role: form.role,
      });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await updateProfile({ avatar_url: publicUrl + '?t=' + Date.now() });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" /></div>;

  const activeIrrigation = parcelles.filter(p => p.irrigation_active).length;
  const monthsSince = profile?.created_at ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 1;

  const roleInfo = ROLES[form.role];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">{lang === 'fr' ? 'Mon Compte' : 'My Account'}</h2>

      {success && <p className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" />{lang === 'fr' ? 'Profil mis à jour !' : 'Profile updated!'}</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

      {/* Avatar + Name */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600" />
            ) : (
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-400 font-bold text-2xl">{(form.full_name || 'U').charAt(0).toUpperCase()}</span>
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">{form.full_name || user?.email}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
            <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium ${roleInfo.color} ${roleInfo.bg} px-2 py-0.5 rounded-full`}>
              {lang === 'fr' ? roleInfo.label : roleInfo.labelEn}
            </span>
          </div>
        </div>
      </div>

      {/* AI Activity Briefing */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl p-5">
        <h3 className="font-semibold text-primary-700 dark:text-primary-400 text-sm mb-2 flex items-center gap-2"><Cpu className="w-4 h-4" />{lang === 'fr' ? 'Résumé d\'activité IA' : 'AI Activity Briefing'}</h3>
        <p className="text-sm text-gray-700 dark:text-slate-300">
          {lang === 'fr'
            ? `Membre depuis ${monthsSince} mois, ${parcelles.length} parcelle${parcelles.length !== 1 ? 's' : ''} active${parcelles.length !== 1 ? 's' : ''}, ${aiDiagnoses} diagnostic${aiDiagnoses !== 1 ? 's' : ''} IA effectué${aiDiagnoses !== 1 ? 's' : ''}, Statut d'irrigation : ${activeIrrigation > 0 ? `${activeIrrigation} active${activeIrrigation !== 1 ? 's' : ''}` : 'aucune active'}.`
            : `Member for ${monthsSince} month${monthsSince !== 1 ? 's' : ''}, ${parcelles.length} active parcel${parcelles.length !== 1 ? 's' : ''}, ${aiDiagnoses} AI diagnosis performed, Irrigation status: ${activeIrrigation > 0 ? `${activeIrrigation} active` : 'none active'}.`
          }
        </p>
      </div>

      {/* Editable fields */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm flex items-center gap-2"><User className="w-4 h-4 text-gray-500 dark:text-slate-400" />{lang === 'fr' ? 'Informations du profil' : 'Profile Information'}</h3>
          {!editing && <button onClick={() => setEditing(true)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">{lang === 'fr' ? 'Modifier' : 'Edit'}</button>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Nom complet' : 'Full Name'}</label>
            <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Rôle' : 'Role'}</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none">
              {Object.entries(ROLES).map(([key, val]) => <option key={key} value={key}>{lang === 'fr' ? val.label : val.labelEn}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Téléphone' : 'Phone'}</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Ville' : 'City'}</label>
            <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Adresse exploitation' : 'Farm Address'}</label>
            <input type="text" value={form.farm_address} onChange={e => setForm(p => ({ ...p, farm_address: e.target.value }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Superficie (ha)' : 'Farm Size (ha)'}</label>
            <input type="number" step="0.1" value={form.farm_size} onChange={e => setForm(p => ({ ...p, farm_size: e.target.value }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Culture principale' : 'Primary Crop'}</label>
            <select value={form.primary_crop} onChange={e => setForm(p => ({ ...p, primary_crop: e.target.value }))} disabled={!editing} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 disabled:opacity-60 outline-none">
              <option value="">-</option>
              {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {lang === 'fr' ? 'Sauvegarder' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); if (profile) setForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '', city: profile.city ?? '', farm_address: profile.farm_address ?? '', farm_size: profile.farm_size?.toString() ?? '', primary_crop: profile.primary_crop ?? '', role: profile.role }); }} className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
