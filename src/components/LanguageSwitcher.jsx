import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-all flex items-center gap-2"
      title="Change language"
    >
      <span className="text-xl">{i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
      <span>{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
    </button>
  );
};
