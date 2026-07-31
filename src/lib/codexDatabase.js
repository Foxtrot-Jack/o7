// Codex Discovery Database — track all discovered stellar/planetary/biological phenomena

export const STAR_CLASSES = [
  { id: 'O', name: 'O-Class Star (Blue Giant)', color: '#9bb0ff' },
  { id: 'B', name: 'B-Class Star (Blue-White)', color: '#aabfff' },
  { id: 'A', name: 'A-Class Star (White)', color: '#cad7ff' },
  { id: 'F', name: 'F-Class Star (Yellow-White)', color: '#f8f7ff' },
  { id: 'G', name: 'G-Class Star (Yellow)', color: '#fff4ea' },
  { id: 'K', name: 'K-Class Star (Orange)', color: '#ffd2a1' },
  { id: 'M', name: 'M-Class Star (Red Dwarf)', color: '#ffcc6f' },
  { id: 'NS', name: 'Neutron Star', color: '#ddddff' },
  { id: 'BH', name: 'Black Hole', color: '#333333' },
  { id: 'TTS', name: 'T Tauri Star', color: '#ffaa66' },
  { id: 'W', name: 'Wolf-Rayet Star', color: '#aaccff' },
  { id: 'WD', name: 'White Dwarf', color: '#ffffff' },
];

export const PLANET_TYPES = [
  { id: 'rocky', name: 'Rocky Body' },
  { id: 'icy', name: 'Icy Body' },
  { id: 'gas_giant', name: 'Gas Giant' },
  { id: 'earthlike', name: 'Earth-Like World' },
  { id: 'ammonia', name: 'Ammonia World' },
  { id: 'water_world', name: 'Water World' },
  { id: 'terraformed', name: 'Terraformed Body' },
  { id: 'high_metal', name: 'High Metal Content World' },
  { id: 'metal_rich', name: 'Metal-Rich Body' },
];

export const SPECIAL_DISCOVERIES = [
  { id: 'earth_like', name: 'Earth-Like World (First)', check: (ach) => ach?.firstDiscoveries?.earth_like },
  { id: 'ammonia_world', name: 'Ammonia World (First)', check: (ach) => ach?.firstDiscoveries?.ammonia_world },
  { id: 'water_world', name: 'Water World (First)', check: (ach) => ach?.firstDiscoveries?.water_world },
  { id: 'neutron_star', name: 'Neutron Star (First)', check: (ach) => ach?.firstDiscoveries?.neutron_star },
  { id: 'black_hole', name: 'Black Hole (First)', check: (ach) => ach?.firstDiscoveries?.black_hole },
  { id: 'habitable_world', name: 'Habitable World (First)', check: (ach) => ach?.firstDiscoveries?.habitable_world },
  { id: 'terraformed_world', name: 'Terraformed World (First)', check: (ach) => ach?.firstDiscoveries?.terraformed_world },
];

export function getDiscoveredStars(achievements) {
  const fd = achievements?.firstDiscoveries || {};
  return STAR_CLASSES.filter(s => fd[`star_${s.id}`]);
}

export function getDiscoveredPlanets(achievements) {
  const fd = achievements?.firstDiscoveries || {};
  return PLANET_TYPES.filter(p => fd[`planet_${p.id}`]);
}

export function getSpecialDiscoveries(achievements) {
  return SPECIAL_DISCOVERIES.filter(s => s.check(achievements));
}

export function getDiscoveryStats(achievements, exobiologyCodex) {
  const starsFound = getDiscoveredStars(achievements).length;
  const planetsFound = getDiscoveredPlanets(achievements).length;
  const specialFound = getSpecialDiscoveries(achievements).length;
  const speciesFound = Object.keys(exobiologyCodex || {}).length;
  return {
    stars: { found: starsFound, total: STAR_CLASSES.length },
    planets: { found: planetsFound, total: PLANET_TYPES.length },
    special: { found: specialFound, total: SPECIAL_DISCOVERIES.length },
    species: { found: speciesFound, total: 6 },
    bodiesScanned: achievements?.totalBodiesScanned || 0,
    systemsScanned: achievements?.systemsScanned || 0,
  };
}