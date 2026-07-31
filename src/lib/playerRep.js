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