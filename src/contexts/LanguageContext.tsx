import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type Lang = 'fr' | 'en';

interface Translations {
  [key: string]: { fr: string; en: string };
}

const t: Translations = {
  // Nav
  'nav.features': { fr: 'Fonctionnalités', en: 'Features' },
  'nav.statistics': { fr: 'Statistiques', en: 'Statistics' },
  'nav.contact': { fr: 'Contact', en: 'Contact' },
  'nav.login': { fr: 'Connexion', en: 'Login' },
  'nav.register': { fr: 'Inscription', en: 'Register' },
  'nav.dashboard': { fr: 'Tableau de bord', en: 'Dashboard' },
  'nav.logout': { fr: 'Déconnexion', en: 'Sign Out' },

  // Hero
  'hero.title': {
    fr: 'Révolutionner l\'agriculture au Cameroun grâce au numérique pour tous',
    en: 'Revolutionizing agriculture in Cameroon through digital technology for all',
  },
  'hero.subtitle': {
    fr: 'Surveillance IoT en temps réel, irrigation automatisée et agronomie propulsée par l\'IA Gemini — tout au bout de vos doigts.',
    en: 'Real-time IoT monitoring, automated irrigation, and Gemini AI-powered agronomy — all at your fingertips.',
  },
  'hero.cta.free': { fr: 'Commencer gratuitement', en: 'Get started free' },
  'hero.cta.demo': { fr: 'Découvrir la démo', en: 'Explore the demo' },

  // Auth
  'auth.login': { fr: 'Connexion', en: 'Login' },
  'auth.register': { fr: 'Créer un compte', en: 'Create account' },
  'auth.forgot': { fr: 'Mot de passe oublié ?', en: 'Forgot password?' },
  'auth.email': { fr: 'Adresse e-mail', en: 'Email address' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.confirm_password': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'auth.first_name': { fr: 'Prénom', en: 'First name' },
  'auth.last_name': { fr: 'Nom', en: 'Last name' },
  'auth.phone': { fr: 'Numéro de téléphone', en: 'Phone number' },
  'auth.city': { fr: 'Ville', en: 'City' },
  'auth.farm_address': { fr: 'Adresse de l\'exploitation', en: 'Farm address' },
  'auth.submit_login': { fr: 'Se connecter', en: 'Sign in' },
  'auth.submit_register': { fr: 'Créer le compte', en: 'Create account' },
  'auth.google': { fr: 'Continuer avec Google', en: 'Continue with Google' },
  'auth.no_account': { fr: 'Pas encore de compte ?', en: "Don't have an account?" },
  'auth.has_account': { fr: 'Déjà un compte ?', en: 'Already have an account?' },
  'auth.reset_title': { fr: 'Réinitialiser le mot de passe', en: 'Reset password' },
  'auth.reset_desc': { fr: 'Entrez votre e-mail pour recevoir un lien de récupération.', en: 'Enter your email to receive a recovery link.' },
  'auth.reset_submit': { fr: 'Envoyer le lien', en: 'Send link' },
  'auth.reset_success': { fr: 'Lien de récupération envoyé ! Vérifiez votre boîte mail.', en: 'Recovery link sent! Check your inbox.' },
  'auth.back_to_login': { fr: 'Retour à la connexion', en: 'Back to login' },
  'auth.password_mismatch': { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },

  // Features
  'features.title': { fr: 'Fonctionnalités intelligentes', en: 'Smart Features' },
  'features.subtitle': { fr: 'Des outils conçus pour l\'agriculteur camerounais moderne', en: 'Tools designed for the modern Cameroonian farmer' },
  'features.iot.title': { fr: 'Surveillance IoT en temps réel', en: 'Real-time IoT Monitoring' },
  'features.iot.desc': { fr: 'Humidité du sol, température et humidité de l\'air suivies en continu par des capteurs connectés.', en: 'Soil moisture, temperature, and air humidity tracked continuously by connected sensors.' },
  'features.irrigation.title': { fr: 'Irrigation automatisée', en: 'Automated Irrigation' },
  'features.irrigation.desc': { fr: 'Contrôlez vos motopompes à distance et activez l\'irrigation intelligente basée sur les données capteurs.', en: 'Control your water pumps remotely and activate smart irrigation based on sensor data.' },
  'features.ai.title': { fr: 'Agronome IA Gemini', en: 'Gemini AI Agronomist' },
  'features.ai.desc': { fr: 'Diagnostiquez les maladies, recevez des recommandations de culture et optimisez vos rendements grâce à l\'IA.', en: 'Diagnose diseases, receive crop recommendations, and optimize yields with AI.' },
  'features.calendar.title': { fr: 'Calendrier cultural intelligent', en: 'Smart Crop Calendar' },
  'features.calendar.desc': { fr: 'Planification prédictive générée par l\'IA adaptée à votre région et vos cultures locales.', en: 'AI-generated predictive planning tailored to your region and local crops.' },

  // Stats
  'stats.title': { fr: 'Impact en chiffres', en: 'Impact in numbers' },
  'stats.water': { fr: 'Litres d\'eau économisés', en: 'Liters of water saved' },
  'stats.parcelles': { fr: 'Parcelles surveillées', en: 'Parcels monitored' },
  'stats.diagnoses': { fr: 'Diagnostics IA réalisés', en: 'AI diagnoses performed' },
  'stats.farmers': { fr: 'Agriculteurs actifs', en: 'Active farmers' },

  // Pricing
  'pricing.title': { fr: 'Accès & Tarifs', en: 'Plans & Pricing' },
  'pricing.subtitle': { fr: 'Des solutions adaptées à chaque exploitation', en: 'Solutions adapted to every farm' },
  'pricing.free.name': { fr: 'Gratuit', en: 'Free' },
  'pricing.free.desc': { fr: 'Pour les petits exploitants locaux', en: 'For small local farmers' },
  'pricing.free.f1': { fr: 'Jusqu\'à 3 parcelles', en: 'Up to 3 parcels' },
  'pricing.free.f2': { fr: 'Données capteurs en temps réel', en: 'Real-time sensor data' },
  'pricing.free.f3': { fr: '5 requêtes IA / mois', en: '5 AI requests / month' },
  'pricing.free.f4': { fr: 'Calendrier cultural basique', en: 'Basic crop calendar' },
  'pricing.premium.name': { fr: 'Premium Coopérative', en: 'Premium Cooperative' },
  'pricing.premium.desc': { fr: 'Pour les plantations et coopératives', en: 'For plantations and cooperatives' },
  'pricing.premium.f1': { fr: 'Parcelles illimitées', en: 'Unlimited parcels' },
  'pricing.premium.f2': { fr: 'Irrigation automatisée avancée', en: 'Advanced automated irrigation' },
  'pricing.premium.f3': { fr: 'IA illimitée + priorité', en: 'Unlimited AI + priority' },
  'pricing.premium.f4': { fr: 'Alertes sécurité & intrusions', en: 'Security & intrusion alerts' },
  'pricing.premium.f5': { fr: 'Support dédié 24/7', en: 'Dedicated 24/7 support' },
  'pricing.cta': { fr: 'Choisir ce plan', en: 'Choose this plan' },
  'pricing.popular': { fr: 'Populaire', en: 'Popular' },

  // Testimonials
  'testimonials.title': { fr: 'Témoignages', en: 'Testimonials' },
  'testimonials.subtitle': { fr: 'Ce que disent nos agriculteurs', en: 'What our farmers say' },

  // Footer
  'footer.brand.desc': { fr: 'Plateforme de Smart Farming propulsée par l\'IoT et l\'IA pour l\'agriculture camerounaise.', en: 'Smart Farming platform powered by IoT and AI for Cameroonian agriculture.' },
  'footer.links.product': { fr: 'Produit', en: 'Product' },
  'footer.links.features': { fr: 'Fonctionnalités', en: 'Features' },
  'footer.links.security': { fr: 'Sécurité', en: 'Security' },
  'footer.links.docs': { fr: 'Documentation', en: 'Documentation' },
  'footer.legal.privacy': { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
  'footer.legal.terms': { fr: 'Conditions d\'utilisation', en: 'Terms of Service' },
  'footer.legal.cookies': { fr: 'Gestion des cookies', en: 'Cookie Management' },
  'footer.newsletter.title': { fr: 'Newsletter', en: 'Newsletter' },
  'footer.newsletter.desc': { fr: 'Recevez nos conseils agricoles et mises à jour.', en: 'Receive our farming tips and updates.' },
  'footer.newsletter.placeholder': { fr: 'Votre e-mail', en: 'Your email' },
  'footer.newsletter.submit': { fr: 'S\'abonner', en: 'Subscribe' },
  'footer.rights': { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  const translate = useCallback(
    (key: string): string => {
      const entry = t[key];
      if (!entry) return key;
      return entry[lang] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
