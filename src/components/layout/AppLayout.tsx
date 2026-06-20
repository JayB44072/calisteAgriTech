import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../../types/database';
import type { Plan } from '../../hooks/useSubscription';
import { NotificationsPanel } from '../notifications/NotificationsPanel';
import {
  LayoutDashboard, MapPin, Bot, Settings, LogOut, Menu, X, Sprout,
  Moon, Sun, Globe, User as UserIcon, Truck, Cloud, Map, Droplets,
  Cpu, Headphones, CreditCard,
} from 'lucide-react';

export type TabId = 'overview' | 'parcelles' | 'ai' | 'settings' | 'account' | 'fournisseur' | 'meteo' | 'carte' | 'irrigation' | 'materiels' | 'support' | 'plans';

interface NavItem {
  id: TabId;
  labelFr: string;
  labelEn: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
  premium?: boolean; // show lock hint
}

const allNavItems: NavItem[] = [
  { id: 'overview', labelFr: 'Vue d\'ensemble', labelEn: 'Overview', icon: LayoutDashboard },
  { id: 'parcelles', labelFr: 'Parcelles', labelEn: 'Parcels', icon: MapPin, roles: ['agriculteur', 'gestionnaire'] },
  { id: 'irrigation', labelFr: 'Irrigation', labelEn: 'Irrigation', icon: Droplets, roles: ['agriculteur', 'gestionnaire'], premium: true },
  { id: 'materiels', labelFr: 'Matériels IoT', labelEn: 'IoT Devices', icon: Cpu, roles: ['agriculteur', 'gestionnaire'], premium: true },
  { id: 'carte', labelFr: 'Carte', labelEn: 'Map', icon: Map, roles: ['agriculteur', 'gestionnaire'], premium: true },
  { id: 'meteo', labelFr: 'Météo', labelEn: 'Weather', icon: Cloud },
  { id: 'ai', labelFr: 'Conseils IA', labelEn: 'AI Advice', icon: Bot },
  { id: 'fournisseur', labelFr: 'Services', labelEn: 'Services', icon: Truck, roles: ['fournisseur'] },
  { id: 'support', labelFr: 'Support', labelEn: 'Support', icon: Headphones },
  { id: 'plans', labelFr: 'Forfaits', labelEn: 'Plans', icon: CreditCard },
  { id: 'account', labelFr: 'Mon Compte', labelEn: 'My Account', icon: UserIcon },
  { id: 'settings', labelFr: 'Paramètres', labelEn: 'Settings', icon: Settings },
];

interface AppLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
  user: User;
  userRole?: UserRole;
  currentPlan?: Plan;
}

export function AppLayout({ activeTab, onTabChange, children, user, userRole = 'agriculteur', currentPlan }: AppLayoutProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile(user.id);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agriculteur';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const isPremium = currentPlan && currentPlan.id !== 'gratuit';

  const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(userRole));

  const handleSignOut = async () => { await signOut(); };

  const handleTabChange = (id: TabId) => {
    onTabChange(id);
    setSidebarOpen(false);
  };

  const farmItems = navItems.filter(n => ['overview', 'parcelles', 'irrigation', 'materiels', 'carte', 'meteo'].includes(n.id));
  const toolItems = navItems.filter(n => ['ai', 'fournisseur'].includes(n.id));
  const userItems = navItems.filter(n => ['support', 'plans', 'account', 'settings'].includes(n.id));

  const navSection = (items: NavItem[], label: string) => items.length === 0 ? null : (
    <div>
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">{label}</p>
      {items.map(item => {
        const locked = item.premium && !isPremium;
        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-primary-600 dark:text-primary-400' : locked ? 'text-gray-300 dark:text-slate-600' : 'text-gray-400 dark:text-slate-500'}`} />
            <span className={locked ? 'text-gray-400 dark:text-slate-500' : ''}>{lang === 'fr' ? item.labelFr : item.labelEn}</span>
            {locked && <span className="ml-auto text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">PRO</span>}
            {item.id === 'plans' && !isPremium && <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">Nouveau</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-300">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-slate-50 text-sm">CalisteAgriTech</h1>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Smart Farming Platform</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSection(farmItems, lang === 'fr' ? 'Agriculture' : 'Farming')}
          {navSection(toolItems, lang === 'fr' ? 'Outils' : 'Tools')}
          {navSection(userItems, lang === 'fr' ? 'Compte' : 'Account')}
        </nav>

        {/* Bottom controls */}
        <div className="px-4 pb-2 flex items-center gap-1">
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />{lang.toUpperCase()}
          </button>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              : <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
                </div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{userName}</p>
                {currentPlan && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${currentPlan.badgeColor}`}>
                    {currentPlan.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {lang === 'fr' ? 'Déconnexion' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 sticky top-0 z-30 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-slate-300 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">CalisteAgriTech</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <NotificationsPanel />
            <button onClick={toggleTheme} className="p-2 text-gray-400 dark:text-slate-500">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden lg:flex h-12 px-8 items-center justify-end gap-2 border-b border-gray-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-30">
          {currentPlan && currentPlan.id !== 'gratuit' && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${currentPlan.badgeColor}`}>
              {currentPlan.badge}
            </span>
          )}
          <NotificationsPanel />
        </div>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">{children}</main>
      </div>
    </div>
  );
}
