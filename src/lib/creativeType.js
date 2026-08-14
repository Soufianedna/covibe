// Types créatifs dont le libellé français varie selon le genre. Les autres
// valeurs (other, language_exchange) sont déjà invariables et utilisent
// directement la clé de base.
const GENDERED_CREATIVE_TYPES = {
  musician: { man: 'musicianMale', woman: 'musicianFemale' },
  artist: { man: 'artistMale', woman: 'artistFemale' },
  content_creator: { man: 'contentCreatorMale', woman: 'contentCreatorFemale' },
  photographer: { man: 'photographerMale', woman: 'photographerFemale' },
  developer: { man: 'developerMale', woman: 'developerFemale' },
  writer: { man: 'writerMale', woman: 'writerFemale' },
  entrepreneur: { man: 'entrepreneurMale', woman: 'entrepreneurFemale' },
};

// Retourne la clé i18n à utiliser pour afficher un type créatif, accordée au
// genre du profil (man/woman). Pour tout le reste (non_binary,
// prefer_not_to_say, genre absent, ou type sans variante) on retombe sur la
// clé de base, déjà en forme inclusive.
export function getCreativeTypeKey(creativeType, gender) {
  const variants = GENDERED_CREATIVE_TYPES[creativeType];
  if (variants && (gender === 'man' || gender === 'woman')) {
    return variants[gender];
  }
  return creativeType;
}
