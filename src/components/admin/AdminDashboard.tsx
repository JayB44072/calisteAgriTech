import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import type { Profile, SupportTicket } from '../../types/database';
import {
  Users,
  BarChart3,
  Headphones,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Ban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type AdminTab = 'users' | 'telemetry' | 'support';

export function AdminDashboard() {
  const { lang } = useLang();
  const [tab, setTab] = useState<AdminTab>('users');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
            {lang === 'fr' ? 'Tableau de bord Admin' : 'Admin Dashboard'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {lang === 'fr' ? 'Gestion globale de la plateforme' : 'Global platform management'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        {[
          { id: 'users' as AdminTab, label: lang === 'fr' ? 'Utilisateurs' : 'Users', icon: Users },
          { id: 'telemetry' as AdminTab, label: lang === 'fr' ? 'Télémétrie' : 'Telemetry', icon: BarChart3 },
          { id: 'support' as AdminTab, label: lang === 'fr' ? 'Support' : 'Support', icon: Headphones },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersPanel />}
      {tab === 'telemetry' && <TelemetryPanel />}
      {tab === 'support' && <SupportPanel />}
    </div>
  );
}

function UsersPanel() {
  const { lang } = useLang();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'full_name' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filtered = users
    .filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'full_name') return ((a.full_name || '') > (b.full_name || '') ? 1 : -1) * dir;
      return ((a.created_at || '') > (b.created_at || '') ? 1 : -1) * dir;
    });

  const toggleSort = (field: 'full_name' | 'created_at') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const updateRole = async (userId: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as Profile['role'] } : u));
  };

  const roleLabels: Record<string, string> = {
    agriculteur: lang === 'fr' ? 'Agriculteur' : 'Farmer',
    gestionnaire: lang === 'fr' ? 'Gestionnaire' : 'Manager',
    fournisseur: lang === 'fr' ? 'Fournisseur' : 'Provider',
  };

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'fr' ? 'Rechercher...' : 'Search...'} className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none">
          <option value="all">{lang === 'fr' ? 'Tous les rôles' : 'All roles'}</option>
          <option value="agriculteur">Agriculteur</option>
          <option value="gestionnaire">Gestionnaire</option>
          <option value="fournisseur">Fournisseur</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300 cursor-pointer" onClick={() => toggleSort('full_name')}>
                <span className="flex items-center gap-1">{lang === 'fr' ? 'Utilisateur' : 'User'} {sortField === 'full_name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300">{lang === 'fr' ? 'Rôle' : 'Role'}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300 cursor-pointer" onClick={() => toggleSort('created_at')}>
                <span className="flex items-center gap-1">{lang === 'fr' ? 'Inscrit le' : 'Joined'} {sortField === 'created_at' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300">{lang === 'fr' ? 'Actions' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"><span className="text-primary-700 dark:text-primary-400 font-semibold text-xs">{(u.full_name || 'U').charAt(0)}</span></div>}
                    <div><p className="font-medium text-gray-900 dark:text-slate-100">{u.full_name || '-'}</p><p className="text-xs text-gray-400 dark:text-slate-500">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="border border-gray-200 dark:border-slate-600 rounded-md px-2 py-1 text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                    <option value="agriculteur">{roleLabels.agriculteur}</option>
                    <option value="gestionnaire">{roleLabels.gestionnaire}</option>
                    <option value="fournisseur">{roleLabels.fournisseur}</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => updateRole(u.id, u.role === 'agriculteur' ? 'gestionnaire' : 'agriculteur')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">{lang === 'fr' ? 'Modifier' : 'Edit'}</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">{lang === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500">
        {filtered.length} {lang === 'fr' ? 'utilisateur(s)' : 'user(s)'}
      </div>
    </div>
  );
}

function TelemetryPanel() {
  const { lang } = useLang();
  const [chartData, setChartData] = useState<Array<Record<string, string | number>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('sensor_data').select('*').order('created_at', { ascending: false }).limit(100);
      if (data) {
        setChartData(data.reverse().map(d => ({
          time: new Date(d.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          temperature: d.temperature ?? 0,
          humidite_sol: d.humidite_sol ?? 0,
          humidite_air: d.humidite_air ?? 0,
        })));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>;

  const tooltipStyle = { fontSize: 12, borderRadius: 8, backgroundColor: 'rgb(15 23 42)', border: 'none', color: '#f8fafc' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-4">{lang === 'fr' ? 'Température Globale' : 'Global Temperature'}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="adminTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="°C" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#adminTemp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-4">{lang === 'fr' ? 'Humidité Globale' : 'Global Humidity'}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="adminSol" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                <linearGradient id="adminAir" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="humidite_sol" stroke="#3b82f6" fill="url(#adminSol)" strokeWidth={2} name="Sol" />
              <Area type="monotone" dataKey="humidite_air" stroke="#06b6d4" fill="url(#adminAir)" strokeWidth={2} name="Air" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SupportPanel() {
  const { lang } = useLang();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (!error && data) setTickets(data);
      setLoading(false);
    }
    fetch();
  }, []);

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    const { error } = await supabase.from('support_tickets').update({
      admin_reply: replyText,
      status: 'in_progress',
      replied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', ticketId);
    if (!error) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, admin_reply: replyText, status: 'in_progress', replied_at: new Date().toISOString() } : t));
      setReplyingId(null);
      setReplyText('');
    }
  };

  const updateStatus = async (ticketId: string, status: SupportTicket['status']) => {
    const { error } = await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
    if (!error) setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <Ban className="w-4 h-4 text-gray-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const priorityColor: Record<string, string> = {
    low: 'text-gray-500', medium: 'text-amber-500', high: 'text-orange-500', critical: 'text-red-500',
  };

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <Headphones className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">{lang === 'fr' ? 'Aucun ticket de support' : 'No support tickets'}</p>
        </div>
      ) : tickets.map(ticket => (
        <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {statusIcon(ticket.status)}
              <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{ticket.subject}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${priorityColor[ticket.priority]}`}>{ticket.priority}</span>
              <select value={ticket.status} onChange={e => updateStatus(ticket.id, e.target.value as SupportTicket['status'])} className="border border-gray-200 dark:border-slate-600 rounded-md px-2 py-1 text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">{ticket.message}</p>
          {ticket.admin_reply && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">{lang === 'fr' ? 'Réponse admin :' : 'Admin reply:'}</p>
              <p className="text-sm text-gray-700 dark:text-slate-300">{ticket.admin_reply}</p>
            </div>
          )}
          {replyingId === ticket.id ? (
            <div className="flex gap-2">
              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={lang === 'fr' ? 'Votre réponse...' : 'Your reply...'} className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none" />
              <button onClick={() => handleReply(ticket.id)} className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-xs font-medium"><Send className="w-3 h-3" /></button>
            </div>
          ) : (
            <button onClick={() => setReplyingId(ticket.id)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">{lang === 'fr' ? 'Répondre' : 'Reply'}</button>
          )}
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{new Date(ticket.created_at).toLocaleString('fr-FR')}</p>
        </div>
      ))}
    </div>
  );
}
