import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Jean-Paul Fotso',
    role: { fr: 'Cultivateur de tomates, Centre', en: 'Tomato farmer, Center' },
    quote: {
      fr: "Grâce à CalisteAgriTech, j'ai réduit ma consommation d'eau de 40% grâce à l'irrigation automatique. Mes récoltes n'ont jamais été aussi abondantes.",
      en: "Thanks to CalisteAgriTech, I reduced my water consumption by 40% with automatic irrigation. My harvests have never been so abundant.",
    },
    avatar: 'https://images.pexels.com/photos/220429/pexels-photo-220429.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
  },
  {
    name: 'Marie Nkoulou',
    role: { fr: 'Coopérative agricole, Littoral', en: 'Agricultural cooperative, Littoral' },
    quote: {
      fr: "Le chatbot IA m'a aidée à identifier une maladie du manioc en 2 minutes. Avant, je perdais des jours à chercher des solutions.",
      en: "The AI chatbot helped me identify a cassava disease in 2 minutes. Before, I spent days looking for solutions.",
    },
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
  },
  {
    name: 'Emmanuel Tchinda',
    role: { fr: 'Planteur de piment, Ouest', en: 'Pepper grower, West' },
    quote: {
      fr: "Le calendrier cultural généré par l'IA m'a permis de planifier ma saison entière. J'ai gagné 30% de rendement supplémentaire.",
      en: "The AI-generated crop calendar allowed me to plan my entire season. I gained 30% additional yield.",
    },
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
  },
  {
    name: 'Fatou Bello',
    role: { fr: 'Exploitante maraîchère, Nord-Ouest', en: 'Vegetable farmer, North-West' },
    quote: {
      fr: "Surveiller mes parcelles depuis mon téléphone est un rêve devenu réalité. Je reçois des alertes en temps réel sur l'humidité du sol.",
      en: "Monitoring my parcels from my phone is a dream come true. I receive real-time alerts about soil moisture.",
    },
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
  },
];

export function TestimonialsSection() {
  const { lang, t } = useLang();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % testimonials.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-20 sm:py-28 relative bg-slate-50/50 dark:bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 sm:p-10"
            >
              <Quote className="w-10 h-10 text-primary-200 dark:text-primary-800 mb-4" />
              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed mb-8">
                "{testimonials[current].quote[lang]}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[current].avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-100 dark:border-primary-800"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{testimonials[current].name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{testimonials[current].role[lang]}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
