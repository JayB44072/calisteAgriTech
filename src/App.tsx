import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ADMIN_EMAIL } from './lib/constants';
import { LandingPage } from './components/landing/LandingPage';
import { AppLayout, type TabId } from './components/layout/AppLayout';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { ParcellesTab } from './components/parcelles/ParcellesTab';
import { AITab } from './components/ai/AITab';
import { SettingsTab } from './components/settings/SettingsTab';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FournisseurView } from './components/FournisseurView';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';

type ViewMode = 'landing' | 'dashboard' | 'admin';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedParcelleId, setSelectedParcelleId] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const userRole = profile?.role ?? 'agriculteur';

  // Auto-enter dashboard when logged in
  useEffect(() => {
    if (user && viewMode === 'landing') setViewMode('dashboard');
    if (!user && viewMode !== 'landing') setViewMode('landing');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!user || viewMode === 'landing') {
    return (
      <LandingPage
        user={user}
        onEnterDashboard={() => setViewMode('dashboard')}
        onLogout={handleSignOut}
      />
    );
  }

  // Admin Dashboard
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Admin top bar */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('dashboard')}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au dashboard
              </button>
            </div>
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

  // Regular Dashboard with role-based views
  return (
    <div className="relative">
      {/* Admin Toggle - only for admin email */}
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
            Passer au tableau de bord admin
          </motion.button>
        )}
      </AnimatePresence>

      <AppLayout activeTab={activeTab} onTabChange={handleTabChange} user={user} userRole={userRole}>
        {activeTab === 'overview' && (
          <OverviewTab userId={user.id} onNavigateToParcelle={handleNavigateToParcelle} onTabChange={handleTabChange} />
        )}
        {activeTab === 'parcelles' && (
          <ParcellesTab userId={user.id} selectedParcelleId={selectedParcelleId} onSelectParcelle={setSelectedParcelleId} />
        )}
        {activeTab === 'ai' && (
          <AITab userId={user.id} onNavigateToParcelle={handleNavigateToParcelle} />
        )}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'account' && <AccountPage />}
      </AppLayout>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
