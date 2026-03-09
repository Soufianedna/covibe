import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export const Filters = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    budgetMin: '',
    budgetMax: '',
    ageMin: '',
    ageMax: '',
    gender: [],
    languages: [],
    creativeTypes: [],
    seeking: [],
    productiveTimes: [],
      workLocation: [],
    minCleanliness: 1,
    smoking: null,
    pets: null,
    substances: null,
    searchRadius: 25,
    religion: [],
    city: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key, value) => {
    const current = filters[key];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleFilterChange(key, newValue);
  };

  const resetFilters = () => {
    const emptyFilters = {
      budgetMin: '',
      budgetMax: '',
      ageMin: '',
      ageMax: '',
      gender: [],
      languages: [],
      creativeTypes: [],
      seeking: [],
      productiveTimes: [],
      workLocation: [],
      smoking: null,
      pets: null,
      substances: null,
      religion: [],
      city: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.budgetMin || filters.budgetMax) count++;
    if (filters.ageMin || filters.ageMax) count++;
    if (filters.gender.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.creativeTypes.length > 0) count++;
    if (filters.seeking.length > 0) count++;
    if (filters.productiveTimes.length > 0) count++;
    if (filters.workLocation.length > 0) count++;
    if (filters.minCleanliness > 1) count++;
    if (filters.smoking !== null) count++;
    if (filters.pets !== null) count++;
    if (filters.substances !== null) count++;
    if (filters.religion.length > 0) count++;
    return count;
  };

  const activeCount = countActiveFilters();

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-violet-500/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-violet-400" />
          <span className="text-white font-semibold">{t('filters')}</span>
          {activeCount > 0 && (
            <span className="px-3 py-1 bg-violet-500 text-white text-sm rounded-full font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-slate-800/50 rounded-xl border border-violet-500/30 space-y-6">
          {/* Ville */}
          <div>
            <h3 className="text-white font-semibold mb-3">🏙️ {t('city')}</h3>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">{t('anywhere')}</option>
              <option value="vancouver">Vancouver</option>
              <option value="montreal">Montréal</option>
              <option value="toronto">Toronto</option>
            </select>
          </div>
          {/* Budget */}
          <div>
            <h3 className="text-white font-semibold mb-3">💰 {t('budgetMonthly')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.budgetMin}
                onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.budgetMax}
                onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>


          {/* DISTANCE */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              📍 {t('searchRadius')} : {filters.searchRadius}km
            </h3>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={filters.searchRadius}
              onChange={(e) => handleFilterChange('searchRadius', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((filters.searchRadius - 5) / 45) * 100}%, #374151 ${((filters.searchRadius - 5) / 45) * 100}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5km</span>
              <span>50km</span>
            </div>
          </div>
          {/* ÂGE */}
          <div>
            <h3 className="text-white font-semibold mb-3">🎂 { t('ageRange') }</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.ageMin}
                onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.ageMax}
                onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* SEXE */}
          <div>
            <h3 className="text-white font-semibold mb-3">👤 { t('sex') }</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'man', label: '♂️ Homme' },
                { value: 'woman', label: '♀️ Femme' },
                { value: 'non_binary', label: '⚧️ Non-binaire' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('gender', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.gender.includes(value)
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* LANGUES */}
          <div>
            <h3 className="text-white font-semibold mb-3">🌍 { t('languages') }</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'french', label: '🇫🇷 Français' },
                { value: 'english', label: '🇬🇧 Anglais' },
                { value: 'spanish', label: '🇪🇸 Espagnol' },
                { value: 'mandarin', label: '🇨🇳 Mandarin' },
                { value: 'arabic', label: '🇸🇦 Arabe' },
                { value: 'portuguese', label: '🇵🇹 Portugais' },
                { value: 'german', label: '🇩🇪 Allemand' },
                { value: 'japanese', label: '🇯🇵 Japonais' },
                { value: 'korean', label: '🇰🇷 Coréen' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('languages', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.languages.includes(value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Type créatif */}
          <div>
            <h3 className="text-white font-semibold mb-3">🎨 { t('creativeType') }</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'musician', label: '🎵 Musicien·ne' },
                { value: 'artist', label: '🎨 Artiste' },
                { value: 'content_creator', label: '📹 Créateur·rice' },
                { value: 'photographer', label: '📸 Photographe' },
                { value: 'developer', label: '💻 Dev' },
                { value: 'writer', label: '✍️ Écrivain·e' },
                { value: 'entrepreneur', label: '🚀 Entrepreneur·e' },
                { value: 'language_exchange', label: '🗣️ Coloc linguistique' },
                { value: 'other', label: '✨ Autre' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('creativeTypes', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.creativeTypes.includes(value)
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Que cherches-tu */}
          <div>
            <h3 className="text-white font-semibold mb-3">🏠 { t('whatAreYouLookingFor') }</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'seeking_roommate', label: '🏠 Coloc' },
                { value: 'seeking_studio', label: '🎨 Studio' },
                { value: 'has_space', label: '✨ A un espace' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('seeking', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.seeking.includes(value)
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* { t('productiveTime') } */}
          <div>
            <h3 className="text-white font-semibold mb-3">🌅 { t('productiveTime') }</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'early', label: '🌅 Matinal' },
                { value: 'day', label: '☀️ Journée' },
                { value: 'late', label: '🌆 Soirée' },
                { value: 'night', label: '🌙 Nuit' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('productiveTimes', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.productiveTimes.includes(value)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>
          {/* Lieu de travail */}
          <div>
            <h3 className="text-white font-semibold mb-3">💼 { t('workLocation') }</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'remote', label: '🏠 Télétravail' },
                { value: 'office', label: '🏢 Bureau' },
                { value: 'hybrid', label: '🔄 Hybride' },
                { value: 'freelance', label: '💼 Freelance' },
                { value: 'student', label: '📚 Étudiant' },
                { value: 'other', label: '🎨 Autre' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('workLocation', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.workLocation.includes(value)
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>
          {/* Religion */}
          <div>
            <h3 className="text-white font-semibold mb-3">🙏 { t('religion') }</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'none', label: 'Aucune préférence' },
                { value: 'muslim', label: 'Musulman' },
                { value: 'christian', label: 'Chrétien' },
                { value: 'jewish', label: 'Juif' },
                { value: 'vegetarian_vegan', label: 'Végan/Végétarien' },
                { value: 'spiritual', label: 'Spirituel' },
                { value: 'secular', label: 'Laïc' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('religion', value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.religion.includes(value)
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* { t('minCleanliness') } */}
          <div>
            <h3 className="text-white font-semibold mb-3">🧹 { t('minCleanliness') } : {filters.minCleanliness}/5</h3>
            <input
              type="range"
              min="1"
              max="5"
              value={filters.minCleanliness}
              onChange={(e) => handleFilterChange('minCleanliness', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Préférences rapides */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-semibold mb-3">🚬 { t('smoking') }</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('smoking', null)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold ${filters.smoking === null ? 'bg-violet-500 text-white' : 'bg-slate-700 text-gray-300'}`}
                >
                  { t('doesNotMatter') }
                </button>
                <button
                  onClick={() => handleFilterChange('smoking', false)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold ${filters.smoking === false ? 'bg-green-500 text-white' : 'bg-slate-700 text-gray-300'}`}
                >
                  { t('no') }
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">🐾 { t('pets') }</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('pets', null)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold ${filters.pets === null ? 'bg-violet-500 text-white' : 'bg-slate-700 text-gray-300'}`}
                >
                  { t('doesNotMatter') }
                </button>
                <button
                  onClick={() => handleFilterChange('pets', true)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold ${filters.pets === true ? 'bg-green-500 text-white' : 'bg-slate-700 text-gray-300'}`}
                >
                  { t('yes') }
                </button>
              </div>
            </div>
          </div>

          {/* Bouton reset */}
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <X size={20} />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};