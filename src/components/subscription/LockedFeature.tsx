import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PLANS, type PlanId } from '../../hooks/useSubscription';

interface LockedFeatureProps {
  featureName: string;
  requiredPlan: PlanId;
  onUpgrade: () => void;
}

export function LockedFeature({ featureName, requiredPlan, onUpgrade }: LockedFeatureProps) {
  const plan = PLANS[requiredPlan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <Lock className="w-9 h-9 text-cyan-600 dark:text-cyan-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
        {featureName}
      </h2>
      <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-2">
        Cette fonctionnalité est disponible à partir du plan{' '}
        <span className="font-semibold text-cyan-600 dark:text-cyan-400">{plan.name}</span>.
      </p>
      <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">
        À partir de <strong>{plan.price.toLocaleString('fr-FR')} FCFA/mois</strong>
      </p>

      <button
        onClick={onUpgrade}
        className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4" />
        Voir les forfaits
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
