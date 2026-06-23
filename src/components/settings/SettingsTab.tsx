import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { exportDashboardPDF } from '../../lib/pdfExport';
import { useParcelles } from '../../hooks/useParcelles';
import { motion } from 'framer-motion';
import {
  Bell, Globe, Sun, Moon, Monitor, Thermometer, Droplets,
  Lock, Shield, Database, Download, Mail, Smartphone, Cloud,
  AlertTriangle, CheckCircle, Loader2, ChevronRight,
  CreditCard, Clock, Ruler, X,
} from 'lucide-react';
import { PageBackground } from '../ui/PageBackground';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${checked ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 dark:border-slate-700/50">
        <div className="w-8 h-8 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function SettingsTab() {
  const { user } = useAuth();
  const { settings: notifSettings, updateSettings: updateNotif, loading: notifLoading } = useNotificationSettings(user?.id);
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { parcelles } = useParcelles(user?.id);

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');
  const [showPro, setShowPro] = useState(false);

  const handlePasswordChange = async () => {
    if (passwordForm.next !== passwordForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    if (passwordForm.next.length < 8) { setPwError('Minimum 8 caractères requis.'); return; }
    setPwSaving(true);
    setPwError('');
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.next });
      if (error) throw error;
      setPwSuccess(true);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const handleExportData = () => {
    exportDashboardPDF({ parcelles, userName: user?.email });
  };

  const themeOptions = [
    { id: 'light', label: 'Clair', icon: Sun },
    { id: 'dark', label: 'Sombre', icon: Moon },
  ];

  if (notifLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" /></div>;
  }

  return (
    <div className="relative space-y-6 animate-fade-in max-w-2xl">
      <PageBackground variant="blue" />

      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h2>
      </div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <SectionCard title="Notifications" icon={Bell}>
          <SettingRow label="Alertes par email" description="Résumés quotidiens et alertes critiques">
            <Toggle checked={notifSettings?.email_alerts ?? true} onChange={v => updateNotif({ email_alerts: v })} />
          </SettingRow>
          <SettingRow label="Alertes météo" description="Risque de gel, chaleur, tempête">
            <Toggle checked={notifSettings?.push_weather_alerts ?? true} onChange={v => updateNotif({ push_weather_alerts: v })} />
          </SettingRow>
          <SettingRow label="Alertes irrigation" description="Début, fin, anomalies d'irrigation">
            <Toggle checked={notifSettings?.push_irrigation_alerts ?? true} onChange={v => updateNotif({ push_irrigation_alerts: v })} />
          </SettingRow>
          <SettingRow label="Alertes capteurs" description="Batterie faible, capteur hors ligne">
            <Toggle checked={notifSettings?.push_sensor_alerts ?? true} onChange={v => updateNotif({ push_sensor_alerts: v })} />
          </SettingRow>
          <SettingRow label="Alertes d'humidité" description="Seuil critique atteint">
            <Toggle checked={notifSettings?.push_moisture_alerts ?? true} onChange={v => updateNotif({ push_moisture_alerts: v })} />
          </SettingRow>

          <div className="pt-2 border-t border-gray-50 dark:border-slate-700/50 space-y-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Seuils critiques</p>
            {[
              { key: 'critical_moisture_threshold' as const, label: 'Humidité sol minimale', icon: Droplets, unit: '%', min: 10, max: 60, color: 'accent-blue-500' },
              { key: 'critical_temp_high' as const, label: 'Température maximale', icon: Thermometer, unit: '°C', min: 30, max: 55, color: 'accent-red-500' },
              { key: 'critical_temp_low' as const, label: 'Température minimale', icon: Thermometer, unit: '°C', min: 0, max: 20, color: 'accent-cyan-500' },
            ].map(({ key, label, icon: Icon, unit, min, max, color }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2"><Icon className="w-4 h-4 text-gray-400" />{label}</label>
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{notifSettings?.[key] ?? (key === 'critical_moisture_threshold' ? 30 : key === 'critical_temp_high' ? 40 : 5)}{unit}</span>
                </div>
                <input type="range" min={min} max={max} step="1"
                  value={notifSettings?.[key] ?? (key === 'critical_moisture_threshold' ? 30 : key === 'critical_temp_high' ? 40 : 5)}
                  onChange={e => updateNotif({ [key]: parseFloat(e.target.value) })}
                  className={`w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer ${color}`}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      {/* Apparence */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SectionCard title="Apparence" icon={Sun}>
          <SettingRow label="Langue" description="Langue d'affichage de l'interface">
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
              {(['fr', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${lang === l ? 'bg-white dark:bg-slate-600 text-cyan-700 dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Thème" description="Couleurs de l'interface">
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
              {themeOptions.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { if (theme !== id) toggleTheme(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${theme === id ? 'bg-white dark:bg-slate-600 text-cyan-700 dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Unités de mesure" description="Hectares, °C, m³">
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-600 text-cyan-700 dark:text-cyan-400 shadow-sm">
                <Ruler className="w-3.5 h-3.5" /> Métrique
              </button>
            </div>
          </SettingRow>
        </SectionCard>
      </motion.div>

      {/* Sécurité */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionCard title="Sécurité du compte" icon={Lock}>
          {pwSuccess && (
            <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg px-3 py-2 text-sm">
              <CheckCircle className="w-4 h-4" /> Mot de passe modifié avec succès
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg px-3 py-2 text-sm">
              <AlertTriangle className="w-4 h-4" />{pwError}
            </div>
          )}
          <div className="space-y-3">
            {[
              { key: 'current', label: 'Mot de passe actuel', placeholder: '••••••••' },
              { key: 'next', label: 'Nouveau mot de passe', placeholder: 'Min. 8 caractères' },
              { key: 'confirm', label: 'Confirmer le mot de passe', placeholder: 'Répéter le mot de passe' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{label}</label>
                <input type="password" placeholder={placeholder}
                  value={passwordForm[key as keyof typeof passwordForm]}
                  onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>
            ))}
          </div>
          <button onClick={handlePasswordChange} disabled={pwSaving || !passwordForm.next}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40">
            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Modifier le mot de passe
          </button>
        </SectionCard>
      </motion.div>

      {/* Confidentialité et données */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionCard title="Confidentialité et données" icon={Database}>
          <button onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all group">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Exporter mes données</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Parcelles, capteurs, historique — format PDF</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Vos données sont sécurisées par Supabase avec chiffrement de bout en bout.
              Seules vos données vous appartiennent — accès RLS strict par utilisateur.
            </p>
          </div>
        </SectionCard>
      </motion.div>

      {/* Abonnement */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SectionCard title="Abonnement" icon={CreditCard}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Plan Gratuit</p>
                <span className="text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full">Actif</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">5 parcelles · 10 capteurs · IA limitée</p>
            </div>
            <button onClick={() => setShowPro(true)} className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              Passer Pro →
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Renouvellement automatique — aucune carte bancaire requise pour le plan gratuit
          </div>
        </SectionCard>
      </motion.div>

      {/* Modale Pro */}
      {showPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
          >
            <button
              onClick={() => setShowPro(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Passer au Plan Pro</h3>
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-3">15 000 <span className="text-base font-normal text-gray-500">FCFA / mois</span></p>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                'Parcelles illimitées',
                'Capteurs illimités',
                'IA Gemini avancée',
                'Support prioritaire 24/7',
                'Rapports PDF automatiques',
              ].map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.open('https://wa.me/237600000000?text=Je veux passer au plan Pro CherilleTech', '_blank')}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contacter via WhatsApp
            </button>
            <button
              onClick={() => setShowPro(false)}
              className="w-full mt-2 py-2.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
