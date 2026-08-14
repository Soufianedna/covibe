import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  if (variant === 'settings') {
    return (
      <button onClick={toggleLanguage} className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🌐</span>
          <div className="text-left">
            <p className="text-white font-semibold">Langue</p>
            <p className="text-gray-400 text-xs">Choisis la langue de l'application</p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-slate-700 rounded-full text-white font-semibold text-sm">
          {i18n.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 text-xs font-medium transition-all flex items-center gap-1"
      title="Change language"
    >
      <span className="text-sm">{i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
      <span>{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
    </button>
  );
};
