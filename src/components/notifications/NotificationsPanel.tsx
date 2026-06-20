import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const typeConfig = {
  alerte: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800/50', dot: 'bg-red-500' },
  succes: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800/50', dot: 'bg-emerald-500' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800/50', dot: 'bg-blue-500' },
  avertissement: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-amber-500' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export function NotificationsPanel() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll, isDemo } = useNotifications(user?.id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                {unreadCount > 0 && <p className="text-xs text-gray-500 dark:text-slate-400">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    <Check className="w-3 h-3" /> Tout lire
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Demo badge */}
            {isDemo && (
              <div className="px-5 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">⚠️ DÉMO — Notifications simulées</p>
              </div>
            )}

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-slate-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {notifications.map(n => {
                    const cfg = typeConfig[n.type] ?? typeConfig.info;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => markRead(n.id)}
                        className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!n.lu ? 'bg-gray-50/50 dark:bg-slate-700/20' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold leading-tight ${!n.lu ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>{n.titre}</p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {!n.lu && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />}
                              <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-300 dark:text-slate-600 hover:text-red-400 transition-all">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
