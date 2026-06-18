import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection } from './StatsSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  user: User | null;
  onEnterDashboard: () => void;
  onLogout: () => void;
}

export function LandingPage({ user, onEnterDashboard, onLogout }: LandingPageProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');

  const openLogin = () => { setAuthView('login'); setAuthOpen(true); };
  const openRegister = () => { setAuthView('register'); setAuthOpen(true); };
  const handleDemo = () => {
    if (user) {
      onEnterDashboard();
    } else {
      openRegister();
    }
  };

  const scrollTarget = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header
        user={user}
        onLogin={openLogin}
        onRegister={openRegister}
        onDashboard={onEnterDashboard}
        onLogout={onLogout}
        scrollTarget={scrollTarget}
      />

      <HeroSection onRegister={openRegister} onDemo={handleDemo} />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialView={authView}
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}
