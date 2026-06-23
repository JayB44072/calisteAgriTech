import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import type { Profile, SupportTicket } from '../../types/database';
import {
  Users, BarChart3, Headphones, Shield, Search, Send, Ban, CheckCircle,
  Clock, AlertTriangle, Loader2, Trash2, Activity, RefreshCw, ChevronRight,
  UserCheck, UserX, Wifi, WifiOff, MessageSquare, LogIn, MoreVertical,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

type AdminTab = 'users' | 'telemetry' | 'support' | 'stats';

interface ProfileExtended extends Profile {
  status?: 'active' | 'suspended' | 'deleted';
  blocked_until?: string | null;
  deleted_at?: string | null;
}

interface LoginLog {
  id: string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failed';
  created_at: string;
}

const BLOCK_DURATIONS = [
  { label: '1 heure', hours: 1 },
  { label: '3 heures', hours: 3 },
  { label: '12 heures', hours: 12 },
  { label: '24 heures', hours: 24 },
  { label: '3 jours', hours: 72 },
  { label: '7 jours', hours: 168 },
  { label: 'Permanent', hours: 0 },
];

export function AdminDashboard() {
  const { lang } = useLang();
  const [tab, setTab] = useState<AdminTab>('users');

  const tabs = [
    { id: 'stats' as AdminTab, label: 'Stats', icon: BarChart3 },
    { id: 'users' as AdminTab, label: 'Utilisateurs', icon: Users },
    { id: 'telemetry' as AdminTab, label: 'Télémétrie', icon: Activity },
    { id: 'support' as AdminTab, label: 'Support', icon: Headphones },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Dashboard Admin</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Gestion globale de la plateforme</p>
        </div>
      </div>

      {/* Mobile: scrollable tab bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              tab === t.id ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'
            }`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'stats'     && <StatsPanel />}
      {tab === 'users'     && <UsersPanel />}
      {tab === 'telemetry' && <TelemetryPanel />}
      {tab === 'support'   && <SupportPanel />}
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────

function StatsPanel() {
  const [stats, setStats] = useState({ users: 0, parcelles: 0, sensorReadings: 0, tickets: 0 });
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, p, s, t, logs] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('parcelles').select('id', { count: 'exact', head: true }),
        supabase.from('sensor_readings').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }),
        supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      setStats({ users: u.count ?? 0, parcelles: p.count ?? 0, sensorReadings: s.count ?? 0, tickets: t.count ?? 0 });
      if (!logs.error && logs.data) setLoginLogs(logs.data);
      setLoading(false);
    }
    load();
  }, []);

  // Real daily activity from sensor_readings
  const [activityData, setActivityData] = useState<Array<{ day: string; lectures: number; connexions: number }>>([]);

  useEffect(() => {
    async function loadActivity() {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase.from('sensor_readings').select('created_at').gte('created_at', since);
      const countByDay: Record<string, number> = {};
      (data ?? []).forEach(r => {
        const day = r.created_at.slice(0, 10);
        countByDay[day] = (countByDay[day] ?? 0) + 1;
      });

      const logSince = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: logData } = await supabase.from('login_logs').select('created_at').gte('created_at', logSince);
      const logsByDay: Record<string, number> = {};
      (logData ?? []).forEach(r => {
        const day = r.created_at.slice(0, 10);
        logsByDay[day] = (logsByDay[day] ?? 0) + 1;
      });

      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
        return {
          day: new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' }),
          lectures: countByDay[d] ?? 0,
          connexions: logsByDay[d] ?? 0,
        };
      });
      setActivityData(days);
    }
    loadActivity();
  }, []);

  const kpis = [
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Parcelles', value: stats.parcelles, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Lectures capteurs', value: stats.sensorReadings, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Tickets support', value: stats.tickets, icon: Headphones, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const tooltipStyle = { fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className={`${kpi.bg} rounded-xl p-4`}>
            <kpi.icon className={`w-4 h-4 ${kpi.color} mb-2`} />
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-3">Activité (7 jours)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="sConn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
              <linearGradient id="sLec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="connexions" stroke="#6366f1" fill="url(#sConn)" strokeWidth={2} name="Connexions" />
            <Area type="monotone" dataKey="lectures" stroke="#22c55e" fill="url(#sLec)" strokeWidth={2} name="Lectures capteurs" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Real login history */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
          <LogIn className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Historique connexions</h3>
        </div>
        {loginLogs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400 dark:text-slate-500">
            Aucune connexion enregistrée. Exécutez <code className="text-xs bg-gray-100 dark:bg-slate-700 px-1 rounded">supabase/admin_features.sql</code> pour activer.
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {loginLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${log.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {log.status === 'success' ? <Wifi className="w-3.5 h-3.5 text-green-600" /> : <WifiOff className="w-3.5 h-3.5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate">{log.email ?? '—'}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">{log.ip_address ?? '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  <span className={`text-xs font-medium ${log.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {log.status === 'success' ? 'Succès' : 'Échec'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────────────────────────

function BlockModal({ user, onClose, onBlock }: {
  user: ProfileExtended;
  onClose: () => void;
  onBlock: (userId: string, hours: number) => Promise<void>;
}) {
  const [selected, setSelected] = useState(24);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onBlock(user.id, selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-5"
        onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 mb-1">Suspendre {user.full_name || user.email}</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">L'utilisateur ne pourra plus écrire de données. Il recevra une notification.</p>
        <div className="space-y-1.5 mb-4">
          {BLOCK_DURATIONS.map(d => (
            <button key={d.hours} onClick={() => setSelected(d.hours)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selected === d.hours ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'}`}>
              {d.label} {d.hours === 0 && '⚠️'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handle} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Suspendre
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg text-sm">
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteModal({ user, onClose, onDelete }: {
  user: ProfileExtended;
  onClose: () => void;
  onDelete: (userId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onDelete(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-5"
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-center mb-1">Supprimer ce compte ?</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 text-center mb-4">
          <strong>{user.full_name || user.email}</strong> recevra un email et verra "Compte supprimé" à sa prochaine connexion. Cette action est irréversible.
        </p>
        <div className="flex gap-2">
          <button onClick={handle} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Supprimer définitivement
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg text-sm">
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function UserCard({ user, onBlock, onUnblock, onDelete }: {
  user: ProfileExtended;
  onBlock: (u: ProfileExtended) => void;
  onUnblock: (userId: string) => void;
  onDelete: (u: ProfileExtended) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isSuspended = user.status === 'suspended' || (user.blocked_until && new Date(user.blocked_until) > new Date());
  const isDeleted = user.status === 'deleted';

  const roleColor: Record<string, string> = {
    agriculteur: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    gestionnaire: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    fournisseur: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    technicien: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-800 rounded-xl border p-4 relative ${isDeleted ? 'border-red-200 dark:border-red-800/40 opacity-60' : isSuspended ? 'border-amber-200 dark:border-amber-800/40' : 'border-gray-200 dark:border-slate-700'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {user.avatar_url
          ? <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          : <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">{(user.full_name || user.email || 'U').charAt(0).toUpperCase()}</span>
            </div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user.full_name || '(sans nom)'}</p>
            {isSuspended && <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Ban className="w-2.5 h-2.5" /> Suspendu</span>}
            {isDeleted && <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">Supprimé</span>}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[user.role] ?? roleColor.agriculteur}`}>{user.role}</span>
            <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
            {isSuspended && user.blocked_until && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Jusqu'au {new Date(user.blocked_until).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Menu 3 points */}
        {!isDeleted && (
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-1 w-44">
                    {isSuspended ? (
                      <button onClick={() => { onUnblock(user.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                        <UserCheck className="w-3.5 h-3.5" /> Réactiver
                      </button>
                    ) : (
                      <button onClick={() => { onBlock(user); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        <Ban className="w-3.5 h-3.5" /> Suspendre
                      </button>
                    )}
                    <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                    <button onClick={() => { onDelete(user); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<ProfileExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockTarget, setBlockTarget] = useState<ProfileExtended | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfileExtended | null>(null);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { console.error('[loadUsers]', error); alert('Erreur chargement users: ' + error.message); }
    if (data) setUsers(data as ProfileExtended[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleBlock = async (userId: string, hours: number) => {
    const blockedUntil = hours === 0 ? null : new Date(Date.now() + hours * 3600000).toISOString();
    const { error } = await supabase.from('profiles').update({
      status: 'suspended',
      blocked_until: blockedUntil,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    if (error) { console.error('[handleBlock]', error); alert('Erreur suspension: ' + error.message); return; }

    await supabase.from('notifications').insert({
      user_id: userId,
      titre: 'Compte suspendu',
      message: hours === 0
        ? 'Votre compte a été suspendu de façon permanente. Contactez le support.'
        : `Votre compte est suspendu pour ${BLOCK_DURATIONS.find(d => d.hours === hours)?.label}. Contactez le support.`,
      type: 'alerte',
    });

    await loadUsers();
  };

  const handleUnblock = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({
      status: 'active',
      blocked_until: null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    if (error) { console.error('[handleUnblock]', error); alert('Erreur réactivation: ' + error.message); return; }

    await supabase.from('notifications').insert({
      user_id: userId,
      titre: 'Compte réactivé',
      message: 'Votre compte a été réactivé. Vous pouvez à nouveau accéder à toutes les fonctionnalités.',
      type: 'succes',
    });

    await loadUsers();
  };

  const handleDelete = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    if (error) { console.error('[handleDelete]', error); alert('Erreur suppression: ' + error.message); return; }

    await supabase.from('notifications').insert({
      user_id: userId,
      titre: 'Compte supprimé',
      message: 'Votre compte CalisteAgriTech a été supprimé par l\'administrateur. Contactez le support si c\'est une erreur.',
      type: 'alerte',
    });

    await loadUsers();
  };

  const filtered = users.filter(u => {
    if (u.status === 'deleted') return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur…"
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30" />
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500">{filtered.length} utilisateur(s)</p>

      <div className="space-y-3">
        {filtered.map(u => (
          <UserCard key={u.id} user={u}
            onBlock={setBlockTarget}
            onUnblock={handleUnblock}
            onDelete={setDeleteTarget}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-sm text-gray-400 dark:text-slate-500">Aucun utilisateur trouvé</div>
        )}
      </div>

      <AnimatePresence>
        {blockTarget && (
          <BlockModal user={blockTarget} onClose={() => setBlockTarget(null)}
            onBlock={handleBlock} />
        )}
        {deleteTarget && (
          <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)}
            onDelete={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TELEMETRY ───────────────────────────────────────────────────────────────

function TelemetryPanel() {
  const [chartData, setChartData] = useState<Array<Record<string, string | number>>>([]);
  const [topParcelles, setTopParcelles] = useState<Array<{ id: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - 100 * 3600000).toISOString();
    const { data } = await supabase.from('sensor_readings')
      .select('created_at,temperature_air,humidite_sol,parcelle_id')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(200);

    if (data) {
      setChartData(data.reverse().slice(0, 60).map(d => ({
        time: new Date(d.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        temperature: d.temperature_air ?? 0,
        humidite_sol: d.humidite_sol ?? 0,
      })).reverse());

      // Top parcelles by readings
      const counts: Record<string, number> = {};
      data.forEach(d => { if (d.parcelle_id) counts[d.parcelle_id] = (counts[d.parcelle_id] ?? 0) + 1; });
      setTopParcelles(Object.entries(counts).map(([id, count]) => ({ id: id.slice(0, 8) + '…', count })).sort((a, b) => b.count - a.count).slice(0, 5));
    }
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const tooltipStyle = { fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Qu'est-ce que la télémétrie ?
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Collecte automatique et silencieuse de métriques d'usage : fréquence des lectures capteurs, parcelles les plus actives, tendances de température/humidité sur la plateforme. Ces données aident à optimiser les ressources et détecter les anomalies.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-slate-500">
          Dernière actualisation : {lastRefresh.toLocaleTimeString('fr-FR')}
        </p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Rafraîchir
        </button>
      </div>

      {loading && !chartData.length ? <LoadingSpinner /> : (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-3">Température globale (100h)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="tTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" interval={9} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="°C" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#tTemp)" strokeWidth={2} name="Température (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-3">Humidité sol globale (100h)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="tHum" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" interval={9} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="humidite_sol" stroke="#3b82f6" fill="url(#tHum)" strokeWidth={2} name="Humidité sol (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {topParcelles.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-3">Parcelles les plus actives</h3>
              <div className="space-y-2">
                {topParcelles.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-slate-500 w-4 font-mono">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-mono text-gray-700 dark:text-slate-300">{p.id}</span>
                        <span className="text-xs text-gray-400">{p.count} lectures</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(p.count / (topParcelles[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SUPPORT ─────────────────────────────────────────────────────────────────

function SupportPanel() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTickets(data as unknown as SupportTicket[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTickets();
    // Realtime: new ticket arrives
    const channel = supabase
      .channel('admin-support')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, () => {
        loadTickets();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadTickets]);

  const handleReply = async (ticket: SupportTicket) => {
    if (!replyText.trim()) return;
    setSending(true);
    await supabase.from('support_tickets').update({
      admin_reply: replyText,
      statut: 'en_cours',
      replied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', ticket.id);

    // Notification directe à l'utilisateur (le trigger DB fait aussi ça, double sécurité)
    await supabase.from('notifications').insert({
      user_id: ticket.user_id,
      titre: 'Réponse support',
      message: `L'équipe a répondu à votre ticket "${ticket.subject.slice(0, 40)}"`,
      type: 'succes',
      metadata: { ticket_id: ticket.id },
    });

    await loadTickets();
    setReplyingId(null);
    setReplyText('');
    setSending(false);
  };

  const updateStatus = async (ticketId: string, statut: string) => {
    await supabase.from('support_tickets').update({ statut, updated_at: new Date().toISOString() }).eq('id', ticketId);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, statut: statut as any } : t));
  };

  const statusMeta: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    ouvert:   { label: 'Ouvert',   color: 'text-amber-600', icon: Clock },
    en_cours: { label: 'En cours', color: 'text-blue-600',  icon: Loader2 },
    resolu:   { label: 'Résolu',   color: 'text-green-600', icon: CheckCircle },
    ferme:    { label: 'Fermé',    color: 'text-gray-400',  icon: Ban },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-slate-500">{tickets.length} ticket(s) — en temps réel</p>
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-10 text-center">
          <Headphones className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Aucun ticket de support</p>
        </div>
      ) : tickets.map(ticket => {
        const sm = statusMeta[(ticket as any).statut as string] ?? statusMeta.ouvert;
        const StatusIcon = sm.icon;
        return (
          <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${sm.color} flex-shrink-0`} />
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{ticket.subject}</p>
              </div>
              <select value={(ticket as any).statut as string} onChange={e => updateStatus(ticket.id, e.target.value)}
                className="border border-gray-200 dark:border-slate-600 rounded-md px-2 py-1 text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 flex-shrink-0">
                <option value="ouvert">Ouvert</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ferme">Fermé</option>
              </select>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">{ticket.message}</p>

            {ticket.admin_reply && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-lg p-3">
                <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Votre réponse :</p>
                <p className="text-sm text-gray-700 dark:text-slate-300">{ticket.admin_reply}</p>
              </div>
            )}

            {replyingId === ticket.id ? (
              <div className="flex gap-2">
                <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Votre réponse à l'utilisateur…"
                  className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleReply(ticket)} />
                <button onClick={() => handleReply(ticket)} disabled={sending}
                  className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium">
                  {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Envoyer
                </button>
                <button onClick={() => setReplyingId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2">✕</button>
              </div>
            ) : (
              <button onClick={() => { setReplyingId(ticket.id); setReplyText(''); }}
                className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                <MessageSquare className="w-3.5 h-3.5" />
                {ticket.admin_reply ? 'Modifier la réponse' : 'Répondre'}
              </button>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(ticket.created_at).toLocaleString('fr-FR')}</p>
          </div>
        );
      })}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
    </div>
  );
}
