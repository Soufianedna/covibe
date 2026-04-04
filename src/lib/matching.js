import { calculateDistance } from './distance';

/**
 * 🎯 ALGORITHME DE COMPATIBILITÉ INTELLIGENT - CoVibe
 * 
 * Calcule un score de compatibilité réaliste basé sur 5 critères:
 * - Budget compatible (30 points)
 * - Rythme de vie similaire (20 points)
 * - Habitudes compatibles (25 points)
 * - Pratiques religieuses/alimentaires (15 points)
 * - Style de vie (propreté, bruit, invités) (10 points)
 */

export const calculateCompatibility = (user1, user2) => {
  let score = 0;
  
  // ====================================
  // 1️⃣ BUDGET COMPATIBLE (30 points max)
  // ====================================
  const budgetScore = calculateBudgetCompatibility(user1, user2);
  score += budgetScore;
  
  // ====================================
  // 2️⃣ RYTHME DE VIE (20 points max)
  // ====================================
  const rhythmScore = calculateRhythmCompatibility(user1, user2);
  score += rhythmScore;
  
  // ====================================
  // 3️⃣ HABITUDES DE VIE (25 points max)
  // ====================================
  const habitsScore = calculateHabitsCompatibility(user1, user2);
  score += habitsScore;
  
  // ====================================
  // 4️⃣ PRATIQUES RELIGIEUSES/ALIMENTAIRES (15 points max)
  // ====================================
  const religionScore = calculateReligionCompatibility(user1, user2);
  score += religionScore;
  
  // ====================================
  // 5️⃣ STYLE DE VIE (10 points max)
  // ====================================
  const lifestyleScore = calculateLifestyleCompatibility(user1, user2);
  score += lifestyleScore;
  
  // Score final sur 100
  return Math.round(score);
};

/**
 * Calcule la compatibilité budgétaire (30 points max)
 */
const calculateBudgetCompatibility = (user1, user2) => {
  // CAS A : user1 a un espace, user2 cherche une chambre
  if (user1.has_space && user1.room_price && !user2.has_space) {
    const budget2Min = user2.budget_min || 0;
    const budget2Max = user2.budget_max || 5000;
    
    // Le room_price doit être dans le budget de user2
    if (user1.room_price >= budget2Min && user1.room_price <= budget2Max) {
      // Bonus si seeking_studio ET has_creative_space
      let bonus = (user2.seeking_studio && user1.has_creative_space) ? 5 : 0;
      // Bonus supplémentaire si les types d'espace correspondent
      if (user2.seeking_creative_space_type?.length > 0 && user1.creative_space_type?.length > 0) {
        const match = user2.seeking_creative_space_type.some(t => user1.creative_space_type.includes(t));
        if (match) bonus += 5;
      }
      return 30 + bonus; // Score parfait + bonus éventuel
    }
    return 0; // Prix incompatible
  }
  
  // CAS B : user2 a un espace, user1 cherche une chambre
  if (user2.has_space && user2.room_price && !user1.has_space) {
    const budget1Min = user1.budget_min || 0;
    const budget1Max = user1.budget_max || 5000;
    
    // Le room_price doit être dans le budget de user1
    if (user2.room_price >= budget1Min && user2.room_price <= budget1Max) {
      // Bonus si seeking_studio ET has_creative_space
      let bonus = (user1.seeking_studio && user2.has_creative_space) ? 5 : 0;
      // Bonus supplémentaire si les types d'espace correspondent
      if (user1.seeking_creative_space_type?.length > 0 && user2.creative_space_type?.length > 0) {
        const match = user1.seeking_creative_space_type.some(t => user2.creative_space_type.includes(t));
        if (match) bonus += 5;
      }
      return 30 + bonus;
    }
    return 0;
  }
  
  // CAS C : Les deux cherchent une chambre (logique originale)
  const budget1Min = user1.budget_min || 0;
  const budget1Max = user1.budget_max || 5000;
  const budget2Min = user2.budget_min || 0;
  const budget2Max = user2.budget_max || 5000;
  
  const overlapMin = Math.max(budget1Min, budget2Min);
  const overlapMax = Math.min(budget1Max, budget2Max);
  
  if (overlapMin > overlapMax) {
    return 0;
  }
  
  const overlap = overlapMax - overlapMin;
  const range1 = budget1Max - budget1Min;
  const range2 = budget2Max - budget2Min;
  const avgRange = (range1 + range2) / 2;
  const overlapRatio = overlap / avgRange;
  
  return Math.min(30, Math.round(overlapRatio * 30));
};

/**
 * Calcule la compatibilité du rythme de vie (20 points max)
 */
const calculateRhythmCompatibility = (user1, user2) => {
  const rhythm1 = user1.productive_time;
  const rhythm2 = user2.productive_time;
  
  if (!rhythm1 || !rhythm2) return 10; // Score neutre si données manquantes
  
  // Même rythme = 20 points
  if (rhythm1 === rhythm2) return 20;
  
  // Rythmes adjacents (ex: early + day, day + late) = 15 points
  const adjacentPairs = [
    ['early', 'day'],
    ['day', 'late'],
    ['late', 'night']
  ];
  
  for (const [r1, r2] of adjacentPairs) {
    if ((rhythm1 === r1 && rhythm2 === r2) || (rhythm1 === r2 && rhythm2 === r1)) {
      return 15;
    }
  }
  
  // Rythmes opposés (ex: early + night) = 5 points
  if ((rhythm1 === 'early' && rhythm2 === 'night') || 
      (rhythm1 === 'night' && rhythm2 === 'early')) {
    return 5;
  }
  
  // Autres cas = 10 points
  return 10;
};

/**
 * Calcule la compatibilité des habitudes (25 points max)
 */
const calculateHabitsCompatibility = (user1, user2) => {
  let points = 0;
  
  // 🚬 FUMEUR (8 points)
  const smoking1 = user1.smoking || false;
  const smoking2 = user2.smoking || false;
  
  if (smoking1 === smoking2) {
    // Même statut = parfait
    points += 8;
  } else {
    // L'un fume, l'autre non = moins compatible
    points += 2;
  }
  
  // 🐾 ANIMAUX (8 points)
  const pets1 = user1.pets || false;
  const pets2 = user2.pets || false;
  const petsOk1 = user1.pets_ok !== false; // true par défaut
  const petsOk2 = user2.pets_ok !== false;
  
  if (pets1 && !petsOk2) {
    // User1 a des animaux mais User2 n'accepte pas = incompatible
    points += 0;
  } else if (pets2 && !petsOk1) {
    // User2 a des animaux mais User1 n'accepte pas = incompatible
    points += 0;
  } else if (pets1 === pets2) {
    // Même statut = parfait
    points += 8;
  } else if ((pets1 && petsOk2) || (pets2 && petsOk1)) {
    // L'un a des animaux et l'autre accepte = bien
    points += 6;
  } else {
    // Pas d'animaux de part et d'autre = neutre
    points += 5;
  }
  
  // 🍷🌿 SUBSTANCES (9 points)
  const alcohol1 = user1.alcohol_ok !== false;
  const alcohol2 = user2.alcohol_ok !== false;
  const cannabis1 = user1.cannabis_friendly || false;
  const cannabis2 = user2.cannabis_friendly || false;
  const sober1 = user1.no_substances || false;
  const sober2 = user2.no_substances || false;
  
  if (sober1 && sober2) {
    // Les deux sobres = parfait
    points += 9;
  } else if (sober1 && (cannabis2 || !alcohol2)) {
    // L'un sobre, l'autre pas trop compatible
    points += 3;
  } else if (sober2 && (cannabis1 || !alcohol1)) {
    points += 3;
  } else if (alcohol1 === alcohol2 && cannabis1 === cannabis2) {
    // Mêmes préférences = très bien
    points += 9;
  } else if (alcohol1 === alcohol2 || cannabis1 === cannabis2) {
    // Au moins une préférence en commun = bien
    points += 6;
  } else {
    // Différences = moins compatible
    points += 4;
  }
  
  return Math.min(25, points);
};

/**
 * Calcule la compatibilité religieuse/alimentaire (15 points max)
 */
const calculateReligionCompatibility = (user1, user2) => {
  const religion1 = user1.religious_practice || 'none';
  const religion2 = user2.religious_practice || 'none';
  
  // Même pratique = 15 points
  if (religion1 === religion2) return 15;
  
  // Si l'un est "none" ou "secular", compatible avec presque tout
  if (religion1 === 'none' || religion1 === 'secular' || 
      religion2 === 'none' || religion2 === 'secular') {
    return 12;
  }
  
  // Pratiques alimentaires similaires
  const dietary = ['vegetarian_vegan', 'muslim', 'jewish'];
  if (dietary.includes(religion1) && dietary.includes(religion2)) {
    return 10;
  }
  
  // Spirituel est généralement tolérant
  if (religion1 === 'spiritual' || religion2 === 'spiritual') {
    return 11;
  }
  
  // Autres cas = score neutre
  return 8;
};

/**
 * Calcule la compatibilité du style de vie (10 points max)
 */
const calculateLifestyleCompatibility = (user1, user2) => {
  let points = 0;
  
  // 🧹 PROPRETÉ (4 points)
  const clean1 = user1.cleanliness || 3;
  const clean2 = user2.cleanliness || 3;
  const cleanDiff = Math.abs(clean1 - clean2);
  
  if (cleanDiff === 0) points += 4;
  else if (cleanDiff === 1) points += 3;
  else if (cleanDiff === 2) points += 2;
  else points += 1;
  
  // 🔊 TOLÉRANCE BRUIT (3 points)
  const noise1 = user1.noise_tolerance || 5;
  const noise2 = user2.noise_tolerance || 5;
  const noiseDiff = Math.abs(noise1 - noise2);
  
  if (noiseDiff <= 2) points += 3;
  else if (noiseDiff <= 4) points += 2;
  else points += 1;
  
  // 👥 FRÉQUENCE INVITÉS (3 points)
  const guests1 = user1.guests_frequency || 3;
  const guests2 = user2.guests_frequency || 3;
  const guestsDiff = Math.abs(guests1 - guests2);
  
  if (guestsDiff === 0) points += 3;
  else if (guestsDiff === 1) points += 2;
  else points += 1;
  
  return Math.min(10, points);
};

/**
 * Filtre les utilisateurs par ville et exclut l'utilisateur actuel
 */
export const filterMatches = (currentUser, allUsers) => {
  console.log("🔍 Current user:", currentUser?.name, "city:", currentUser?.city, "user_id:", currentUser?.user_id);
  
  if (!currentUser) {
    console.error("❌ currentUser is undefined!");
    return allUsers;
  }
  
  const filtered = allUsers.filter(user => {
    // Exclure l'utilisateur actuel
    if (user.user_id === currentUser.user_id) {
      console.log("❌ Skipping self:", user.name);
      return false;
    }
//     
//     // Vérifier la ville seulement si elle existe
//     if (currentUser.city && user.city && user.city !== currentUser.city) {
//       console.log("❌ Different city:", user.name, user.city, "vs", currentUser.city);
//       return false;

    // RÈGLE : has_space doit matcher avec !has_space
    // EXCEPTION : deux chercheurs peuvent matcher si open_to_group_search
    if (currentUser.has_space === user.has_space) {
      if (!currentUser.has_space && !user.has_space && currentUser.open_to_group_search && user.open_to_group_search) {
        console.log("✅ Group search match:", user.name, "both seeking together");
      } else {
        console.log("❌ Same space status:", user.name);
        return false;
      }
    }
    // Vérifier la distance si les coordonnées GPS sont disponibles
    if (currentUser.latitude && currentUser.longitude && user.latitude && user.longitude && currentUser.search_radius) {
      const distance = calculateDistance(currentUser.latitude, currentUser.longitude, user.latitude, user.longitude);
      if (distance > currentUser.search_radius) {
        console.log("❌ Too far:", user.name, distance + "km vs max", currentUser.search_radius + "km");
        return false;
      }
    }
    
    console.log("✅ Keeping:", user.name, "city:", user.city);
    return true;
  });
  
  console.log("✅ Filtered result:", filtered.length, "users from", allUsers.length, "total");
  return filtered;
};

/**
 * Récupère les meilleurs matches avec scores de compatibilité calculés
 */
export const getTopMatches = (currentUser, allUsers, limit = 20) => {
  const eligible = filterMatches(currentUser, allUsers);
  
  // Calcule le score de compatibilité pour chaque utilisateur
  const scored = eligible.map(user => ({
    ...user,
    compatibility: calculateCompatibility(currentUser, user)
  }));
  
  // Trie par score décroissant (meilleurs matches en premier)
  const sorted = scored.sort((a, b) => b.compatibility - a.compatibility);
  
  console.log("🎯 Top matches avec scores:", sorted.slice(0, 5).map(u => ({
    name: u.name,
    score: u.compatibility
  })));
  
  return sorted.slice(0, limit);
};

/**
 * Retourne le niveau de compatibilité avec couleur et emoji
 */
export const getCompatibilityLevel = (score) => {
  if (score >= 90) return { levelKey: 'excellentMatch', color: 'text-green-400', emoji: '🔥' };
  if (score >= 80) return { levelKey: 'veryCompatible', color: 'text-cyan-400', emoji: '✨' };
  if (score >= 70) return { levelKey: 'goodMatch', color: 'text-blue-400', emoji: '👍' };
  if (score >= 60) return { levelKey: 'compatible', color: 'text-purple-400', emoji: '🤝' };
  if (score >= 50) return { levelKey: 'compatible', color: 'text-yellow-400', emoji: '😊' };
  return { levelKey: 'lowCompatibility', color: 'text-gray-400', emoji: '🤔' };
};
