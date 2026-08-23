import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { SafeAreaTop } from './SafeAreaTop';

const DEFAULT_FILTERS = {
  budgetMin: '', budgetMax: '', ageMin: '', ageMax: '',
  gender: [], smoking: null, pets: null, searchRadius: 25,
  creativeTypes: [], productiveTimes: [], languages: [],
  city: '', moveInBefore: '', lifestyle: [], religion: [],
  minCleanliness: 0, minNoiseTolerance: 0, minGuestsFrequency: 0,
};

export const FilterPills = ({ onFilterChange, hasSpace }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [tempFilters, setTempFilters] = useState(DEFAULT_FILTERS);
  const [expandedGroups, setExpandedGroups] = useState({
    logement: false, modeDeVie: false, habitudes: false, langues: false,
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value || (Array.isArray(value) && value.length === 0) || value === null) {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const isActive = (v) => v !== null && v !== '' && v !== 0 && !(Array.isArray(v) && v.length === 0);

  const activeCount = Object.keys(activeFilters).filter(k => isActive(activeFilters[k])).length;

  const groupActiveCount = (keys) => keys.filter(k => isActive(tempFilters[k])).length;

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const genderOptions = [
    { value: 'woman', label: '👩 Femme' },
    { value: 'man', label: '👨 Homme' },
    { value: 'non_binary', label: '🌈 Non-binaire' },
  ];

  const cityOptions = [
    { value: 'vancouver', label: 'Vancouver' },
    { value: 'montreal', label: 'Montréal' },
    { value: 'toronto', label: 'Toronto' },
  ];

  const languageOptions = [
    { value: 'french', label: '🇫🇷 Français' },
    { value: 'english', label: '🇬🇧 Anglais' },
    { value: 'spanish', label: '🇪🇸 Espagnol' },
    { value: 'arabic', label: '🇸🇦 Arabe' },
    { value: 'portuguese', label: '🇧🇷 Portugais' },
  ];

  const productiveOptions = [
    { value: 'early', label: '🌅 Lève-tôt' },
    { value: 'late', label: '🌙 Couche-tard' },
    { value: 'flexible', label: '🔄 Flexible' },
  ];

  const creativeOptions = [
    { value: 'musician', label: '🎵 Musicien·ne' },
    { value: 'artist', label: '🎨 Artiste' },
    { value: 'developer', label: '💻 Dev' },
    { value: 'content_creator', label: '📱 Créateur·rice' },
    { value: 'entrepreneur', label: '🚀 Entrepreneur·e' },
    { value: 'designer', label: '✏️ Designer' },
  ];

  const lifestyleOptions = [
    { value: 'alcohol_ok', label: '🍷 Alcool OK' },
    { value: 'cannabis_friendly', label: '🌿 420 friendly' },
    { value: 'no_substances', label: '✨ Sobre' },
  ];

  const religionOptions = [
    { value: 'none', label: '🤷 Aucune préférence' },
    { value: 'muslim', label: '☪️ Halal' },
    { value: 'jewish', label: '✡️ Kasher' },
    { value: 'vegetarian_vegan', label: '🌱 Végétarien/Végan' },
    { value: 'spiritual', label: '🕉️ Spirituel' },
    { value: 'secular', label: '🔬 Laïc' },
  ];

  const toggleArrayFilter = (key, value, filters, setFilters) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const openAdvanced = () => {
    // Repartir des filtres réellement actifs, pas d'un état par défaut oublié
    // depuis la dernière ouverture.
    setTempFilters({ ...DEFAULT_FILTERS, ...activeFilters });
    setShowAdvanced(true);
  };

  const applyAndClose = () => {
    setActiveFilters(tempFilters);
    onFilterChange(tempFilters);
    setShowAdvanced(false);
  };

  const resetFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setActiveFilters({});
    onFilterChange({});
  };

  const GroupHeader = ({ title, groupKey, keys }) => {
    const count = groupActiveCount(keys);
    return (
      <button
        type="button"
        onClick={() => toggleGroup(groupKey)}
        className="w-full flex items-center justify-between py-3"
      >
        <span className="text-white font-bold flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-violet-600 text-white text-xs font-bold rounded-full">
              {count}
            </span>
          )}
        </span>
        <span className="text-gray-400">{expandedGroups[groupKey] ? '▾' : '▸'}</span>
      </button>
    );
  };

  if (showAdvanced) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 overflow-y-auto pb-32 overflow-x-hidden">
        <SafeAreaTop />
        <div className="p-6 pt-safe-screen">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setShowAdvanced(false)} className="p-2 hover:bg-slate-700 rounded-xl">
              <X size={24} className="text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">Filtres</h2>
            <button onClick={resetFilters} className="text-violet-400 font-semibold text-sm">Réinitialiser</button>
          </div>

          {/* ===================== ESSENTIEL (toujours ouvert) ===================== */}
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3">Essentiel</p>

          {/* Genre */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Genre</p>
            <div className="flex gap-2 flex-wrap">
              {genderOptions.map(g => (
                <button key={g.value}
                  onClick={() => toggleArrayFilter('gender', g.value, tempFilters, setTempFilters)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${(tempFilters.gender || []).includes(g.value) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Âge */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Âge</p>
            <div className="flex gap-3">
              <input type="number" placeholder="Min" value={tempFilters.ageMin}
                onChange={e => setTempFilters({...tempFilters, ageMin: e.target.value})}
                className="flex-1 min-w-0 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-base" />
              <input type="number" placeholder="Max" value={tempFilters.ageMax}
                onChange={e => setTempFilters({...tempFilters, ageMax: e.target.value})}
                className="flex-1 min-w-0 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-base" />
            </div>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Budget (CAD/mois)</p>
            <div className="flex gap-3">
              <input type="number" placeholder="Min" value={tempFilters.budgetMin}
                onChange={e => setTempFilters({...tempFilters, budgetMin: e.target.value})}
                className="flex-1 min-w-0 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-base" />
              <input type="number" placeholder="Max" value={tempFilters.budgetMax}
                onChange={e => setTempFilters({...tempFilters, budgetMax: e.target.value})}
                className="flex-1 min-w-0 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-base" />
            </div>
          </div>

          {/* Ville */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Ville</p>
            <div className="flex gap-2 flex-wrap">
              {cityOptions.map(c => (
                <button key={c.value}
                  onClick={() => setTempFilters({...tempFilters, city: tempFilters.city === c.value ? '' : c.value})}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${tempFilters.city === c.value ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rayon de recherche */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Rayon de recherche: {tempFilters.searchRadius} km</p>
            <input type="range" min="5" max="100" step="5" value={tempFilters.searchRadius}
              onChange={e => setTempFilters({...tempFilters, searchRadius: parseInt(e.target.value)})}
              className="w-full accent-violet-600" />
          </div>

          {/* ===================== LOGEMENT ===================== */}
          <div className="mb-4 bg-slate-800/50 rounded-2xl px-4">
            <GroupHeader title="🏠 Logement" groupKey="logement" keys={['moveInBefore', 'creativeTypes']} />
            {expandedGroups.logement && (
              <div className="pb-4">
                {/* Date d'emménagement */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">Emménagement souhaité avant le</p>
                  <input type="date" value={tempFilters.moveInBefore}
                    onChange={e => setTempFilters({...tempFilters, moveInBefore: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-base" />
                </div>

                {/* Type créatif */}
                <div>
                  <p className="text-white font-bold mb-3">Type créatif</p>
                  <div className="flex gap-2 flex-wrap">
                    {creativeOptions.map(c => (
                      <button key={c.value}
                        onClick={() => toggleArrayFilter('creativeTypes', c.value, tempFilters, setTempFilters)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${(tempFilters.creativeTypes || []).includes(c.value) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== MODE DE VIE ===================== */}
          <div className="mb-4 bg-slate-800/50 rounded-2xl px-4">
            <GroupHeader title="🌙 Mode de vie" groupKey="modeDeVie" keys={['productiveTimes', 'minCleanliness', 'minNoiseTolerance', 'minGuestsFrequency']} />
            {expandedGroups.modeDeVie && (
              <div className="pb-4">
                {/* Rythme de vie */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">Rythme de vie</p>
                  <div className="flex gap-2 flex-wrap">
                    {productiveOptions.map(p => (
                      <button key={p.value}
                        onClick={() => toggleArrayFilter('productiveTimes', p.value, tempFilters, setTempFilters)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${(tempFilters.productiveTimes || []).includes(p.value) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Propreté */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">
                    Propreté minimum: {tempFilters.minCleanliness > 0 ? `${tempFilters.minCleanliness}/5` : 'Peu importe'}
                  </p>
                  <input type="range" min="0" max="5" step="1" value={tempFilters.minCleanliness}
                    onChange={e => setTempFilters({...tempFilters, minCleanliness: parseInt(e.target.value)})}
                    className="w-full accent-violet-600" />
                </div>

                {/* Tolérance au bruit */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">
                    Tolérance au bruit minimum: {tempFilters.minNoiseTolerance > 0 ? `${tempFilters.minNoiseTolerance}/10` : 'Peu importe'}
                  </p>
                  <input type="range" min="0" max="10" step="1" value={tempFilters.minNoiseTolerance}
                    onChange={e => setTempFilters({...tempFilters, minNoiseTolerance: parseInt(e.target.value)})}
                    className="w-full accent-violet-600" />
                </div>

                {/* Fréquence des invités */}
                <div>
                  <p className="text-white font-bold mb-3">
                    Fréquence des invités minimum: {tempFilters.minGuestsFrequency > 0 ? `${tempFilters.minGuestsFrequency}/5` : 'Peu importe'}
                  </p>
                  <input type="range" min="0" max="5" step="1" value={tempFilters.minGuestsFrequency}
                    onChange={e => setTempFilters({...tempFilters, minGuestsFrequency: parseInt(e.target.value)})}
                    className="w-full accent-violet-600" />
                </div>
              </div>
            )}
          </div>

          {/* ===================== HABITUDES ===================== */}
          <div className="mb-4 bg-slate-800/50 rounded-2xl px-4">
            <GroupHeader title="🚬 Habitudes" groupKey="habitudes" keys={['smoking', 'pets', 'lifestyle', 'religion']} />
            {expandedGroups.habitudes && (
              <div className="pb-4">
                {/* Tabac */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">Tabac</p>
                  <div className="flex gap-2">
                    {[{v: false, l: '🚭 Non-fumeur'}, {v: true, l: '🚬 Fumeur'}].map(o => (
                      <button key={String(o.v)} onClick={() => setTempFilters({...tempFilters, smoking: tempFilters.smoking === o.v ? null : o.v})}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${tempFilters.smoking === o.v ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animaux */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">Animaux</p>
                  <div className="flex gap-2">
                    {[{v: true, l: '🐾 Avec animaux'}, {v: false, l: '❌ Sans animaux'}].map(o => (
                      <button key={String(o.v)} onClick={() => setTempFilters({...tempFilters, pets: tempFilters.pets === o.v ? null : o.v})}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${tempFilters.pets === o.v ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style de vie */}
                <div className="mb-6">
                  <p className="text-white font-bold mb-3">Style de vie</p>
                  <div className="flex gap-2 flex-wrap">
                    {lifestyleOptions.map(l => (
                      <button key={l.value}
                        onClick={() => toggleArrayFilter('lifestyle', l.value, tempFilters, setTempFilters)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${(tempFilters.lifestyle || []).includes(l.value) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pratiques religieuses ou alimentaires */}
                <div>
                  <p className="text-white font-bold mb-3">Pratiques religieuses ou alimentaires</p>
                  <div className="flex gap-2 flex-wrap">
                    {religionOptions.map(r => (
                      <button key={r.value}
                        onClick={() => toggleArrayFilter('religion', r.value, tempFilters, setTempFilters)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${(tempFilters.religion || []).includes(r.value) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== LANGUES ===================== */}
          <div className="mb-4 bg-slate-800/50 rounded-2xl px-4">
            <GroupHeader title="🌍 Langues" groupKey="langues" keys={['languages']} />
            {expandedGroups.langues && (
              <div className="pb-4">
                <div className="flex gap-2 flex-wrap">
                  {languageOptions.map(l => (
                    <button key={l.value}
                      onClick={() => toggleArrayFilter('languages', l.value, tempFilters, setTempFilters)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${(tempFilters.languages || []).includes(l.value) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton Appliquer — bandeau collant, toujours visible quel que soit le scroll */}
        <div className="fixed bottom-0 left-0 right-0 z-10 p-6 bg-white/5 backdrop-blur-xl border-t border-white/10" style={{paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'}}>
          <button onClick={applyAndClose} className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-2xl font-bold text-lg">
            Appliquer les filtres {activeCount > 0 ? `(${activeCount})` : ''}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
      <button onClick={openAdvanced}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeCount > 0 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
        <SlidersHorizontal size={16} />
        {activeCount > 0 ? `Filtres (${activeCount})` : 'Filtres'}
      </button>

      {/* Pills actives */}
      {activeFilters.gender?.map(g => (
        <button key={g} onClick={() => updateFilter('gender', activeFilters.gender.filter(v => v !== g))}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-violet-600 text-white rounded-full text-sm font-semibold">
          {genderOptions.find(o => o.value === g)?.label} <X size={12} />
        </button>
      ))}
      {activeFilters.smoking === false && (
        <button onClick={() => updateFilter('smoking', null)} className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-violet-600 text-white rounded-full text-sm font-semibold">
          🚭 Non-fumeur <X size={12} />
        </button>
      )}
      {activeFilters.smoking === true && (
        <button onClick={() => updateFilter('smoking', null)} className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-violet-600 text-white rounded-full text-sm font-semibold">
          🚬 Fumeur <X size={12} />
        </button>
      )}
    </div>
  );
};
