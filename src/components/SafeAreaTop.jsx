// Bandeau opaque fixe couvrant la safe area en haut d'écran. Contrairement à
// un padding-top, il ne fait jamais partie de la boîte scrollable : il reste
// donc à l'écran quel que soit le défilement du contenu en dessous.
export const SafeAreaTop = ({ className = 'bg-slate-900' }) => (
  <div
    className={`fixed top-0 inset-x-0 z-10 pointer-events-none ${className}`}
    style={{ height: 'var(--safe-top)' }}
  />
);
