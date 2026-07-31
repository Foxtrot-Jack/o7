// Conflict Zones — faction warfare combat sites in inhabited systems

function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) | 0;
  return () => { s = (s * 1103515245 + 12345) | 0; return ((s >>> 16) & 0x7fff) / 0x7fff; };
}

export const CZ_TYPES = [
  { id: 'low', label: 'Low Intensity', threatLevel: 1, bondMult: 1.0, desc: 'Skirmishes between minor factions' },
  { id: 'medium', label: 'Medium Intensity', threatLevel: 2, bondMult: 1.5, desc: 'Active combat operations' },
  { id: 'high', label: 'High Intensity', threatLevel: 3, bondMult: 2.5, desc: 'Full-scale fleet engagement' },
];

const FACTION_POOL = ['Pilots Federation', 'Federation Navy', 'Imperial Guard', 'Alliance Defence', 'Independent Coalition', 'Local Militia'];

export function generateConflictZones(systemSeed, systemData) {
  if (!systemData) return [];
  const population = systemData.population || 0;
  if (population < 10000) return [];

  const rng = seededRandom(systemSeed + ':cz');
  const numZones = Math.floor(rng() * 4);
  const zones = [];
  const factions = [...FACTION_POOL];
  if (systemData.faction && !factions.includes(systemData.faction)) factions.push(systemData.faction);

  for (let i = 0; i < numZones; i++) {
    const type = CZ_TYPES[Math.floor(rng() * CZ_TYPES.length)];
    const fa = factions[Math.floor(rng() * factions.length)];
  let fb = factions[Math.floor(rng() * factions.length)];
  while (fb === fa) fb = factions[Math.floor(rng() * factions.length)];
    zones.push({
      id: `cz_${systemSeed}_${i}`,
      type,
      factionA: fa,
      factionB: fb,
      influenceA: 50,
      influenceB: 50,
      enemiesRemaining: 3 + Math.floor(rng() * 6),
      threatLevel: type.threatLevel,
    });
  }
  return zones;
}

export function calculateCombatBonds(threatLevel) {
  return Math.round(5000 * threatLevel * (0.8 + Math.random() * 0.4));
}