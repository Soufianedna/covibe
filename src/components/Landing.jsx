import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { Apple } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getCityLabel } from '../lib/cityLabel';

const APP_STORE_URL = 'https://apps.apple.com/ca/app/covibe/id6761451628';

// Cadre de téléphone en CSS pur — pas d'image externe pour le châssis.
const PhoneMockup = ({ src, alt }) => (
  <div className="relative mx-auto w-[280px] max-w-full aspect-[9/19.5] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-800 shadow-2xl shadow-violet-900/40 overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-10">
      <div className="w-24 h-5 bg-slate-800 rounded-b-2xl" />
    </div>
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);

// Une section alterne texte/capture, empilée en mobile, côte à côte en desktop.
const Section = ({ title, description, image, alt, reverse, bg }) => (
  <section className={`py-16 px-6 ${bg || ''}`}>
    <div className={`max-w-5xl mx-auto flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}>
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{title}</h2>
        <p className="text-lg text-gray-300">{description}</p>
      </div>
      <div className="flex-1 flex justify-center">
        <PhoneMockup src={image} alt={alt} />
      </div>
    </div>
  </section>
);

export const Landing = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-violet-500/20 z-50" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={40} />
            <span className="text-2xl bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: "'Pacifico', cursive" }}>
              CoVibe
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {t('landingHeroTitle')}
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto md:mx-0">
              {t('landingHeroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {!isNative && (
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Apple size={22} /> {t('appStoreButton')}
                </a>
              )}
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white/5 border border-white/20 text-white text-lg font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                {t('login')}
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <PhoneMockup src="/landing/hero-card.webp" alt="CoVibe" />
          </div>
        </div>
      </section>

      {/* Compatibilité */}
      <Section
        bg="bg-slate-900/50"
        title={t('landingCompatibilityTitle')}
        description={t('landingCompatibilityDesc')}
        image="/landing/compatibility.webp"
        alt={t('landingCompatibilityTitle')}
      />

      {/* Binôme */}
      <Section
        reverse
        title={t('landingPartnershipTitle')}
        description={t('landingPartnershipDesc')}
        image="/landing/partnership.webp"
        alt={t('landingPartnershipTitle')}
      />

      {/* Espaces */}
      <Section
        bg="bg-slate-900/50"
        title={t('landingSpacesTitle')}
        description={t('landingSpacesDesc')}
        image="/landing/space.webp"
        alt={t('landingSpacesTitle')}
      />

      {/* Conversation */}
      <Section
        reverse
        title={t('landingChatTitle')}
        description={t('landingChatDesc')}
        image="/landing/chat.webp"
        alt={t('landingChatTitle')}
      />

      {/* Appel final */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600/20 to-indigo-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-10">
            {t('landingFinalTitle')}
          </h2>
          {!isNative && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-12 py-5 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-2xl font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all mb-10"
            >
              <Apple size={26} /> {t('appStoreButton')}
            </a>
          )}
          <p className="text-gray-400 text-sm uppercase tracking-wide mb-3">{t('landingCitiesLabel')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['vancouver', 'montreal', 'toronto'].map((city) => (
              <span key={city} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-200 font-semibold">
                {getCityLabel(city)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-violet-500/20">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-4">© 2026 CoVibe - Souf DNA Corp</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/privacy" className="hover:text-violet-400 transition-colors">{t('privacyPolicy')}</a>
            <a href="/terms" className="hover:text-violet-400 transition-colors">{t('termsOfService')}</a>
            <a href="/cookies" className="hover:text-violet-400 transition-colors">{t('cookiePolicy')}</a>
            <a href="/mentions" className="hover:text-violet-400 transition-colors">{t('legalNotice')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
