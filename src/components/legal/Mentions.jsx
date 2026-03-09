import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Mentions = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isFR = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-violet-400 hover:text-violet-300 flex items-center gap-2">
          ← {isFR ? 'Retour' : 'Back'}
        </button>
        <h1 className="text-3xl font-bold mb-2">{isFR ? 'Mentions Légales' : 'Legal Notice'}</h1>
        <p className="text-gray-400 mb-8">{isFR ? 'Dernière mise à jour : février 2026' : 'Last updated: February 2026'}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '1. Éditeur' : '1. Publisher'}</h2>
            <p><strong className="text-white">Souf DNA Corp</strong></p>
            <p>{isFR ? 'Société enregistrée au Canada' : 'Company registered in Canada'}</p>
            <p>Email : contact@soufdna.com</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '2. Hébergement' : '2. Hosting'}</h2>
            <p><strong className="text-white">Supabase Inc.</strong></p>
            <p>970 Toa Payoh North, Singapore</p>
            <p>supabase.com</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '3. Propriété intellectuelle' : '3. Intellectual property'}</h2>
            <p>{isFR ? 'L\'ensemble du contenu de CoVibe (logo, textes, design, code) est la propriété exclusive de Souf DNA Corp. Toute reproduction sans autorisation est interdite.' : 'All CoVibe content (logo, text, design, code) is the exclusive property of Souf DNA Corp. Any reproduction without permission is prohibited.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '4. Contact' : '4. Contact'}</h2>
            <p>{isFR ? 'Pour toute question légale : contact@soufdna.com' : 'For any legal questions: contact@soufdna.com'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
