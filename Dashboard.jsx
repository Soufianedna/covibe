import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getTopMatches, getCompatibilityLevel } from '../lib/matching';
import { Logo } from './Logo';
import { LogOut, User, Heart, MessageCircle, MapPin, Calendar } from 'lucide-react';

export const Dashboard = ({ user, userProfile, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [view, setView] = useState('matches'); // 'matches' or 'profile'

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Charger tous les profils de la même ville
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('city', userProfile.city)
        .eq('onboarding_complete', true)
        .neq('id', user.id);

      if (error) throw error;

      // Calculer les matches avec l'algorithme
      const topMatches = getTopMatches(userProfile, data || []);
      setMatches(topMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const MatchCard = ({ match }) => {
    const compatibility = getCompatibilityLevel(match.compatibility);
    
    return (
      <div
        onClick={() => setSelectedMatch(match)}
        className="bg-slate-800/50 border border-pink-500/30 rounded-2xl p-6 hover:border-pink-500 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          {/* Photo */}
          <img
            src={match.photo_url || 'https://via.placeholder.com/80'}
            alt={match.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-pink-500"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                  {match.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {match.age} ans • {match.creative_type === 'musician' ? '🎵 Musicien·ne' :
                   match.creative_type === 'artist' ? '🎨 Artiste' :
                   match.creative_type === 'content_creator' ? '🎬 Créateur·rice' :
                   match.creative_type === 'developer' ? '💻 Dev' : '✨ ' + match.creative_type}
                </p>
              </div>
              
              {/* Compatibility Score */}
              <div className="text-center">
                <div className={`text-3xl font-black ${compatibility.color}`}>
                  {match.compatibility}%
                </div>
                <p className="text-xs text-gray-400">{compatibility.level}</p>
              </div>
            </div>

            {/* Bio preview */}
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {match.bio}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                {match.productive_time === 'early' ? '🌅 Matinal' :
                 match.productive_time === 'night' ? '🦉 Noctambule' :
                 match.productive_time === 'late' ? '🌆 Soir' : '☀️ Jour'}
              </span>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold">
                {match.weekend_style === 'creative' ? '🎨 Créatif' :
                 match.weekend_style === 'social' ? '🎉 Social' :
                 match.weekend_style === 'chill' ? '🛋️ Chill' : '🏔️ Actif'}
              </span>
              <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs font-semibold">
                💰 ${match.budget_min}-${match.budget_max}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full mt-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Voir le profil complet →
        </button>
      </div>
    );
  };

  const MatchDetailModal = ({ match, onClose }) => {
    if (!match) return null;

    const compatibility = getCompatibilityLevel(match.compatibility);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
        <div className="bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-500/30" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="relative">
            <img
              src={match.photo_url || 'https://via.placeholder.com/600x400'}
              alt={match.name}
              className="w-full h-64 object-cover rounded-t-3xl"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              ✕
            </button>
            
            {/* Compatibility Badge */}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black ${compatibility.color}`}>
                  {match.compatibility}%
                </span>
                <span className="text-white font-semibold">{compatibility.level}</span>
                <span className="text-2xl">{compatibility.emoji}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">{match.name}</h2>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>{match.age} ans</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {match.city === 'vancouver' ? 'Vancouver' : 'Montréal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">À propos</h3>
              <p className="text-gray-300 leading-relaxed">{match.bio}</p>
            </div>

            {/* Lifestyle Info */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Domaine créatif</p>
                <p className="text-white font-semibold">
                  {match.creative_type === 'musician' ? '🎵 Musicien·ne' :
                   match.creative_type === 'artist' ? '🎨 Artiste visuel·le' :
                   match.creative_type === 'content_creator' ? '🎬 Créateur·rice de contenu' :
                   match.creative_type === 'photographer' ? '📸 Photographe' :
                   match.creative_type === 'developer' ? '💻 Développeur·se' :
                   match.creative_type === 'writer' ? '✍️ Écrivain·e' :
                   match.creative_type === 'entrepreneur' ? '🚀 Entrepreneur·e' : '✨ Autre'}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Productivité</p>
                <p className="text-white font-semibold">
                  {match.productive_time === 'early' ? '🌅 Tôt le matin' :
                   match.productive_time === 'day' ? '☀️ Après-midi' :
                   match.productive_time === 'late' ? '🌆 Soirée' : '🦉 Nuit'}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Style de weekend</p>
                <p className="text-white font-semibold">
                  {match.weekend_style === 'creative' ? '🎨 Projets créatifs' :
                   match.weekend_style === 'social' ? '🎉 Socialiser' :
                   match.weekend_style === 'chill' ? '🛋️ Relaxer' : '🏔️ Actif'}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Espace de vie</p>
                <p className="text-white font-semibold">
                  {match.living_space_style === 'creative' ? '🎬 Studio créatif' :
                   match.living_space_style === 'organized' ? '✨ Minimaliste' :
                   match.living_space_style === 'cozy' ? '🏡 Cosy' : '👥 Social'}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Budget mensuel</p>
                <p className="text-white font-semibold">
                  ${match.budget_min} - ${match.budget_max}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Priorité</p>
                <p className="text-white font-semibold">
                  {match.priority === 'private' ? '🚪 Espace personnel' :
                   match.priority === 'social' ? '❤️ Amitiés' :
                   match.priority === 'budget' ? '💰 Économies' : '🤝 Valeurs'}
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Préférences</h3>
              <div className="flex flex-wrap gap-2">
                {match.smoking && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                    🚬 Fumeur·se
                  </span>
                )}
                {match.pets && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    🐾 A des animaux
                  </span>
                )}
                {match.pets_ok && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    ✅ Accepte les animaux
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  🔊 Bruit: {match.noise_tolerance}/5
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  👥 Invités: {match.guests_frequency}/5
                </span>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                  ✨ Propreté: {match.cleanliness}/5
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Heart size={20} />
                Intéressé·e
              </button>
              <button className="flex-1 py-4 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-pink-500/20 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              CoVibe
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('matches')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'matches'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Heart size={20} className="inline mr-2" />
              Matches
            </button>
            <button
              onClick={() => setView('profile')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'profile'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <User size={20} className="inline mr-2" />
              Profil
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-300 hover:text-white transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {view === 'matches' ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-black text-white mb-2">
                Tes Matches 🔥
              </h2>
              <p className="text-gray-400 text-lg">
                {matches.length} colocs potentiels à {userProfile.city === 'vancouver' ? 'Vancouver' : 'Montréal'}
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-400">Chargement de tes matches...</p>
              </div>
            )}

            {/* No matches */}
            {!loading && matches.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Aucun match pour l'instant
                </h3>
                <p className="text-gray-400">
                  Sois patient·e, de nouveaux membres rejoignent chaque jour !
                </p>
              </div>
            )}

            {/* Matches Grid */}
            {!loading && matches.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* User Profile View */
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 border border-pink-500/30 rounded-3xl p-8">
              <div className="text-center mb-6">
                <img
                  src={userProfile.photo_url || 'https://via.placeholder.com/150'}
                  alt={userProfile.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-pink-500 mb-4"
                />
                <h2 className="text-3xl font-black text-white mb-2">{userProfile.name}</h2>
                <p className="text-gray-400">{userProfile.age} ans • {userProfile.city === 'vancouver' ? 'Vancouver' : 'Montréal'}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Bio</p>
                  <p className="text-white">{userProfile.bio}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Budget</p>
                  <p className="text-white">${userProfile.budget_min} - ${userProfile.budget_max} /mois</p>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                Modifier mon profil
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
};
