import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Cookies = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isFR = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-violet-400 hover:text-violet-300 flex items-center gap-2">
          ← {isFR ? 'Retour' : 'Back'}
        </button>
        <h1 className="text-3xl font-bold mb-2">{isFR ? 'Politique de cookies' : 'Cookie Policy'}</h1>
        <p className="text-gray-400 mb-8">{isFR ? 'Dernière mise à jour : février 2026' : 'Last updated: February 2026'}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '1. Qu\'est-ce qu\'un cookie ?' : '1. What is a cookie?'}</h2>
            <p>{isFR ? 'Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur CoVibe. Il nous permet de mémoriser vos préférences et d\'améliorer votre expérience.' : 'A cookie is a small text file stored on your device when you visit CoVibe. It helps us remember your preferences and improve your experience.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '2. Cookies utilisés' : '2. Cookies we use'}</h2>
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="font-bold text-white mb-1">{isFR ? '🔧 Cookies fonctionnels (obligatoires)' : '🔧 Functional cookies (required)'}</h3>
                <p className="text-sm">{isFR ? 'Nécessaires au fonctionnement de l\'app : session utilisateur, langue choisie, préférences d\'affichage.' : 'Required for the app to work: user session, language preference, display settings.'}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="font-bold text-white mb-1">{isFR ? '📊 Cookies analytiques (Google Analytics)' : '📊 Analytics cookies (Google Analytics)'}</h3>
                <p className="text-sm">{isFR ? 'Nous utilisons Google Analytics pour comprendre comment les utilisateurs interagissent avec CoVibe. Les données sont anonymisées.' : 'We use Google Analytics to understand how users interact with CoVibe. Data is anonymized.'}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '3. Gestion des cookies' : '3. Managing cookies'}</h2>
            <p>{isFR ? 'Vous pouvez désactiver les cookies dans les paramètres de votre navigateur. Notez que désactiver certains cookies peut affecter le fonctionnement de l\'app.' : 'You can disable cookies in your browser settings. Note that disabling some cookies may affect app functionality.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '4. Contact' : '4. Contact'}</h2>
            <p>{isFR ? 'Pour toute question sur notre utilisation des cookies : contact@soufdna.com' : 'For any questions about our cookie use: contact@soufdna.com'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
