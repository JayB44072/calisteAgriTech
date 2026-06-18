import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { Droplets, MapPin, Cpu, Users } from 'lucide-react';

interface StatItem {
  key: string;
  target: number;
  icon: typeof Droplets;
  color: string;
  suffix?: string;
}

const stats: StatItem[] = [
  { key: 'stats.water', target: 2450000, icon: Droplets, color: 'text-blue-500', suffix: 'L' },
  { key: 'stats.parcelles', target: 1280, icon: MapPin, color: 'text-primary-500', suffix: '' },
  { key: 'stats.diagnoses', target: 8950, icon: Cpu, color: 'text-amber-500', suffix: '' },
  { key: 'stats.farmers', target: 3420, icon: Users, color: 'text-violet-500', suffix: '' },
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  const format = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toLocaleString();
  };

  return <span ref={ref}>{format(count)}</span>;
}

export function StatsSection() {
  const { t } = useLang();

  return (
    <section id="statistics" className="py-20 sm:py-28 relative bg-slate-50/50 dark:bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            {t('stats.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                <AnimatedCounter target={stat.target} />
                {stat.suffix && <span className="text-lg ml-1 text-slate-400">{stat.suffix}</span>}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t(stat.key)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
