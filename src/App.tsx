import { useState, useEffect, Component, type ReactNode, type ErrorInfo } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  componentDidCatch(e: Error, info: ErrorInfo) { console.error('App crashed:', e, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff1f2', minHeight: '100vh' }}>
          <h1 style={{ color: '#dc2626' }}>Erreur de rendu</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#991b1b' }}>{(this.state.error as Error).message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#6b7280', fontSize: 12 }}>{(this.state.error as Error).stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { requestBrowserNotifications } from './hooks/useNotifications';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider, usePlan } from './contexts/SubscriptionContext';
import { ADMIN_EMAILS } from './lib/constants';
import { LandingPage } from './components/landing/LandingPage';
import { AppLayout, type TabId } from './components/layout/AppLayout';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { ParcellesTab } from './components/parcelles/ParcellesTab';
import { AITab } from './components/ai/AITab';
import { SettingsTab } from './components/settings/SettingsTab';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FournisseurView } from './components/FournisseurView';
import { MeteoTab } from './components/meteo/MeteoTab';
import { CarteTab } from './components/carte/CarteTab';
import { IrrigationTab } from './components/irrigation/IrrigationTab';
import { MaterielsTab } from './components/materiels/MaterielsTab';
import { SupportTab } from './components/support/SupportTab';
import { PlansPage } from './components/subscription/PlansPage';
import { LockedFeature } from './components/subscription/LockedFeature';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import type { PlanId } from './hooks/useSubscription';

type ViewMode = 'landing' | 'dashboard' | 'admin';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { plan, planId, subscribe, cancelSubscription } = usePlan();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedParcelleId, setSelectedParcelleId] = useState<string | null>(null);

  // Request browser notification permission once logged in
  useEffect(() => {
    if (user) requestBrowserNotifications();
  }, [user]);

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);
  const userRole = profile?.role ?? 'agriculteur';

  useEffect(() => {
    if (user) setViewMode('dashboard');
    if (!user) setViewMode('landing');
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setViewMode('landing');
  };

  const handleNavigateToParcelle = (id: string) => {
    setSelectedParcelleId(id);
    setActiveTab('parcelles');
  };

  const handleTabChange = (tab: TabId | string) => {
    setActiveTab(tab as TabId);
    if (tab !== 'parcelles') setSelectedParcelleId(null);
  };

  const handleSubscribe = (newPlanId: PlanId) => {
    subscribe(newPlanId);
  };

  const handleCancelSub = () => {
    cancelSubscription();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-1.85.5-3.57 1.38-5.05" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="animate-spin w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        user={user}
        onEnterDashboard={() => setViewMode('dashboard')}
        onLogout={handleSignOut}
      />
    );
  }

  // Account deleted
  if ((profile as any)?.status === 'deleted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-2">Compte supprimé</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            Ce compte a été supprimé par l'administrateur. Contactez le support si vous pensez qu'il s'agit d'une erreur.
          </p>
          <button onClick={handleSignOut} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // Account suspended
  const isSuspended = (profile as any)?.status === 'suspended' ||
    ((profile as any)?.blocked_until && new Date((profile as any).blocked_until) > new Date());
  if (isSuspended) {
    const until = (profile as any)?.blocked_until;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-2">Compte suspendu</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
            Votre compte est temporairement suspendu. Vous pouvez consulter vos informations mais pas modifier de données.
          </p>
          {until && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-6">
              Suspension jusqu'au {new Date(until).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <button onClick={handleSignOut} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">Mode Admin</span>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setViewMode('admin')}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-red-600/20 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Shield className="w-4 h-4" />
            Dashboard Admin
          </motion.button>
        )}
      </AnimatePresence>

      <AppLayout activeTab={activeTab} onTabChange={handleTabChange} user={user} userRole={userRole} currentPlan={plan}>
        {activeTab === 'overview' && (
          <OverviewTab userId={user.id} onNavigateToParcelle={handleNavigateToParcelle} onTabChange={handleTabChange} />
        )}
        {activeTab === 'parcelles' && (
          <ParcellesTab userId={user.id} selectedParcelleId={selectedParcelleId} onSelectParcelle={setSelectedParcelleId} />
        )}
        {activeTab === 'irrigation' && (
          plan.limits.irrigationAvancee
            ? <IrrigationTab userId={user.id} />
            : <LockedFeature featureName="Irrigation avancée" requiredPlan="pro" onUpgrade={() => setActiveTab('plans')} />
        )}
        {activeTab === 'materiels' && (
          plan.limits.materielIoT
            ? <MaterielsTab userId={user.id} />
            : <LockedFeature featureName="Matériels IoT" requiredPlan="pro" onUpgrade={() => setActiveTab('plans')} />
        )}
        {activeTab === 'carte' && (
          plan.limits.carte
            ? <CarteTab userId={user.id} />
            : <LockedFeature featureName="Carte interactive" requiredPlan="pro" onUpgrade={() => setActiveTab('plans')} />
        )}
        {activeTab === 'meteo' && <MeteoTab userId={user.id} />}
        {activeTab === 'ai' && (
          <AITab userId={user.id} onNavigateToParcelle={handleNavigateToParcelle} />
        )}
        {activeTab === 'fournisseur' && <FournisseurView />}
        {activeTab === 'support' && <SupportTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'account' && <AccountPage />}
        {activeTab === 'plans' && (
          <PlansPage
            currentPlanId={planId}
            userId={user.id}
            onSubscribe={handleSubscribe}
            onCancel={handleCancelSub}
          />
        )}
      </AppLayout>
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();
  return (
    <SubscriptionProvider userId={user?.id}>
      <AppContent />
    </SubscriptionProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthGate />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
