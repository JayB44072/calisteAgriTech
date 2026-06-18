import { motion } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { Droplets, Thermometer, Cpu, Sprout } from 'lucide-react';

interface HeroSectionProps {
  onRegister: () => void;
  onDemo: () => void;
}

export function HeroSection({ onRegister, onDemo }: HeroSectionProps) {
  const { t } = useLang();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light mode blobs */}
        <div className="block dark:hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 -right-48 w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-40 left-1/4 w-[450px] h-[450px] bg-accent-200/25 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: [0, 45, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-primary-200/20 rounded-[60px] rotate-45"
          />
        </div>

        {/* Dark mode blobs */}
        <div className="hidden dark:block">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 -right-48 w-[600px] h-[600px] bg-primary-400/6 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-40 left-1/4 w-[450px] h-[450px] bg-accent-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: [0, 45, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-primary-500/8 rounded-[60px] rotate-45"
          />
          {/* Neon emerald glows */}
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-1/3 w-64 h-64 bg-primary-500/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-32 right-1/4 w-80 h-80 bg-primary-600/8 rounded-full blur-2xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/40 text-primary-700 dark:text-primary-300 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
        >
          <Sprout className="w-3.5 h-3.5" />
          Projet WellAgriTech - Cameroun
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50 leading-tight tracking-tight mb-6"
        >
          {t('hero.title')}
        </motion.h1>

        {/* Subtitle with animated highlights */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Animated icons strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-6 mb-10"
        >
          {[
            { icon: Thermometer, color: 'text-red-500 dark:text-red-400', label: 'Temp' },
            { icon: Droplets, color: 'text-blue-500 dark:text-blue-400', label: 'Irrigation' },
            { icon: Cpu, color: 'text-primary-500 dark:text-primary-400', label: 'IA' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
              className="flex items-center gap-1.5"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onRegister}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('hero.cta.free')}
          </button>
          <button
            onClick={onDemo}
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('hero.cta.demo')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
