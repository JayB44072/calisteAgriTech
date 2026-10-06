// src/components/support/SupportTab.tsx
// Onglet support agriculteur - soumettre et suivre des tickets.

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../contexts/LanguageContext';
import {
  Headphones, Plus, Clock, CheckCircle, Loader2, Ban, AlertTriangle,
  Send, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priorite: 'low' | 'medium' | 'high' | 'critical';
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  admin_reply?: string;
  created_at: string;
  replied_at?: string;
  // Compat aliases (tickets locaux fallback)
  priority?: string;
  status?: string;
}

const statusConfig = {
  ouvert:   { label: 'Ouvert',   labelEn: 'Open',        color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: Clock },
  en_cours: { label: 'En cours', labelEn: 'In progress', color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: Loader2 },
  resolu:   { label: 'Résolu',   labelEn: 'Resolved',    color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20',  icon: CheckCircle },
  ferme:    { label: 'Fermé',    labelEn: 'Closed',      color: 'text-gray-500',  bg: 'bg-gray-50 dark:bg-gray-900/20',   icon: Ban },
};

const priorityConfig = {
  low:      { label: 'Faible',   labelEn: 'Low',      color: 'text-gray-500' },
  medium:   { label: 'Normale',  labelEn: 'Medium',   color: 'text-amber-500' },
  high:     { label: 'Haute',    labelEn: 'High',     color: 'text-orange-500' },
  critical: { label: 'Critique', labelEn: 'Critical', color: 'text-red-500' },
};

export function SupportTab() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' as Ticket['priority'] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setTickets(data as unknown as Ticket[]);
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.subject || !form.message) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: form.subject,
          message: form.message,
          priorite: form.priority,
          statut: 'ouvert',
        })
        .select()
        .single();
      if (!error && data) {
        setTickets(prev => [data as unknown as Ticket, ...prev]);
      } else {
        const newTicket: Ticket = {
          id: `local-${Date.now()}`,
          subject: form.subject,
          message: form.message,
          priorite: form.priority as Ticket['priorite'],
          statut: 'ouvert',
          created_at: new Date().toISOString(),
        };
        setTickets(prev => [newTicket, ...prev]);
      }
      setForm({ subject: '', message: '', priority: 'medium' });
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      const newTicket: Ticket = {
        id: `local-${Date.now()}`,
        subject: form.subject,
        message: form.message,
        priorite: form.priority as Ticket['priorite'],
        statut: 'ouvert',
        created_at: new Date().toISOString(),
      };
      setTickets(prev => [newTicket, ...prev]);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
            {lang === 'fr' ? 'Support' : 'Support'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {lang === 'fr' ? 'Contactez notre équipe pour toute assistance technique' : 'Contact our team for technical assistance'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          {lang === 'fr' ? 'Nouveau ticket' : 'New ticket'}
        </button>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700/30 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">
              {lang === 'fr'
                ? 'Ticket soumis avec succès ! Notre équipe vous répondra sous 24h.'
                : 'Ticket submitted! Our team will reply within 24h.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: lang === 'fr' ? 'Temps de réponse' : 'Response time', value: '< 24h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: lang === 'fr' ? 'Tickets ouverts' : 'Open tickets', value: tickets.filter(t => t.statut === 'ouvert' || t.statut === 'en_cours').length, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: lang === 'fr' ? 'Résolus' : 'Resolved', value: tickets.filter(t => t.statut === 'resolu').length, icon: CheckCircle, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} rounded-xl p-4 flex items-center gap-3`}>
            <kpi.icon className={`w-6 h-6 ${kpi.color} flex-shrink-0`} />
            <div>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <Headphones className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 dark:text-slate-300">
            {lang === 'fr' ? 'Aucun ticket de support' : 'No support tickets'}
          </h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
            {lang === 'fr' ? 'Créez un ticket si vous avez besoin d\'aide' : 'Create a ticket if you need help'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const cfg = statusConfig[ticket.statut] ?? statusConfig.ouvert;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === ticket.id;
            return (
              <motion.div
                key={ticket.id}
                layout
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-50">{ticket.subject}</p>
                      <span className={`text-xs font-medium ${(priorityConfig[ticket.priorite] ?? priorityConfig.medium).color}`}>
                        [{lang === 'fr' ? (priorityConfig[ticket.priorite] ?? priorityConfig.medium).label : (priorityConfig[ticket.priorite] ?? priorityConfig.medium).labelEn}]
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                      {new Date(ticket.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium ${cfg.color} ${cfg.bg} px-2.5 py-1 rounded-full`}>
                      {lang === 'fr' ? cfg.label : cfg.labelEn}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 dark:border-slate-700"
                    >
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mb-1">
                            {lang === 'fr' ? 'Votre message' : 'Your message'}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                            {ticket.message}
                          </p>
                        </div>
                        {ticket.admin_reply && (
                          <div>
                            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                              {lang === 'fr' ? 'Réponse de l\'équipe support' : 'Support team reply'}
                              {ticket.replied_at && (
                                <span className="ml-2 text-gray-400 font-normal">
                                  — {new Date(ticket.replied_at).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </p>
                            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-lg p-3">
                              <p className="text-sm text-gray-700 dark:text-slate-300">{ticket.admin_reply}</p>
                            </div>
                          </div>
                        )}
                        {!ticket.admin_reply && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                            {lang === 'fr' ? 'En attente de réponse de notre équipe...' : 'Waiting for team reply...'}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                    {lang === 'fr' ? 'Nouveau ticket de support' : 'New support ticket'}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-400">
                    {lang === 'fr' ? 'Réponse sous 24h ouvrées' : 'Response within 24 business hours'}
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'fr' ? 'Sujet' : 'Subject'} *
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder={lang === 'fr' ? 'Ex: Capteur non fonctionnel' : 'Ex: Sensor not working'}
                    required
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'fr' ? 'Priorité' : 'Priority'}
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as Ticket['priority'] }))}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none"
                  >
                    {Object.entries(priorityConfig).map(([key, val]) => (
                      <option key={key} value={key}>{lang === 'fr' ? val.label : val.labelEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'fr' ? 'Description détaillée' : 'Detailed description'} *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    rows={5}
                    required
                    placeholder={lang === 'fr'
                      ? 'Décrivez votre problème en détail...\n- Que se passe-t-il exactement ?\n- Depuis quand ?\n- Numéro de série du matériel concerné ?'
                      : 'Describe your problem in detail...'
                    }
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {lang === 'fr' ? 'Soumettre le ticket' : 'Submit ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    {lang === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
