// Player Reputation — per-faction standing tracked independently

export const FACTIONS = [
  { id: 'federation', name: 'Federation', color: '#4488cc', desc: 'Democratic federal government. Strong military and trade.' },
  { id: 'empire', name: 'Empire', color: '#aa44aa', desc: 'Imperial aristocracy. Prestige and patronage.' },
  { id: 'alliance', name: 'Alliance', color: '#44aa44', desc: 'Loose coalition of independent systems.' },
  { id: 'independent', name: 'Independent', color: '#ffaa44', desc: 'Free traders and frontier settlers.' },
  { id: 'pirate', name: 'Pirate Syndicates', color: '#cc4444', desc: 'Criminal networks. Black market connections.' },
];

export const REP_LEVELS = [
  { min: -100, max: -50, label: 'Hostile', color: 'text-red-700', desc: 'Will attack on sight. Docking refused.' },
  { min: -50, max: -20, label: 'Unfriendly', color: 'text-red-500', desc: 'Services restricted. Missions limited.' },
  { min: -20, max: 10, label: 'Neutral', color: 'text-orange-400', desc: 'Standard access. No bonuses or penalties.' },
  { min: 10, max: 40, label: 'Friendly', color: 'text-yellow-500', desc: 'Better mission tiers. Small discounts.' },
  { min: 40, max: 75, label: 'Allied', color: 'text-green-500', desc: 'Full access. Exclusive missions and perks.' },
  { min: 75, max: 101, label: 'Allied ★', color: 'text-green-400', desc: 'Maximum reputation. Best rewards available.' },
];

export function getRepLevel(rep) {
  return REP_LEVELS.find(l => rep >= l.min && rep < l.max) || REP_LEVELS[2];
}

export function getFaction(factionId) {
  return FACTIONS.find(f => f.id === factionId);
}

export function adjustRep(factionRep, factionId, amount) {
  const current = factionRep?.[factionId] || 0;
  return Math.max(-100, Math.min(100, current + amount));
}

// Deterministic superpower allegiance for a generated system, derived from its
// seed (and security for anarchy → pirate weighting). This is what mission,
// bounty, and crime reputation gains are credited against when a mission does
// not name a specific faction.
function hashSeed(seed) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

export function getSystemAllegiance(star) {
  if (!star || star.seed == null) return 'independent';
  const r = hashSeed(star.seed);
  if (star.security === 'anarchy' && r < 0.25) return 'pirate';
  if (r < 0.30) return 'federation';
  if (r < 0.55) return 'empire';
  if (r < 0.75) return 'alliance';
  return 'independent';
}

export function getAllegianceName(factionId) {
  return getFaction(factionId)?.name || 'Independent';
}