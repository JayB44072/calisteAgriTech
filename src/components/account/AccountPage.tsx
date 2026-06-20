import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useParcelles } from '../../hooks/useParcelles';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import { ROLES, CULTURES } from '../../lib/constants';
import type { UserRole } from '../../types/database';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Camera, Save, Loader2, CheckCircle, AlertCircle, Sprout,
  Cpu, Droplets, MapPin, Phone, Mail, Calendar, Shield, Edit3,
  X, Building2, Ruler, Star, Activity, Award, TrendingUp, Clock,
} from 'lucide-react';
import { PageBackground } from '../ui/PageBackground';

const ROLE_LABELS: Record<string, { fr: string; color: string; bg: string; icon: any }> = {
  agriculteur: { fr: 'Agriculteur', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: Sprout },
  gestionnaire: { fr: 'Gestionnaire', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: Building2 },
  fournisseur: { fr: 'Fournisseur', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: Star },
  admin: { fr: 'Administrateur', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: Shield },
  technicien: { fr: 'Technicien IoT', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', icon: Cpu },
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function AccountPage() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.id);
  const { parcelles } = useParcelles(user?.id ?? undefined);
  const { lang } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showEditPanel, setShowEditPanel] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', city: '', farm_address: '', farm_size: '', primary_crop: '', role: 'agriculteur' as UserRole,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [aiDiagnoses, setAiDiagnoses] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
      supabase.from('ai_activity_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        .then(({ count }) => setAiDiagnoses(count ?? 0));
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
      setShowEditPanel(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Prévisualisation immédiate
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploading(true);
    setError('');

    try {
      // Supprimer toutes les anciennes photos de ce user (quelle que soit l'extension)
      const { data: existing } = await supabase.storage
        .from('avatars')
        .list(user.id);
      if (existing && existing.length > 0) {
        const oldPaths = existing.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(oldPaths);
      }

      // Uploader la nouvelle photo dans un sous-dossier par userId
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await updateProfile({ avatar_url: publicUrl + '?t=' + Date.now() });
    } catch (err: any) {
      setAvatarPreview(null);
      const msg = err.message ?? '';
      if (msg.includes('Bucket not found') || msg.includes('404') || msg.includes('not found')) {
        setError('Bucket "avatars" introuvable — créez-le dans Supabase Dashboard → Storage → New bucket → "avatars" (public)');
      } else {
        setError(msg || 'Erreur lors de l\'upload');
      }
    } finally {
      setUploading(false);
      // Réinitialiser le champ fichier pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  const activeIrrigation = parcelles.filter(p => p.irrigation_active).length;
  const monthsSince = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const totalSuperficie = parcelles.reduce((s, p) => s + Number(p.superficie), 0);
  const roleInfo = ROLE_LABELS[form.role] ?? ROLE_LABELS.agriculteur;
  const displayAvatar = avatarPreview || profile?.avatar_url;
  const displayName = form.full_name || profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '—';

  return (
    <div className="relative space-y-6 animate-fade-in max-w-4xl">
      <PageBackground variant="green" />

      {/* Header hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 text-white overflow-hidden shadow-xl shadow-emerald-600/20"
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%"><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#dots)" /></svg>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl">
              {displayAvatar ? (
                <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
                <roleInfo.icon className="w-3.5 h-3.5" />
                {roleInfo.fr}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {user?.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</span>}
              {form.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{form.city}</span>}
              {form.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{form.phone}</span>}
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Membre depuis {memberSince}</span>
            </div>
          </div>

          <button
            onClick={() => setShowEditPanel(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg"
          >
            <Edit3 className="w-4 h-4" />
            Modifier le profil
          </button>
        </div>
      </motion.div>

      {/* Success message */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4" /> Profil mis à jour avec succès !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sprout} label="Parcelles actives" value={parcelles.length} color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Ruler} label="Surface totale" value={`${totalSuperficie.toFixed(1)} ha`} color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard icon={Droplets} label="Irrigation active" value={activeIrrigation} color="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" />
        <StatCard icon={Cpu} label="Diagnostics IA" value={aiDiagnoses} color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
      </motion.div>

      {/* Info cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Informations personnelles */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" /> Informations personnelles
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Nom complet', value: form.full_name || '—', icon: User },
              { label: 'Email', value: user?.email || '—', icon: Mail },
              { label: 'Téléphone', value: form.phone || '—', icon: Phone },
              { label: 'Ville', value: form.city || '—', icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exploitation agricole */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
            <Sprout className="w-4 h-4 text-gray-400" /> Exploitation agricole
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Adresse exploitation', value: form.farm_address || '—', icon: Building2 },
              { label: 'Superficie totale', value: form.farm_size ? `${form.farm_size} ha` : '—', icon: Ruler },
              { label: 'Culture principale', value: form.primary_crop || '—', icon: Sprout },
              { label: 'Membre depuis', value: memberSince, icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activité récente */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-4">
          <Activity className="w-4 h-4 text-gray-400" /> Résumé d'activité
        </h3>
        <div className="flex items-start gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Membre actif</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {monthsSince === 0 ? 'Inscrit récemment' : `Connecté depuis ${monthsSince} mois`} · {parcelles.length} parcelle{parcelles.length > 1 ? 's' : ''} ·
              {activeIrrigation > 0 ? ` ${activeIrrigation} irrigation${activeIrrigation > 1 ? 's' : ''} active${activeIrrigation > 1 ? 's' : ''} ·` : ''}
              {' '}{aiDiagnoses} diagnostic{aiDiagnoses > 1 ? 's' : ''} IA
            </p>
          </div>
        </div>
      </motion.div>

      {/* Panneau latéral d'édition */}
      <AnimatePresence>
        {showEditPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowEditPanel(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Modifier le profil</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Vos informations personnelles</p>
                </div>
                <button onClick={() => setShowEditPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg px-3 py-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                  </div>
                )}

                {[
                  { key: 'full_name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont' },
                  { key: 'phone', label: 'Téléphone', type: 'tel', placeholder: '+237 6XX XXX XXX' },
                  { key: 'city', label: 'Ville', type: 'text', placeholder: 'Yaoundé' },
                  { key: 'farm_address', label: 'Adresse exploitation', type: 'text', placeholder: 'Zone Nord, Yaoundé' },
                  { key: 'farm_size', label: 'Superficie totale (ha)', type: 'number', placeholder: '5.0' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Culture principale</label>
                  <select value={form.primary_crop} onChange={e => setForm(p => ({ ...p, primary_crop: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30">
                    <option value="">— Sélectionner —</option>
                    {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Rôle</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30">
                    {Object.entries(ROLES).map(([key, val]) => <option key={key} value={key}>{lang === 'fr' ? val.label : val.labelEn}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={() => setShowEditPanel(false)}
                  className="px-5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
