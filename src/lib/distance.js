// Fonction pour calculer la distance entre deux points GPS (formule Haversine)
// Retourne la distance en kilomètres

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Si une des coordonnées est nulle, retourner null
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en km
  
  return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
};

// Fonction helper pour convertir degrés en radians
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Fonction pour formater l'affichage de la distance
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return null;
  
  if (distance < 1) {
    return "moins de 1km"; // Moins de 1km → afficher en mètres
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`; // 1-10km → 1 décimale
  } else {
    return `${Math.round(distance)}km`; // Plus de 10km → arrondir
  }
};
