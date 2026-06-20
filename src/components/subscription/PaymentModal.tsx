import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CreditCard, Check, Loader2, AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import type { Plan, PlanId } from '../../hooks/useSubscription';

type PayMethod = 'orange' | 'mtn' | 'card';
type Step = 'method' | 'details' | 'verifying' | 'success';

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: (planId: PlanId) => void;
}

function OrangeLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FF7900" />
      <circle cx="20" cy="20" r="10" fill="white" />
    </svg>
  );
}

function MTNLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FFC82E" />
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#003087">MTN</text>
    </svg>
  );
}

// Animated verification steps
const VERIFY_STEPS = [
  'Vérification de l\'identité…',
  'Contrôle du compte…',
  'Autorisation du paiement…',
  'Confirmation en cours…',
];

function VerifyingScreen({ method, amount }: { method: PayMethod; amount: number }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, VERIFY_STEPS.length - 1));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-6 space-y-5">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full flex items-center justify-center">
          {method === 'orange' ? <OrangeLogo /> : method === 'mtn' ? <MTNLogo /> : <CreditCard className="w-6 h-6 text-blue-500" />}
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-slate-100">Traitement en cours</p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {amount.toLocaleString('fr-FR')} FCFA
        </p>
      </div>
      <div className="space-y-2 text-left max-w-xs mx-auto">
        {VERIFY_STEPS.map((step, i) => (
          <div key={step} className={`flex items-center gap-2 text-sm transition-all ${i <= stepIdx ? 'opacity-100' : 'opacity-0'}`}>
            {i < stepIdx
              ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              : <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
            }
            <span className={i < stepIdx ? 'text-gray-500 dark:text-slate-400 line-through' : 'text-gray-700 dark:text-slate-200 font-medium'}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaymentModal({ plan, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [step, setStep] = useState<Step>('method');

  // Mobile money fields
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '');
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d;
  };

  const startVerifying = async () => {
    setStep('verifying');
    // Simulate processing time with all steps
    await new Promise(r => setTimeout(r, 3200));
    setStep('success');
    setTimeout(() => onSuccess(plan.id), 1800);
  };

  const handleMobileSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Veuillez entrer votre nom complet'); return; }
    if (!phone.match(/^[0-9]{9}$/)) {
      setError('Numéro camerounais invalide (9 chiffres requis)');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    startVerifying();
  };

  const handleCardSubmit = async () => {
    setError('');
    if (!cardName.trim()) { setError('Veuillez entrer le nom figurant sur la carte'); return; }
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.length < 16) { setError('Numéro de carte incomplet'); return; }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) { setError('Date d\'expiration invalide (MM/AA)'); return; }
    if (cvv.length < 3) { setError('CVV invalide'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    startVerifying();
  };

  const methodLabel = method === 'orange' ? 'Orange Money' : method === 'mtn' ? 'MTN MoMo' : 'Carte bancaire';
  const canGoBack = step === 'details';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step === 'verifying' ? undefined : onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <motion.div
          className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {canGoBack && (
                  <button onClick={() => { setStep('method'); setError(''); }} className="p-1 hover:bg-white/20 rounded-lg transition-colors mr-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <Lock className="w-4 h-4 opacity-80" />
                <span className="text-sm font-medium opacity-90">Paiement sécurisé</span>
              </div>
              {step !== 'verifying' && (
                <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold">Souscrire au plan {plan.name}</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {plan.price.toLocaleString('fr-FR')} FCFA / mois • Résiliable à tout moment
            </p>
          </div>

          <div className="p-6">
            {/* STEP: method */}
            {step === 'method' && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">Choisissez votre mode de paiement</p>
                <button onClick={() => { setMethod('orange'); setStep('details'); setError(''); }} className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-400 rounded-xl transition-colors group">
                  <OrangeLogo />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">Orange Money</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Paiement via votre compte Orange Money</p>
                  </div>
                </button>
                <button onClick={() => { setMethod('mtn'); setStep('details'); setError(''); }} className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-slate-600 hover:border-yellow-400 dark:hover:border-yellow-400 rounded-xl transition-colors group">
                  <MTNLogo />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400">MTN Mobile Money</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Paiement via votre compte MTN MoMo</p>
                  </div>
                </button>
                <button onClick={() => { setMethod('card'); setStep('details'); setError(''); }} className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 rounded-xl transition-colors group">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Carte bancaire</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Visa, Mastercard, UBA, Afriland...</p>
                  </div>
                </button>
              </div>
            )}

            {/* STEP: details — Mobile Money */}
            {step === 'details' && method !== 'card' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Paiement {methodLabel}</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Numéro {method === 'orange' ? 'Orange' : 'MTN'} (9 chiffres)
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 font-mono">+237</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="6XXXXXXXX"
                      className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                {error && <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
                <button
                  onClick={handleMobileSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  {loading ? 'Vérification…' : `Payer ${plan.price.toLocaleString('fr-FR')} FCFA`}
                </button>
              </div>
            )}

            {/* STEP: details — Carte bancaire */}
            {step === 'details' && method === 'card' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Informations de la carte</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Nom sur la carte</label>
                  <input
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="Nom tel qu'il figure sur la carte"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Numéro de carte</label>
                  <div className="relative">
                    <input
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCard(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Date d'expiration</label>
                    <input
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">CVV</label>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      maxLength={3}
                      type="password"
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                {error && <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Paiement chiffré SSL — vos données ne sont pas stockées
                </div>
                <button
                  onClick={handleCardSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {loading ? 'Vérification…' : `Payer ${plan.price.toLocaleString('fr-FR')} FCFA`}
                </button>
              </div>
            )}

            {/* STEP: verifying */}
            {step === 'verifying' && method && (
              <VerifyingScreen method={method} amount={plan.price} />
            )}

            {/* STEP: success */}
            {step === 'success' && (
              <motion.div className="text-center py-4 space-y-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Paiement validé !</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Bienvenue dans le plan <strong className="text-emerald-600 dark:text-emerald-400">{plan.name}</strong>.<br />
                  Toutes les fonctionnalités sont maintenant actives.
                </p>
                <div className="text-xs text-gray-400 dark:text-slate-500">Redirection en cours…</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
