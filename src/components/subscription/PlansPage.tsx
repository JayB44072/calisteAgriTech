import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X as XIcon, Sparkles, Zap, Crown, Star,
  MapPin, Bot, Droplets, Cpu, Map, FileDown,
  Headphones, Bell, Users, ArrowRight, RefreshCw,
} from 'lucide-react';
import { PLANS, type PlanId, type Plan } from '../../hooks/useSubscription';
import { PaymentModal } from './PaymentModal';
import { PageBackground } from '../ui/PageBackground';

interface PlansPageProps {
  currentPlanId: PlanId;
  userId: string;
  onSubscribe: (planId: PlanId) => void;
  onCancel: () => void;
}

const PLAN_ICONS: Record<PlanId, typeof Star> = {
  gratuit: Star,
  pro: Zap,
  cooperatif: Crown,
};

const PLAN_COLORS: Record<PlanId, { gradient: string; border: string; btn: string; badge: string }> = {
  gratuit: {
    gradient: 'from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700',
    border: 'border-gray-200 dark:border-slate-600',
    btn: 'bg-gray-800 hover:bg-gray-900 dark:bg-slate-600 dark:hover:bg-slate-500',
    badge: '',
  },
  pro: {
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30',
    border: 'border-blue-300 dark:border-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700',
    badge: 'Populaire',
  },
  cooperatif: {
    gradient: 'from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30',
    border: 'border-cyan-400 dark:border-cyan-500',
    btn: 'bg-cyan-600 hover:bg-cyan-700',
    badge: 'Recommandé',
  },
};

interface Feature {
  label: string;
  icon: typeof Check;
  values: { gratuit: string | boolean; pro: string | boolean; cooperatif: string | boolean };
}

const FEATURES: Feature[] = [
  { label: 'Parcelles', icon: MapPin, values: { gratuit: '3 max', pro: '10 max', cooperatif: 'Illimité' } },
  { label: 'Conseils IA / mois', icon: Bot, values: { gratuit: '5', pro: '50', cooperatif: 'Illimité' } },
  { label: 'Irrigation avancée', icon: Droplets, values: { gratuit: false, pro: true, cooperatif: true } },
  { label: 'Matériels IoT', icon: Cpu, values: { gratuit: false, pro: true, cooperatif: true } },
  { label: 'Carte interactive', icon: Map, values: { gratuit: false, pro: true, cooperatif: true } },
  { label: 'Export PDF', icon: FileDown, values: { gratuit: false, pro: true, cooperatif: true } },
  { label: 'Alertes météo', icon: Bell, values: { gratuit: false, pro: true, cooperatif: true } },
  { label: 'Support prioritaire', icon: Headphones, values: { gratuit: false, pro: false, cooperatif: true } },
  { label: 'Multi-utilisateurs', icon: Users, values: { gratuit: false, pro: false, cooperatif: true } },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value
      ? <Check className="w-4 h-4 text-cyan-500 mx-auto" />
      : <XIcon className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />;
  }
  return <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{value}</span>;
}

const planOrder: PlanId[] = ['gratuit', 'pro', 'cooperatif'];

export function PlansPage({ currentPlanId, onSubscribe, onCancel }: PlansPageProps) {
  const [payingPlan, setPayingPlan] = useState<Plan | null>(null);

  const handleSuccess = (planId: PlanId) => {
    setPayingPlan(null);
    onSubscribe(planId);
  };

  return (
    <div className="relative min-h-full">
      <PageBackground variant="green" />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Choisissez votre plan
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Accès & Forfaits</h1>
          <p className="mt-2 text-gray-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Des solutions adaptées à chaque exploitant agricole au Cameroun
          </p>
          {currentPlanId !== 'gratuit' && (
            <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
              Plan actif : <span className="font-semibold text-cyan-600 dark:text-cyan-400">{PLANS[currentPlanId].name}</span>
            </p>
          )}
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planOrder.map((planId, i) => {
            const plan = PLANS[planId];
            const colors = PLAN_COLORS[planId];
            const Icon = PLAN_ICONS[planId];
            const isCurrent = currentPlanId === planId;
            const isDowngrade = planOrder.indexOf(planId) < planOrder.indexOf(currentPlanId);

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-b ${colors.gradient} border-2 ${isCurrent ? 'border-cyan-500 dark:border-cyan-400' : colors.border} rounded-2xl p-6 flex flex-col`}
              >
                {colors.badge && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-white text-[10px] font-bold px-3 py-1 rounded-full ${planId === 'pro' ? 'bg-blue-600' : 'bg-cyan-600'}`}>
                      {colors.badge}
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Plan actif
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${planId === 'gratuit' ? 'bg-gray-200 dark:bg-slate-600' : planId === 'pro' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-cyan-100 dark:bg-cyan-900/40'}`}>
                    <Icon className={`w-5 h-5 ${planId === 'gratuit' ? 'text-gray-600 dark:text-slate-300' : planId === 'pro' ? 'text-blue-600 dark:text-blue-400' : 'text-cyan-600 dark:text-cyan-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-slate-100">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-slate-50">
                        {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString('fr-FR')}
                      </span>
                      {plan.price > 0 && <span className="text-xs text-gray-400 dark:text-slate-500">FCFA/mois</span>}
                    </div>
                  </div>
                </div>

                {/* Key features list */}
                <ul className="space-y-2 flex-1 mb-6">
                  {FEATURES.map(f => {
                    const val = f.values[planId];
                    if (val === false) return null;
                    const Icon2 = f.icon;
                    return (
                      <li key={f.label} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                        <Icon2 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                        <span>{f.label}</span>
                        {typeof val === 'string' && <span className="ml-auto text-xs font-bold text-gray-500 dark:text-slate-400">{val}</span>}
                      </li>
                    );
                  })}
                </ul>

                {isCurrent ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-cyan-400 text-cyan-600 dark:text-cyan-400 text-sm font-semibold">
                    <Check className="w-4 h-4" /> Plan actuel
                  </div>
                ) : isDowngrade ? (
                  <button
                    onClick={() => onCancel()}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Rétrograder
                  </button>
                ) : (
                  <button
                    onClick={() => setPayingPlan(plan)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shadow-sm ${colors.btn}`}
                  >
                    Souscrire <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Comparison table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-900 dark:text-slate-100">Comparaison détaillée</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 w-1/2">Fonctionnalité</th>
                  {planOrder.map(pid => (
                    <th key={pid} className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-slate-200">
                      {PLANS[pid].name}
                      {pid === currentPlanId && <span className="ml-1 text-[9px] font-bold text-cyan-500">✓</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => {
                  const Icon2 = f.icon;
                  return (
                    <tr key={f.label} className={`border-b border-gray-50 dark:border-slate-700/50 ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-slate-800/50' : ''}`}>
                      <td className="px-5 py-3 flex items-center gap-2 text-gray-700 dark:text-slate-200">
                        <Icon2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {f.label}
                      </td>
                      {planOrder.map(pid => (
                        <td key={pid} className="px-3 py-3 text-center">
                          <FeatureValue value={f.values[pid]} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 pb-4">
          🔒 Paiements sécurisés via Orange Money, MTN MoMo ou carte bancaire • Résiliable à tout moment • Aucun engagement
        </p>
      </div>

      {payingPlan && (
        <PaymentModal
          plan={payingPlan}
          onClose={() => setPayingPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
