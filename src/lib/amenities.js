// La colonne `amenities` est stockée en base comme une chaîne JSON (type
// Postgres "text"), contrairement à languages/creative_space_type/
// safe_space_preferences qui sont de vrais tableaux Postgres (text[]).
// Supabase-js ne la parse donc jamais automatiquement : il faut le faire
// explicitement partout où le champ est lu, sinon .map()/.includes()/spread
// tombent sur une chaîne au lieu d'un tableau.

export const parseAmenities = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Pour l'affichage : en plus du parsing sûr, filtre les entrées non
// significatives (ex: "[", "]") issues de données déjà corrompues par
// un ancien bug de sauvegarde.
export const getDisplayAmenities = (raw) =>
  parseAmenities(raw).filter((a) => typeof a === 'string' && /[a-zA-Z0-9]/.test(a));
