import { motion } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { Check, Sparkles } from 'lucide-react';

export function PricingSection() {
  const { t } = useLang();

  const freeFeatures = [t('pricing.free.f1'), t('pricing.free.f2'), t('pricing.free.f3'), t('pricing.free.f4')];
  const premiumFeatures = [t('pricing.premium.f1'), t('pricing.premium.f2'), t('pricing.premium.f3'), t('pricing.premium.f4'), t('pricing.premium.f5')];

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">{t('pricing.free.name')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('pricing.free.desc')}</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-6">0 <span className="text-base font-normal text-slate-400">FCFA</span></p>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('pricing.cta')}
            </button>
          </motion.div>

          {/* Premium Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 border-2 border-primary-500 dark:border-primary-400 rounded-2xl p-8 relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />{t('pricing.popular')}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">{t('pricing.premium.name')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('pricing.premium.desc')}</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-6">15 000 <span className="text-base font-normal text-slate-400">FCFA/mois</span></p>
            <ul className="space-y-3 mb-8">
              {premiumFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-600/20 transition-colors">
              {t('pricing.cta')}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
