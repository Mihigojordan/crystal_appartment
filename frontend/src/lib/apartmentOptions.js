export const AMENITY_OPTIONS = [
  ['📶', 'WiFi'], ['❄️', 'Air Conditioning'], ['🅿️', 'Parking'], ['🏊', 'Pool'],
  ['🏋️', 'Gym'], ['🧺', 'Laundry'], ['🛡️', '24/7 Security'], ['🍳', 'Kitchen'],
  ['🌇', 'Balcony'], ['🐾', 'Pet Friendly'], ['🔥', 'Heating'], ['📺', 'Cable TV'],
];

export const HIGHLIGHT_OPTIONS = [
  ['🏫', 'Near Schools'], ['🏥', 'Hospital Nearby'], ['🚇', 'Public Transit'],
  ['🛍️', 'Shopping Mall'], ['🍽️', 'Restaurants'], ['🌳', 'Park Nearby'],
  ['🏦', 'Bank / ATM'], ['🚓', 'Safe Neighborhood'],
];

export const UTILITY_OPTIONS = [
  ['💧', 'Water'], ['⚡', 'Electricity'], ['🔥', 'Gas'], ['🌐', 'Internet'], ['🗑️', 'Trash'],
];

export function iconFor(options, name) {
  return options.find(([, label]) => label === name)?.[0] ?? null;
}
