import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle } from 'lucide-react';

export const ProfileScore = ({ profile }) => {
  const { t } = useTranslation();

  // Fonction pour calculer le score de complétion
  const calculateProfileScore = () => {
    const checks = [
      { key: 'profilePhoto', value: profile?.photo_url, label: t('profilePhoto') },
      { key: 'biography', value: profile?.bio && profile.bio.length > 20, label: t('biography') },
      { key: 'budgetRange', value: profile?.budget_min && profile?.budget_max, label: t('budgetRange') },
      { key: 'religiousPractice', value: profile?.religious_practice, label: t('religiousPractice') },
      { 
        key: 'whatYouAreLookingFor', 
        value: profile?.seeking_roommate || profile?.seeking_studio || profile?.has_space, 
        label: t('whatYouAreLookingFor') 
      },
      { key: 'productiveSchedule', value: profile?.productive_time, label: t('productiveSchedule') },
      { key: 'gender', value: profile?.gender, label: t('gender') },
      { key: 'city', value: profile?.city, label: t('city') },
      { key: 'creativeType', value: profile?.creative_type, label: t('creativeType') },
      { key: 'age', value: profile?.age, label: t('age') }
    ];

    const completed = checks.filter(check => check.value).length;
    const total = checks.length;
    const percentage = Math.round((completed / total) * 100);

    return { percentage, checks, completed, total };
  };

  const { percentage, checks } = calculateProfileScore();

  // Masquer le composant si le profil est à 100%
  if (percentage === 100) return null;

  // Couleur de la barre selon le pourcentage
  const getBarColor = () => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500';
    if (percentage >= 70) return 'from-cyan-500 to-blue-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-indigo-500';
  };

  return (
    <div className="bg-slate-800/50 border border-violet-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {t('completeYourProfile')}
        </h3>
        <span className="text-2xl font-black text-violet-400">
          {percentage}%
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full bg-gradient-to-r ${getBarColor()} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Liste des éléments */}
      {percentage < 100 && (
        <div>
          <p className="text-gray-400 text-sm mb-3">{t('missing')}</p>
          <div className="space-y-2">
            {checks.map((check) => (
              <div key={check.key} className="flex items-center gap-2">
                {check.value ? (
                  <CheckCircle className="text-green-400" size={18} />
                ) : (
                  <XCircle className="text-gray-500" size={18} />
                )}
                <span className={`text-sm ${check.value ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {percentage === 100 && (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-green-400 font-semibold">
            {t('profileCompletion')} 100% !
          </p>
        </div>
      )}
    </div>
  );
};
