import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Privacy = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isFR = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-violet-400 hover:text-violet-300 flex items-center gap-2">
          ← {isFR ? 'Retour' : 'Back'}
        </button>
        <h1 className="text-3xl font-bold mb-2">{isFR ? 'Politique de confidentialité' : 'Privacy Policy'}</h1>
        <p className="text-gray-400 mb-8">{isFR ? 'Dernière mise à jour : février 2026' : 'Last updated: February 2026'}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '1. Qui sommes-nous ?' : '1. Who are we?'}</h2>
            <p>{isFR ? 'CoVibe est une application de mise en relation pour colocataires créatifs, exploitée par Souf DNA Corp, basée au Canada. Pour toute question : contact@soufdna.com' : 'CoVibe is a roommate matching app for creative people, operated by Souf DNA Corp, based in Canada. Contact: contact@soufdna.com'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '2. Données collectées' : '2. Data we collect'}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isFR ? 'Informations de profil : nom, âge, genre, ville, photo' : 'Profile info: name, age, gender, city, photo'}</li>
              <li>{isFR ? 'Localisation GPS (uniquement si vous l\'autorisez)' : 'GPS location (only if you allow it)'}</li>
              <li>{isFR ? 'Préférences de colocation (budget, horaires, animaux, etc.)' : 'Roommate preferences (budget, schedule, pets, etc.)'}</li>
              <li>{isFR ? 'Messages échangés avec d\'autres membres' : 'Messages exchanged with other members'}</li>
              <li>{isFR ? 'Données d\'utilisation (pages visitées, clics)' : 'Usage data (pages visited, clicks)'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '3. Utilisation des données' : '3. How we use your data'}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isFR ? 'Vous mettre en relation avec des colocataires compatibles' : 'Match you with compatible roommates'}</li>
              <li>{isFR ? 'Améliorer notre algorithme de matching' : 'Improve our matching algorithm'}</li>
              <li>{isFR ? 'Vous envoyer des notifications liées à votre compte' : 'Send you account-related notifications'}</li>
              <li>{isFR ? 'Analyser l\'utilisation de l\'app (Google Analytics)' : 'Analyze app usage (Google Analytics)'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '4. Partage des données' : '4. Data sharing'}</h2>
            <p>{isFR ? 'Vos données ne sont jamais vendues. Elles peuvent être partagées avec :' : 'Your data is never sold. It may be shared with:'}</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{isFR ? 'Supabase (hébergement base de données, Canada/USA)' : 'Supabase (database hosting, Canada/USA)'}</li>
              <li>{isFR ? 'Google Analytics (statistiques anonymisées)' : 'Google Analytics (anonymized statistics)'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '5. Vos droits' : '5. Your rights'}</h2>
            <p>{isFR ? 'Conformément à la LPRPDE et à la Loi 25 du Québec, vous avez le droit de :' : 'Under PIPEDA and Quebec Law 25, you have the right to:'}</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{isFR ? 'Accéder à vos données personnelles' : 'Access your personal data'}</li>
              <li>{isFR ? 'Corriger vos données' : 'Correct your data'}</li>
              <li>{isFR ? 'Supprimer votre compte et vos données' : 'Delete your account and data'}</li>
              <li>{isFR ? 'Retirer votre consentement à tout moment' : 'Withdraw consent at any time'}</li>
            </ul>
            <p className="mt-3">{isFR ? 'Contact : contact@soufdna.com' : 'Contact: contact@soufdna.com'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '6. Conservation des données' : '6. Data retention'}</h2>
            <p>{isFR ? 'Vos données sont conservées tant que votre compte est actif. Après suppression du compte, les données sont effacées sous 30 jours.' : 'Your data is kept as long as your account is active. After account deletion, data is erased within 30 days.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
