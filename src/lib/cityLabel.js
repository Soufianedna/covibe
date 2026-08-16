const CITY_LABELS = {
  vancouver: 'Vancouver',
  montreal: 'Montréal',
  toronto: 'Toronto',
};

export function getCityLabel(city) {
  return CITY_LABELS[city] || city;
}
