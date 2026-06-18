import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { CULTURES, ZONES, ROLES } from '../../lib/constants';
import type { UserRole } from '../../types/database';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Home,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Ruler,
} from 'lucide-react';

type AuthView = 'login' | 'register' | 'forgot';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: AuthView;
  onSuccess: () => void;
}

export function AuthModal({ open, onClose, initialView = 'login', onSuccess }: AuthModalProps) {
  const { t, lang } = useLang();
  const [view, setView] = useState<AuthView>(initialView);
  const [showPassword, setShowPassword] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register - multi-step
  const [regStep, setRegStep] = useState(1);
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phone: '', city: '', farmAddress: '', farmSize: '', primaryCrop: '', role: 'agriculteur' as UserRole,
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  useEffect(() => {
    if (open) { setView(initialView); setRegStep(1); }
  }, [open, initialView]);

  const passwordsMatch = regForm.password && regForm.confirmPassword && regForm.password === regForm.confirmPassword;
  const passwordMismatch = regForm.confirmPassword.length > 0 && regForm.password !== regForm.confirmPassword;
  const step1Valid = regForm.firstName && regForm.lastName && regForm.email && regForm.password && passwordsMatch;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setRegLoading(true);
    setRegError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
        options: {
          data: {
            full_name: `${regForm.firstName} ${regForm.lastName}`,
            phone: regForm.phone,
            city: regForm.city,
            farm_address: regForm.farmAddress,
            farm_size: regForm.farmSize ? parseFloat(regForm.farmSize) : null,
            primary_crop: regForm.primaryCrop,
            role: regForm.role,
          },
        },
      });
      if (error) throw error;
      setRegSuccess(lang === 'fr' ? 'Compte créé avec succès ! Vérifiez votre e-mail pour confirmer.' : 'Account created! Check your email to confirm.');
    } catch (err: any) {
      setRegError(err.message || 'Erreur d\'inscription');
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin });
      if (error) throw error;
      setForgotSuccess(t('auth.reset_success'));
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const inputClass = (hasError?: boolean, isSuccess?: boolean) =>
    `w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${hasError ? 'border-red-500' : isSuccess ? 'border-green-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 ${hasError ? 'focus:ring-red-500/30' : isSuccess ? 'focus:ring-green-500/30' : 'focus:ring-primary-500/30'} focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10"><X className="w-5 h-5" /></button>
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* LOGIN */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">{t('auth.login')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('auth.no_account')} <button onClick={() => { setView('register'); setRegStep(1); }} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('auth.register')}</button></p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder={t('auth.email')} className={inputClass()} /></div>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type={showPassword ? 'text' : 'password'} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder={t('auth.password')} className={`${inputClass()} pr-10`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                  {loginError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{loginError}</p>}
                  <button type="submit" disabled={loginLoading} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.submit_login')}</button>
                  <div className="relative flex items-center my-4"><div className="flex-1 border-t border-slate-200 dark:border-slate-700" /><span className="px-3 text-xs text-slate-400">ou</span><div className="flex-1 border-t border-slate-200 dark:border-slate-700" /></div>
                  <button type="button" className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    {t('auth.google')}
                  </button>
                  <button type="button" onClick={() => setView('forgot')} className="block w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2">{t('auth.forgot')}</button>
                </form>
              </motion.div>
            )}

            {/* REGISTER - Multi-step */}
            {view === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">{t('auth.register')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('auth.has_account')} <button onClick={() => setView('login')} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('auth.login')}</button></p>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${regStep >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${regStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>1</span>
                    {lang === 'fr' ? 'Obligatoire' : 'Required'}
                  </div>
                  <div className={`flex-1 h-0.5 rounded ${regStep >= 2 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'}`} />
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${regStep >= 2 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${regStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>2</span>
                    <Sparkles className="w-3 h-3" /> {lang === 'fr' ? 'IA Opt.' : 'AI Opt.'}
                  </div>
                </div>

                {regSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                    <p className="text-sm text-primary-600 dark:text-primary-400">{regSuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <AnimatePresence mode="wait">
                      {regStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" required value={regForm.firstName} onChange={e => setRegForm(p => ({ ...p, firstName: e.target.value }))} placeholder={t('auth.first_name')} className={inputClass()} /></div>
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" required value={regForm.lastName} onChange={e => setRegForm(p => ({ ...p, lastName: e.target.value }))} placeholder={t('auth.last_name')} className={inputClass()} /></div>
                          </div>
                          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" required value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} placeholder={t('auth.email')} className={inputClass()} /></div>
                          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type={showPassword ? 'text' : 'password'} required value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} placeholder={t('auth.password')} className={`${inputClass()} pr-10`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                          <div>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type={showPassword ? 'text' : 'password'} required value={regForm.confirmPassword} onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder={t('auth.confirm_password')} className={`${inputClass(!!passwordMismatch, !!passwordsMatch)} pr-10`} />{passwordMismatch && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}{passwordsMatch && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}</div>
                            {passwordMismatch && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{t('auth.password_mismatch')}</p>}
                          </div>
                          <button type="button" onClick={() => { if (step1Valid) setRegStep(2); }} disabled={!step1Valid} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {lang === 'fr' ? 'Continuer' : 'Continue'} <ChevronRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}

                      {regStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                          {/* AI Optimization notice */}
                          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-lg p-3 mb-2">
                            <p className="text-xs text-primary-700 dark:text-primary-400 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {lang === 'fr'
                                ? 'Ces informations permettent à l\'IA Gemini de personnaliser vos recommandations agricoles et optimiser votre tableau de bord dès la première connexion.'
                                : 'This info allows Gemini AI to personalize your crop recommendations and optimize your dashboard from first login.'}
                            </p>
                          </div>
                          {/* Role selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">{lang === 'fr' ? 'Votre rôle' : 'Your role'}</label>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(ROLES).map(([key, val]) => (
                                <button key={key} type="button" onClick={() => setRegForm(p => ({ ...p, role: key as UserRole }))} className={`p-2 rounded-lg border text-center transition-colors ${regForm.role === key ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}>
                                  <span className={`text-xs font-medium ${regForm.role === key ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400'}`}>{lang === 'fr' ? val.label : val.labelEn}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="tel" value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))} placeholder={t('auth.phone')} className={inputClass()} /></div>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><select value={regForm.city} onChange={e => setRegForm(p => ({ ...p, city: e.target.value }))} className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"><option value="">{lang === 'fr' ? 'Région' : 'Region'}</option>{ZONES.map(z => <option key={z} value={z}>{z}</option>)}</select></div>
                          </div>
                          <div className="relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={regForm.farmAddress} onChange={e => setRegForm(p => ({ ...p, farmAddress: e.target.value }))} placeholder={t('auth.farm_address')} className={inputClass()} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" step="0.1" value={regForm.farmSize} onChange={e => setRegForm(p => ({ ...p, farmSize: e.target.value }))} placeholder={lang === 'fr' ? 'Superficie (ha)' : 'Size (ha)'} className={inputClass()} /></div>
                            <div className="relative"><Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><select value={regForm.primaryCrop} onChange={e => setRegForm(p => ({ ...p, primaryCrop: e.target.value }))} className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"><option value="">{lang === 'fr' ? 'Culture' : 'Crop'}</option>{CULTURES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                          </div>
                          {regError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{regError}</p>}
                          <div className="flex gap-3">
                            <button type="button" onClick={() => setRegStep(1)} className="flex items-center gap-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /> {lang === 'fr' ? 'Retour' : 'Back'}</button>
                            <button type="submit" disabled={regLoading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.submit_register')}</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Google placeholder always visible */}
                    <div className="relative flex items-center my-3"><div className="flex-1 border-t border-slate-200 dark:border-slate-700" /><span className="px-3 text-xs text-slate-400">ou</span><div className="flex-1 border-t border-slate-200 dark:border-slate-700" /></div>
                    <button type="button" className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      {t('auth.google')}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* FORGOT PASSWORD */}
            {view === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">{t('auth.reset_title')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('auth.reset_desc')}</p>
                {forgotSuccess ? (
                  <div className="text-center py-6"><CheckCircle className="w-10 h-10 text-primary-500 mx-auto mb-3" /><p className="text-sm text-primary-600 dark:text-primary-400">{forgotSuccess}</p><button onClick={() => setView('login')} className="mt-4 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('auth.back_to_login')}</button></div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder={t('auth.email')} className={inputClass()} /></div>
                    {forgotError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{forgotError}</p>}
                    <button type="submit" disabled={forgotLoading} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.reset_submit')}</button>
                    <button type="button" onClick={() => setView('login')} className="block w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:underline">{t('auth.back_to_login')}</button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
