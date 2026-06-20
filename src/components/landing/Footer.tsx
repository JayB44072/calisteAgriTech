import { useState } from 'react';
import { useLang } from '../../contexts/LanguageContext';
import { Sprout, Github, Twitter, Linkedin, Send, CheckCircle } from 'lucide-react';

export function Footer() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer id="contact" className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">CalisteAgriTech</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{t('footer.brand.desc')}</p>
            <div className="flex items-center gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.links.product')}</h4>
            <ul className="space-y-2">
              {['features', 'security', 'docs'].map(key => (
                <li key={key}>
                  <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                    {t(`footer.links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Légal</h4>
            <ul className="space-y-2">
              {['privacy', 'terms', 'cookies'].map(key => (
                <li key={key}>
                  <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                    {t(`footer.legal.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.newsletter.title')}</h4>
            <p className="text-sm text-slate-400 mb-4">{t('footer.newsletter.desc')}</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-primary-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Merci pour votre inscription !
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} CalisteAgriTech. {t('footer.rights')}
          </p>
          <p className="text-xs text-slate-600">Agriculture intelligente · Cameroun 🌱</p>
        </div>
      </div>
    </footer>
  );
}
