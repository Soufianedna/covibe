import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export const FilterPills = ({ onFilterChange, hasSpace }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [tempFilters, setTempFilters] = useState({
    budgetMin: '', budgetMax: '', ageMin: '', ageMax: '',
    gender: [], smoking: null, pets: null, searchRadius: 25,
    creativeTypes: [], productiveTimes: [], languages: []
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value || (Array.isArray(value) && value.length === 0) || value === null) {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeCount = Object.keys(activeFilters).filter(k => {
    const v = activeFilters[k];
    return v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length;

  const genderOptions = [
    { value: 'woman', label: '👩 Femme' },
    { value: 'man', label: '👨 Homme' },
    { value: 'non_binary', label: '🌈 Non-binaire' },
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

  const seekingOptions = [
    { value: 'roommate', label: '🏠 Cherche coloc' },
    { value: 'space', label: '🔑 A un espace' },
  ];

  const creativeOptions = [
    { value: 'musician', label: '🎵 Musicien·ne' },
    { value: 'artist', label: '🎨 Artiste' },
    { value: 'developer', label: '💻 Dev' },
    { value: 'content_creator', label: '📱 Créateur·rice' },
    { value: 'entrepreneur', label: '🚀 Entrepreneur·e' },
    { value: 'designer', label: '✏️ Designer' },
  ];

  const toggleArrayFilter = (key, value, filters, setFilters) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const applyAndClose = () => {
    setActiveFilters(tempFilters);
    onFilterChange(tempFilters);
    setShowAdvanced(false);
  };

  const resetFilters = () => {
    const empty = { budgetMin: '', budgetMax: '', ageMin: '', ageMax: '', gender: [], smoking: null, pets: null, searchRadius: 25, creativeTypes: [], productiveTimes: [] };
    setTempFilters(empty);
    setActiveFilters({});
    onFilterChange({});
  };

  if (showAdvanced) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto pb-32 overflow-x-hidden">
        <div className="p-6 pt-16">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setShowAdvanced(false)} className="p-2 hover:bg-slate-700 rounded-xl">
              <X size={24} className="text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">Filtres</h2>
            <button onClick={resetFilters} className="text-violet-400 font-semibold text-sm">Réinitialiser</button>
          </div>

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

          {/* Type créatif */}
          <div className="mb-6">
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

          {/* Budget */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Budget (CAD/mois)</p>
            <div className="flex gap-3">
              <input type="number" placeholder="Min" value={tempFilters.budgetMin}
                onChange={e => setTempFilters({...tempFilters, budgetMin: e.target.value})}
                className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm" />
              <input type="number" placeholder="Max" value={tempFilters.budgetMax}
                onChange={e => setTempFilters({...tempFilters, budgetMax: e.target.value})}
                className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm" />
            </div>
          </div>

          {/* Âge */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Âge</p>
            <div className="flex gap-3">
              <input type="number" placeholder="Min" value={tempFilters.ageMin}
                onChange={e => setTempFilters({...tempFilters, ageMin: e.target.value})}
                className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm" />
              <input type="number" placeholder="Max" value={tempFilters.ageMax}
                onChange={e => setTempFilters({...tempFilters, ageMax: e.target.value})}
                className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm" />
            </div>
          </div>

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

          {/* Langues */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Langues</p>
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

          {/* Rayon de recherche */}
          <div className="mb-6">
            <p className="text-white font-bold mb-3">Rayon de recherche: {tempFilters.searchRadius} km</p>
            <input type="range" min="5" max="100" step="5" value={tempFilters.searchRadius}
              onChange={e => setTempFilters({...tempFilters, searchRadius: parseInt(e.target.value)})}
              className="w-full accent-violet-600" />
          </div>
        </div>

        {/* Bouton Appliquer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-700" style={{paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'}}>
          <button onClick={applyAndClose} className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-2xl font-bold text-lg">
            Appliquer les filtres {activeCount > 0 ? `(${activeCount})` : ''}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
      <button onClick={() => setShowAdvanced(true)}
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
