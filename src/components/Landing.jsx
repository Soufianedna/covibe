import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sparkles, MessageCircle, CheckCircle } from 'lucide-react';

export const Landing = ({ onGetStarted }) => {
  const { t } = useTranslation();

  // Profils exemples pour montrer la communauté
  const sampleProfiles = [
    {
      name: "Sarah",
      emoji: "🎨",
      typeKey: "artistShort",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      name: "Marc",
      emoji: "🎵",
      typeKey: "musicianShort",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      name: "Léa",
      emoji: "💻",
      typeKey: "developerShort",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-violet-500/20 z-50" style={{paddingTop: "env(safe-area-inset-top)"}}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={40} />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge avec nombre d'inscrits */}
          <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 rounded-full px-6 py-2 mb-8 animate-pulse">
            <Sparkles className="text-violet-400" size={20} />
            <span className="text-violet-300 font-semibold">
               {t('earlyAccessAvailable')}
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {t('landingHeroTitle')}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            {t('landingHeroSubtitle')}
          </p>

          {/* Profils en bulles */}
          <div className="flex justify-center items-center gap-6 mb-12">
            {sampleProfiles.map((profile, idx) => (
              <div
                key={idx}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-violet-500 overflow-hidden shadow-2xl">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  {profile.emoji} {t(profile.typeKey)}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xl font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              {t('getStartedNow')} →
            </button>
          </div>

        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">
            {t('howItWorks')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-violet-600/10 to-indigo-500/10 border border-violet-500/30 rounded-3xl p-8 text-center hover:scale-105 transition-all">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                1. {t('step1Title')}
              </h3>
              <p className="text-gray-300">
                {t('step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-3xl p-8 text-center hover:scale-105 transition-all">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                2. {t('step2Title')}
              </h3>
              <p className="text-gray-300">
                {t('step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-3xl p-8 text-center hover:scale-105 transition-all">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                3. {t('step3Title')}
              </h3>
              <p className="text-gray-300">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why CoVibe */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">
            {t('whyCovibeTitle')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-violet-500/30 rounded-3xl p-8 hover:border-violet-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('lifestyleMatching')}
              </h3>
              <p className="text-gray-300">
                {t('lifestyleMatchingDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('creativeCommunitiesTitle')}
              </h3>
              <p className="text-gray-300">
                {t('creativeCommunitiesDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('zeroJudgment')}
              </h3>
              <p className="text-gray-300">
                {t('zeroJudgmentDesc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('smartAlgorithm')}
              </h3>
              <p className="text-gray-300">
                {t('smartAlgorithmDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600/20 to-indigo-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            {t('joinCommunity')}
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            {t('joinCommunityDesc')}
          </p>
          <button
            onClick={onGetStarted}
            className="px-12 py-5 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-2xl font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            {t('getStartedNow')} 🚀
          </button>
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
