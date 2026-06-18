import { motion } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { Thermometer, Droplets, Bot, Calendar } from 'lucide-react';

const featureIcons = [
  { icon: Thermometer, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/30' },
  { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/30' },
  { icon: Bot, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-100 dark:border-primary-800/30' },
  { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/30' },
];

export function FeaturesSection() {
  const { t } = useLang();

  const features = [
    { titleKey: 'features.iot.title', descKey: 'features.iot.desc' },
    { titleKey: 'features.irrigation.title', descKey: 'features.irrigation.desc' },
    { titleKey: 'features.ai.title', descKey: 'features.ai.desc' },
    { titleKey: 'features.calendar.title', descKey: 'features.calendar.desc' },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            {t('features.title')}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const style = featureIcons[i];
            return (
              <motion.div
                key={feat.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`${style.bg} border ${style.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <style.icon className={`w-6 h-6 ${style.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-base mb-2">
                  {t(feat.titleKey)}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(feat.descKey)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
