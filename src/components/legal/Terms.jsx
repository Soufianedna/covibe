import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Terms = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isFR = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-violet-400 hover:text-violet-300 flex items-center gap-2">
          ← {isFR ? 'Retour' : 'Back'}
        </button>
        <h1 className="text-3xl font-bold mb-2">{isFR ? 'Conditions Générales d\'Utilisation' : 'Terms of Service'}</h1>
        <p className="text-gray-400 mb-8">{isFR ? 'Dernière mise à jour : février 2026' : 'Last updated: February 2026'}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '1. Acceptation des conditions' : '1. Acceptance'}</h2>
            <p>{isFR ? 'En utilisant CoVibe, vous acceptez les présentes conditions. CoVibe est exploité par Souf DNA Corp (Canada). Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'application.' : 'By using CoVibe, you agree to these terms. CoVibe is operated by Souf DNA Corp (Canada). If you do not agree, please do not use the app.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '2. Description du service' : '2. Service description'}</h2>
            <p>{isFR ? 'CoVibe est une plateforme de mise en relation entre personnes créatives cherchant une colocation ou un espace partagé. CoVibe ne garantit pas la conclusion d\'un accord de colocation et n\'est pas partie aux contrats entre membres.' : 'CoVibe is a platform connecting creative people looking for roommates or shared spaces. CoVibe does not guarantee any roommate agreement and is not party to contracts between members.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '3. Conditions d\'inscription' : '3. Eligibility'}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isFR ? 'Vous devez avoir au moins 18 ans' : 'You must be at least 18 years old'}</li>
              <li>{isFR ? 'Un seul compte par personne' : 'One account per person'}</li>
              <li>{isFR ? 'Les informations fournies doivent être exactes' : 'Information provided must be accurate'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '4. Règles de conduite' : '4. Code of conduct'}</h2>
            <p>{isFR ? 'Il est interdit de :' : 'You may not:'}</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{isFR ? 'Publier des contenus faux, trompeurs ou frauduleux' : 'Post false, misleading or fraudulent content'}</li>
              <li>{isFR ? 'Harceler, menacer ou discriminer d\'autres membres' : 'Harass, threaten or discriminate against other members'}</li>
              <li>{isFR ? 'Utiliser l\'app à des fins commerciales non autorisées' : 'Use the app for unauthorized commercial purposes'}</li>
              <li>{isFR ? 'Tenter d\'accéder aux données d\'autres utilisateurs' : 'Attempt to access other users\' data'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '5. Limitation de responsabilité' : '5. Limitation of liability'}</h2>
            <p>{isFR ? 'CoVibe et Souf DNA Corp ne peuvent être tenus responsables des rencontres, accords ou litiges entre membres. Nous vous encourageons à vérifier l\'identité des personnes avant toute rencontre.' : 'CoVibe and Souf DNA Corp are not liable for meetings, agreements or disputes between members. We encourage you to verify identities before meeting in person.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '6. Résiliation' : '6. Termination'}</h2>
            <p>{isFR ? 'Vous pouvez supprimer votre compte à tout moment. CoVibe se réserve le droit de suspendre ou supprimer tout compte qui viole ces conditions.' : 'You may delete your account at any time. CoVibe reserves the right to suspend or delete any account that violates these terms.'}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{isFR ? '7. Droit applicable' : '7. Governing law'}</h2>
            <p>{isFR ? 'Ces conditions sont régies par les lois de la province de Québec et du Canada.' : 'These terms are governed by the laws of the Province of Quebec and Canada.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
