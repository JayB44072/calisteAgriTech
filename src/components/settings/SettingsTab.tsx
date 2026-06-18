import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  User,
  Key,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bell,
  BellOff,
  Globe,
  Sun,
  Moon,
  Thermometer,
  Droplets,
  Sliders,
} from 'lucide-react';

interface UserSettings {
  gemini_api_key: string;
}

export function SettingsTab() {
  const { user } = useAuth();
  const { settings: notifSettings, updateSettings: updateNotif, loading: notifLoading } = useNotificationSettings(user?.id);
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();

  const [apiKeySettings, setApiKeySettings] = useState<UserSettings>({ gemini_api_key: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('user_settings').select('gemini_api_key').eq('user_id', user?.id).single();
      if (data) setApiKeySettings({ gemini_api_key: data.gemini_api_key ?? '' });
      setLoading(false);
    }
    if (user) loadSettings();
  }, [user]);

  const handleSaveApiKey = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { error: upsertError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user!.id,
          gemini_api_key: apiKeySettings.gemini_api_key || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (upsertError) throw upsertError;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = async (field: 'email_alerts' | 'push_moisture_alerts', value: boolean) => {
    try {
      await updateNotif({ [field]: value });
    } catch { /* silent */ }
  };

  const updateThreshold = async (field: 'critical_moisture_threshold' | 'critical_temp_high' | 'critical_temp_low', value: number) => {
    try {
      await updateNotif({ [field]: value });
    } catch { /* silent */ }
  };

  if (loading || notifLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">{lang === 'fr' ? 'Paramètres' : 'Settings'}</h2>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          {lang === 'fr' ? 'Notifications' : 'Notifications'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{lang === 'fr' ? 'Alertes par e-mail' : 'Email Alerts'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{lang === 'fr' ? 'Recevez des résumés quotidiens' : 'Receive daily summaries'}</p>
            </div>
            <button
              onClick={() => toggleNotif('email_alerts', !notifSettings?.email_alerts)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifSettings?.email_alerts ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifSettings?.email_alerts ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{lang === 'fr' ? 'Alertes critiques d\'humidité' : 'Critical Moisture Alerts'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{lang === 'fr' ? 'Notifications push urgentes' : 'Urgent push notifications'}</p>
            </div>
            <button
              onClick={() => toggleNotif('push_moisture_alerts', !notifSettings?.push_moisture_alerts)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifSettings?.push_moisture_alerts ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifSettings?.push_moisture_alerts ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* System Parameters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          {lang === 'fr' ? 'Seuils critiques' : 'Critical Thresholds'}
        </h3>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                {lang === 'fr' ? 'Humidité du sol minimale' : 'Min Soil Moisture'}
              </label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{notifSettings?.critical_moisture_threshold ?? 30}%</span>
            </div>
            <input
              type="range" min="10" max="60" step="1"
              value={notifSettings?.critical_moisture_threshold ?? 30}
              onChange={e => updateThreshold('critical_moisture_threshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                {lang === 'fr' ? 'Température maximale' : 'Max Temperature'}
              </label>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{notifSettings?.critical_temp_high ?? 40}°C</span>
            </div>
            <input
              type="range" min="30" max="50" step="0.5"
              value={notifSettings?.critical_temp_high ?? 40}
              onChange={e => updateThreshold('critical_temp_high', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-500" />
                {lang === 'fr' ? 'Température minimale' : 'Min Temperature'}
              </label>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{notifSettings?.critical_temp_low ?? 10}°C</span>
            </div>
            <input
              type="range" min="0" max="20" step="0.5"
              value={notifSettings?.critical_temp_low ?? 10}
              onChange={e => updateThreshold('critical_temp_low', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Interface Configuration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          {lang === 'fr' ? 'Interface' : 'Interface'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{lang === 'fr' ? 'Langue' : 'Language'}</p>
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button onClick={() => setLang('fr')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${lang === 'fr' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>FR</button>
              <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>EN</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{lang === 'fr' ? 'Thème' : 'Theme'}</p>
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button onClick={() => { if (theme === 'dark') toggleTheme(); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}><Sun className="w-3 h-3" /> Clair</button>
              <button onClick={() => { if (theme === 'light') toggleTheme(); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}><Moon className="w-3 h-3" /> Sombre</button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          {lang === 'fr' ? 'Clé API Gemini' : 'Gemini API Key'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
          {lang === 'fr' ? 'Votre clé API Google Gemini est utilisée pour les fonctionnalités IA (chatbot, analyse, calendrier). Elle est stockée de manière sécurisée.' : 'Your Google Gemini API key is used for AI features (chatbot, analysis, calendar). It is stored securely.'}
        </p>
        <div className="flex gap-2">
          <input type="password" value={apiKeySettings.gemini_api_key} onChange={e => setApiKeySettings(prev => ({ ...prev, gemini_api_key: e.target.value }))} placeholder={lang === 'fr' ? 'Entrez votre clé API Gemini' : 'Enter your Gemini API key'} className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50 font-mono outline-none focus:ring-2 focus:ring-primary-500/30" />
          <button onClick={handleSaveApiKey} disabled={saving} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        </div>
        {saved && <p className="mt-2 text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Clé API sauvegardée' : 'API key saved'}</p>}
        {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
      </div>
    </div>
  );
}
