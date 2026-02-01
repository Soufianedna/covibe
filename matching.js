/**
 * CoVibe Matching Algorithm
 * Calcule la compatibilité entre deux utilisateurs basé sur lifestyle, créativité, et préférences
 */

export const calculateCompatibility = (user1, user2) => {
  let score = 0;
  const weights = {
    schedule: 25,        // Réduit de 30
    lifestyle: 20,       // Réduit de 25
    living_style: 15,    // Réduit de 20
    values: 12,          // Réduit de 15
    religion: 15,        // NOUVEAU
    substances: 8,       // NOUVEAU
    safe_space: 5,       // NOUVEAU (bonus)
  };

  // 1. SCHEDULE COMPATIBILITY (25%)
  const scheduleScore = calculateScheduleMatch(
    user1.productive_time,
    user2.productive_time
  );
  score += (scheduleScore / 100) * weights.schedule;

  // 2. LIFESTYLE COMPATIBILITY (20%)
  const lifestyleScore = calculateLifestyleMatch(
    user1.weekend_style,
    user2.weekend_style,
    user1.creative_type,
    user2.creative_type
  );
  score += (lifestyleScore / 100) * weights.lifestyle;

  // 3. LIVING STYLE (15%)
  const livingScore = calculateLivingStyleMatch(
    user1.living_space_style,
    user2.living_space_style,
    user1.cleanliness,
    user2.cleanliness
  );
  score += (livingScore / 100) * weights.living_style;

  // 4. VALUES (12%)
  const valuesScore = calculateValuesMatch(
    user1.priority,
    user2.priority
  );
  score += (valuesScore / 100) * weights.values;

  // 5. RELIGION & DIET COMPATIBILITY (15%) - DEAL-BREAKER POTENTIEL
  const religionScore = calculateReligionMatch(
    user1.religious_practice,
    user2.religious_practice,
    user1.seeks_same_religion,
    user2.seeks_same_religion,
    user1.alcohol_ok,
    user2.alcohol_ok
  );
  
  // Si incompatibilité ABSOLUE sur religion stricte, score = 0
  if (religionScore === -1) return 0;
  
  score += (religionScore / 100) * weights.religion;

  // 6. SUBSTANCES COMPATIBILITY (8%) - DEAL-BREAKER POTENTIEL
  const substancesScore = calculateSubstancesMatch(
    user1.alcohol_ok,
    user2.alcohol_ok,
    user1.cannabis_friendly,
    user2.cannabis_friendly,
    user1.no_substances,
    user2.no_substances
  );
  
  // Si incompatibilité forte, pénalité
  if (substancesScore === -1) score -= 20; // Grosse pénalité mais pas 0
  else score += (substancesScore / 100) * weights.substances;

  // 7. SAFE SPACE BONUS (5%)
  const safeSpaceScore = calculateSafeSpaceMatch(
    user1.safe_space_preferences,
    user2.safe_space_preferences,
    user1.gender,
    user2.gender
  );
  score += (safeSpaceScore / 100) * weights.safe_space;

  // 8. DEAL-BREAKERS TRADITIONNELS (10% restant)
  const dealbreakersScore = calculateDealbreakers(user1, user2);
  score += dealbreakersScore * 0.10;

  return Math.max(0, Math.min(100, Math.round(score)));
};

// Schedule matching (même horaire = meilleur match)
const calculateScheduleMatch = (time1, time2) => {
  const scheduleTypes = {
    'early': ['early', 'day'],
    'day': ['day', 'early', 'late'],
    'late': ['late', 'day', 'night'],
    'night': ['night', 'late']
  };

  const compatible = scheduleTypes[time1] || [];
  
  if (time1 === time2) return 100;
  if (compatible.includes(time2)) return 70;
  return 30;
};

// Lifestyle matching (créatifs ensemble, sociaux ensemble, etc.)
const calculateLifestyleMatch = (weekend1, weekend2, creative1, creative2) => {
  let score = 0;

  // Weekend style match
  if (weekend1 === weekend2) {
    score += 50;
  } else {
    const complementary = {
      'creative': ['creative', 'chill'],
      'social': ['social', 'active'],
      'chill': ['chill', 'creative'],
      'active': ['active', 'social']
    };
    if (complementary[weekend1]?.includes(weekend2)) {
      score += 35;
    } else {
      score += 15;
    }
  }

  // Creative type bonus
  if (creative1 && creative2) {
    const creativeTypes = {
      'musician': ['musician', 'artist', 'content_creator'],
      'artist': ['artist', 'musician', 'photographer'],
      'content_creator': ['content_creator', 'photographer', 'musician'],
      'photographer': ['photographer', 'artist', 'content_creator'],
      'developer': ['developer', 'entrepreneur'],
      'entrepreneur': ['entrepreneur', 'developer'],
      'writer': ['writer', 'artist', 'content_creator']
    };

    if (creative1 === creative2) {
      score += 50;
    } else if (creativeTypes[creative1]?.includes(creative2)) {
      score += 35;
    } else {
      score += 20;
    }
  }

  return Math.min(score, 100);
};

// Living style (propre vs décontracté)
const calculateLivingStyleMatch = (style1, style2, clean1, clean2) => {
  let score = 0;

  // Living space style
  if (style1 === style2) {
    score += 50;
  } else {
    const compatible = {
      'creative': ['creative', 'cozy'],
      'organized': ['organized', 'social'],
      'cozy': ['cozy', 'creative'],
      'social': ['social', 'organized', 'cozy']
    };
    if (compatible[style1]?.includes(style2)) {
      score += 30;
    } else {
      score += 10;
    }
  }

  // Cleanliness match (important!)
  const cleanDiff = Math.abs(clean1 - clean2);
  if (cleanDiff === 0) score += 50;
  else if (cleanDiff === 1) score += 35;
  else if (cleanDiff === 2) score += 20;
  else score += 5;

  return Math.min(score, 100);
};

// Values matching
const calculateValuesMatch = (priority1, priority2) => {
  if (priority1 === priority2) return 100;
  
  const compatible = {
    'private': ['private', 'budget'],
    'social': ['social', 'values'],
    'budget': ['budget', 'private'],
    'values': ['values', 'social']
  };

  if (compatible[priority1]?.includes(priority2)) return 70;
  return 40;
};

// NOUVEAU: Religion & Diet compatibility
const calculateReligionMatch = (religion1, religion2, seeks1, seeks2, alcohol1, alcohol2) => {
  // Si aucun des deux n'a de préférence religieuse
  if (religion1 === 'none' && religion2 === 'none') return 100;

  // Vérification ABSOLUE: musulman strict + alcool
  if ((religion1 === 'muslim' && seeks1 && alcohol2 === true) ||
      (religion2 === 'muslim' && seeks2 && alcohol1 === true)) {
    return -1; // DEAL-BREAKER ABSOLU
  }

  // Vérification ABSOLUE: végan/végétarien strict cherchant compatible
  if ((religion1 === 'vegetarian_vegan' && seeks1 && religion2 !== 'vegetarian_vegan') ||
      (religion2 === 'vegetarian_vegan' && seeks2 && religion1 !== 'vegetarian_vegan')) {
    return 30; // Fort mismatch mais pas absolu
  }

  // Même pratique religieuse = excellent
  if (religion1 === religion2) return 100;

  // Une personne cherche quelqu'un de sa religion, l'autre non
  if (seeks1 && religion1 !== religion2) return 20;
  if (seeks2 && religion1 !== religion2) return 20;

  // Pratiques différentes mais pas de préférence stricte
  if (religion1 !== 'none' && religion2 !== 'none' && religion1 !== religion2) return 60;

  // Une personne a des pratiques, l'autre non
  return 80;
};

// NOUVEAU: Substances compatibility
const calculateSubstancesMatch = (alcohol1, alcohol2, cannabis1, cannabis2, sober1, sober2) => {
  let score = 100;

  // DEAL-BREAKER: quelqu'un sobre vs quelqu'un qui consomme régulièrement
  if (sober1 && (alcohol2 || cannabis2)) return -1;
  if (sober2 && (alcohol1 || cannabis1)) return -1;

  // Les deux sobres = parfait
  if (sober1 && sober2) return 100;

  // Alcool mismatch
  if (alcohol1 && !alcohol2) score -= 20;
  if (!alcohol1 && alcohol2) score -= 20;

  // Cannabis mismatch (moins critique que alcool)
  if (cannabis1 && !cannabis2) score -= 15;
  if (!cannabis1 && cannabis2) score -= 15;

  // Bonus si alignement parfait
  if (alcohol1 === alcohol2 && cannabis1 === cannabis2) score = 100;

  return Math.max(0, score);
};

// NOUVEAU: Safe Space bonus
const calculateSafeSpaceMatch = (prefs1 = [], prefs2 = [], gender1, gender2) => {
  if (!prefs1.length && !prefs2.length) return 50; // Neutre

  // Comptage des préférences communes
  const common = prefs1.filter(p => prefs2.includes(p));
  const baseScore = Math.min((common.length / Math.max(prefs1.length, prefs2.length)) * 100, 100);

  // Vérifications spéciales
  // Women-only space
  if (prefs1.includes('women_only') && gender2 !== 'woman') return 0;
  if (prefs2.includes('women_only') && gender1 !== 'woman') return 0;

  // Men-only space
  if (prefs1.includes('men_only') && gender2 !== 'man') return 0;
  if (prefs2.includes('men_only') && gender1 !== 'man') return 0;

  // Bonus pour LGBTQ+ friendly des deux côtés
  if (prefs1.includes('lgbtq_friendly') && prefs2.includes('lgbtq_friendly')) {
    return 100;
  }

  return baseScore;
};

// Deal-breakers (fumeur, animaux, bruit, etc.)
const calculateDealbreakers = (user1, user2) => {
  let score = 100;

  // Smoking
  if (user1.smoking !== user2.smoking) score -= 30;

  // Pets
  if (user1.pets && !user2.pets_ok) score -= 25;
  if (user2.pets && !user1.pets_ok) score -= 25;

  // Noise tolerance
  const noiseDiff = Math.abs((user1.noise_tolerance || 5) - (user2.noise_tolerance || 5));
  score -= noiseDiff * 5;

  // Guests frequency
  const guestsDiff = Math.abs((user1.guests_frequency || 3) - (user2.guests_frequency || 3));
  score -= guestsDiff * 5;

  return Math.max(score, 0);
};

// Filtrer les matches par ville et âge
export const filterMatches = (currentUser, allUsers) => {
  return allUsers.filter(user => {
    // Pas de self-match
    if (user.id === currentUser.id) return false;

    // Même ville
    if (user.city !== currentUser.city) return false;

    // Women-only / Men-only spaces
    if (currentUser.safe_space_preferences?.includes('women_only') && user.gender !== 'woman') return false;
    if (currentUser.safe_space_preferences?.includes('men_only') && user.gender !== 'man') return false;
    if (user.safe_space_preferences?.includes('women_only') && currentUser.gender !== 'woman') return false;
    if (user.safe_space_preferences?.includes('men_only') && currentUser.gender !== 'man') return false;

    return true;
  });
};

// Obtenir les top matches
export const getTopMatches = (currentUser, allUsers, limit = 20) => {
  const eligible = filterMatches(currentUser, allUsers);
  
  const scored = eligible.map(user => ({
    ...user,
    compatibility: calculateCompatibility(currentUser, user)
  }));

  // Trier par score décroissant
  scored.sort((a, b) => b.compatibility - a.compatibility);

  // Retourner seulement ceux avec 60%+ de compatibilité
  return scored.filter(user => user.compatibility >= 60).slice(0, limit);
};

// Helper pour interpréter le score
export const getCompatibilityLevel = (score) => {
  if (score >= 90) return { level: 'Excellent', color: 'text-green-400', emoji: '🔥' };
  if (score >= 80) return { level: 'Très Bon', color: 'text-cyan-400', emoji: '✨' };
  if (score >= 70) return { level: 'Bon', color: 'text-blue-400', emoji: '👍' };
  if (score >= 60) return { level: 'Compatible', color: 'text-purple-400', emoji: '🤝' };
  return { level: 'Faible', color: 'text-gray-400', emoji: '🤔' };
};
