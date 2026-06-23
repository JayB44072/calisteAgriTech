import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Sprout, Droplets, CloudSun, Cpu, AlertCircle, Loader2 } from 'lucide-react';

export function LoginScreen() {
  const { signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err?.message ?? 'Erreur inconnue. Vérifiez la configuration Google OAuth dans Supabase.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
            <Sprout className="w-10 h-10 text-primary-300" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">CherilleTech</h1>
          <p className="text-primary-200 mt-2 text-lg">Smart Farming Dashboard</p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {[
            { icon: Droplets, label: 'Irrigation Auto', color: 'text-blue-300' },
            { icon: CloudSun, label: 'Météo en Direct', color: 'text-amber-300' },
            { icon: Cpu, label: 'IA Agronome', color: 'text-primary-300' },
            { icon: Sprout, label: 'Calendrier IA', color: 'text-cyan-300' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
            >
              <feature.icon className={`w-6 h-6 ${feature.color} mx-auto mb-2`} />
              <span className="text-white/80 text-xs font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">Bienvenue</h2>
          <p className="text-primary-200 text-sm mb-6">
            Connectez-vous pour accéder à votre tableau de bord agricole intelligent
          </p>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/20 border border-red-400/30 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || signingIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {signingIn ? 'Connexion en cours...' : 'Se connecter avec Google'}
          </button>

          <p className="text-primary-300/60 text-xs mt-4 text-center">
            En vous connectant, vous acceptez les conditions d'utilisation de CherilleTech
          </p>
        </div>
      </div>
    </div>
  );
}
