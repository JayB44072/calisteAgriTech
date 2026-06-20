import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { Droplets, Thermometer, Cpu, Sprout, Wifi, BarChart3, ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onRegister: () => void;
  onDemo: () => void;
}

// ─── Cursor spotlight ──────────────────────────────────────────────────────────
function CursorSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, rgba(13,148,136,0.06) 40%, transparent 70%)',
        }}
        className="absolute rounded-full pointer-events-none"
      />
    </div>
  );
}

// ─── Floating particle ─────────────────────────────────────────────────────────
function Particle({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      animate={{ y: [0, -20, 0], x: [0, 8, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

// ─── Magnetic button ───────────────────────────────────────────────────────────
function MagneticButton({
  children, className, onClick,
}: { children: React.ReactNode; className: string; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

// ─── 3D dashboard card ─────────────────────────────────────────────────────────
function DashboardCard() {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 20 });
  const sry = useSpring(ry, { stiffness: 100, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    ry.set(dx * 8);
    rx.set(-dy * 8);
  };

  const kpis = [
    { label: 'Humidité sol', value: '72%', colorClass: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-900/20', Icon: Droplets },
    { label: 'Température', value: '28°C', colorClass: 'text-red-500', bgClass: 'bg-red-50 dark:bg-red-900/20', Icon: Thermometer },
    { label: 'Capteurs actifs', value: '12', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', Icon: Wifi },
    { label: 'IA diagnostics', value: '3', colorClass: 'text-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-900/20', Icon: Cpu },
  ];
  const bars = [65, 80, 55, 90, 70, 85, 60];

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      onMouseMove={onMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden cursor-none select-none"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Sprout className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">CalisteAgriTech</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-emerald-300 rounded-full block" />
          <span className="text-emerald-200 text-xs">En direct</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
            className={`${k.bgClass} rounded-xl p-3`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-slate-400">{k.label}</span>
              <k.Icon className={`w-3.5 h-3.5 ${k.colorClass}`} />
            </div>
            <p className={`text-lg font-bold ${k.colorClass}`}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 dark:text-slate-500">Humidité — 7 derniers jours</span>
        </div>
        <div className="flex items-end gap-1.5 h-12">
          {bars.map((h, i) => (
            <motion.div key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.9 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
              style={{ height: `${h}%`, transformOrigin: 'bottom' }}
              className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-sm opacity-80"
            />
          ))}
        </div>
      </div>

      {/* Parcelles */}
      <div className="px-4 pb-4 space-y-2">
        {[{ nom: 'Parcelle Nord', culture: 'Tomates', pct: 72 }, { nom: 'Parcelle Sud', culture: 'Maïs', pct: 58 }].map((p, i) => (
          <motion.div key={p.nom} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.1 }}
            className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">{p.nom}</p>
              <p className="text-[10px] text-gray-400">{p.culture}</p>
            </div>
            <div className="w-12 bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }}
                transition={{ delay: 1.3 + i * 0.1, duration: 0.6 }}
                className="h-full bg-emerald-500 rounded-full" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600">{p.pct}%</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          setCount(Math.round(to * (step / steps)));
          if (step >= steps) clearInterval(timer);
        }, 1500 / steps);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Main component ────────────────────────────────────────────────────────────
export function HeroSection({ onRegister, onDemo }: HeroSectionProps) {
  const { t } = useLang();

  const particles = [
    { x: '8%',  y: '20%', size: 6, delay: 0,   color: '#16a34a' },
    { x: '15%', y: '70%', size: 4, delay: 1.2, color: '#0d9488' },
    { x: '25%', y: '40%', size: 8, delay: 0.5, color: '#22c55e' },
    { x: '75%', y: '15%', size: 5, delay: 0.8, color: '#14b8a6' },
    { x: '85%', y: '60%', size: 7, delay: 1.5, color: '#16a34a' },
    { x: '90%', y: '30%', size: 4, delay: 0.3, color: '#0d9488' },
    { x: '60%', y: '80%', size: 6, delay: 2,   color: '#22c55e' },
    { x: '40%', y: '10%', size: 5, delay: 1,   color: '#14b8a6' },
    { x: '5%',  y: '50%', size: 3, delay: 1.8, color: '#16a34a' },
    { x: '95%', y: '75%', size: 4, delay: 0.7, color: '#22c55e' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900">

      <CursorSpotlight />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-emerald-200/20 dark:bg-emerald-500/5 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#16a34a 1px, transparent 1px), linear-gradient(90deg, #16a34a 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">

        {/* Left — text */}
        <div>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>🌱</motion.span>
            Plateforme Smart Farm — Cameroun
          </motion.div>

          {/* Title */}
          <div className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            {t('hero.title').split(' ').map((word, i) => (
              <motion.span key={i} className="inline-block mr-[0.25em]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}>
                {['intelligente', 'Smart', 'intelligente,', 'Farming'].includes(word)
                  ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{word}</span>
                  : word}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-8 leading-relaxed">
            {t('hero.subtitle')}
          </motion.p>

          {/* Live metrics chips */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-2 mb-10">
            {[
              { Icon: Thermometer, label: '28°C', sub: 'Temp. sol', colorClass: 'text-red-500' },
              { Icon: Droplets,    label: '72%',  sub: 'Humidité',  colorClass: 'text-blue-500' },
              { Icon: Wifi,        label: '12',   sub: 'Capteurs',  colorClass: 'text-emerald-500' },
              { Icon: Cpu,         label: 'IA',   sub: 'En ligne',  colorClass: 'text-purple-500' },
            ].map((item, i) => (
              <motion.div key={item.sub} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.08 }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                <item.Icon className={`w-4 h-4 ${item.colorClass}`} />
                <div>
                  <p className={`text-xs font-bold ${item.colorClass}`}>{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <MagneticButton onClick={onRegister}
              className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all duration-200 text-sm">
              {t('hero.cta.free')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <MagneticButton onClick={onDemo}
              className="group flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 text-sm shadow-sm">
              <Play className="w-4 h-4 text-emerald-500" />
              {t('hero.cta.demo')}
            </MagneticButton>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
            <div className="flex -space-x-2">
              {['#ef4444','#f59e0b','#22c55e','#3b82f6'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: c }}>
                  {['A','B','K','S'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-amber-400 text-xs">★</span>)}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300"><Counter to={120} />+</span> agriculteurs au Cameroun
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right — dashboard card */}
        <div className="hidden lg:block relative">
          {/* Floating alert top-left */}
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-4 -left-4 z-10 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 shadow-lg border border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">Irrigation active</span>
          </motion.div>

          {/* Floating alert bottom-right */}
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute -bottom-2 -right-2 z-10 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
            <span className="text-sm">🌡️</span>
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Alerte chaleur</p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">Parcelle Nord · 38°C</p>
            </div>
          </motion.div>

          <DashboardCard />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-slate-500">Découvrir</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border-2 border-gray-300 dark:border-slate-600 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-gray-400 dark:bg-slate-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
