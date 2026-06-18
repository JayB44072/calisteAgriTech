import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../../types/database';
import {
  LayoutDashboard,
  MapPin,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Sprout,
  Moon,
  Sun,
  Globe,
  User as UserIcon,
  Truck,
  Calendar,
} from 'lucide-react';

export type TabId = 'overview' | 'parcelles' | 'ai' | 'settings' | 'account' | 'fournisseur';

interface NavItem {
  id: TabId;
  labelKey: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
}

const allNavItems: NavItem[] = [
  { id: 'overview', labelKey: 'nav.overview', icon: LayoutDashboard },
  { id: 'parcelles', labelKey: 'nav.parcelles', icon: MapPin, roles: ['agriculteur', 'gestionnaire'] },
  { id: 'ai', labelKey: 'nav.ai', icon: Bot },
  { id: 'fournisseur', labelKey: 'nav.fournisseur', icon: Truck, roles: ['fournisseur'] },
  { id: 'account', labelKey: 'nav.account', icon: UserIcon },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

interface AppLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
  user: User;
  userRole?: UserRole;
}

export function AppLayout({ activeTab, onTabChange, children, user, userRole = 'agriculteur' }: AppLayoutProps) {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agriculteur';
  const avatarUrl = user.user_metadata?.avatar_url;

  const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(userRole));

  const navLabels: Record<string, Record<string, string>> = {
    'nav.overview': { fr: 'Vue d\'ensemble', en: 'Overview' },
    'nav.parcelles': { fr: 'Parcelles', en: 'Parcels' },
    'nav.ai': { fr: 'Conseils IA', en: 'AI Advice' },
    'nav.settings': { fr: 'Paramètres', en: 'Settings' },
    'nav.account': { fr: 'Mon Compte', en: 'My Account' },
    'nav.fournisseur': { fr: 'Services', en: 'Services' },
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-300">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 dark:border-slate-700">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center"><Sprout className="w-5 h-5 text-white" /></div>
          <div><h1 className="font-bold text-gray-900 dark:text-slate-50 text-sm">CalisteAgriTech</h1><p className="text-[10px] text-gray-400 dark:text-slate-500">Smart Farming</p></div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { onTabChange(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'}`}>
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500'}`} />
              {navLabels[item.labelKey]?.[lang] ?? item.labelKey}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-2 flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">{theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
          <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Globe className="w-3.5 h-3.5" />{lang.toUpperCase()}</button>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center"><span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span></div>}
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{userName}</p><p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user.email}</p></div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><LogOut className="w-4 h-4" />{lang === 'fr' ? 'Déconnexion' : 'Sign Out'}</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden h-14 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-slate-300 hover:text-gray-900"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2 ml-3"><Sprout className="w-5 h-5 text-primary-600" /><span className="font-semibold text-sm text-gray-900 dark:text-slate-100">CalisteAgriTech</span></div>
          <div className="ml-auto flex items-center gap-2"><button onClick={toggleTheme} className="p-2 text-gray-400 dark:text-slate-500">{theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button></div>
        </header>
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
