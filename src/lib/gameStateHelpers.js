// Extracted from gameState.jsx — standalone helper functions
import { SHIP_TYPES } from './shipRoster';

export function updateRank(currentRank, points) {
  const RANKS = [
    { name: 'Aimless', threshold: 0 },
    { name: 'Mostly Aimless', threshold: 1000 },
    { name: 'Scout', threshold: 5000 },
    { name: 'Surveyor', threshold: 15000 },
    { name: 'Trailblazer', threshold: 50000 },
    { name: 'Pathfinder', threshold: 150000 },
    { name: 'Ranger', threshold: 400000 },
    { name: 'Pioneer', threshold: 900000 },
    { name: 'Elite', threshold: 2000000 },
    { name: 'Elite I', threshold: 5000000 },
    { name: 'Elite II', threshold: 10000000 },
    { name: 'Elite III', threshold: 25000000 },
    { name: 'Elite IV', threshold: 50000000 },
    { name: 'Elite V', threshold: 100000000 },
  ];

  const newPoints = currentRank.points + points;
  let newRankIdx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (newPoints >= RANKS[i].threshold) newRankIdx = i;
  }
  return { rank: newRankIdx, name: RANKS[newRankIdx].name, points: newPoints };
}

export function getProbesRequired(body) {
  if (!body || body.type === 'star' || body.type === 'belt' || body.type === 'asteroid' || body.type === 'ring') return 0;
  const r = body.radius || 1;
  if (body.planetType && (body.planetType.startsWith('gas_giant') || body.planetType.startsWith('helium'))) {
    return Math.max(3, Math.min(8, Math.ceil(r / 3)));
  }
  return Math.max(1, Math.min(5, Math.ceil(r * 1.5)));
}

export function hasCarrierVendor(system) {
  return system && (system.population || 0) > 1000000000;
}

export function getAvailableShipsAtStation(system, isSandbox = false) {
  if (isSandbox) return new Set(SHIP_TYPES.map(s => s.id));
  const pop = system?.population || 0;
  const maxCost = pop > 1e10 ? 1e12 : pop > 1e9 ? 3e8 : pop > 1e8 ? 8e7 : pop > 1e7 ? 2.5e7 : pop > 1e6 ? 5e6 : pop > 1e5 ? 1e6 : 1e5;
  return new Set(SHIP_TYPES.filter(s => s.cost <= maxCost).map(s => s.id));
}

export function getOutfittingLevel(system, systemData, isSandbox = false) {
  if (isSandbox) return 5;
  const pop = system?.population || 0;
  const economy = (systemData?.economy?.name || '').toLowerCase();
  let level = 1;
  if (pop > 100000) level = 2;
  if (pop > 1000000) level = 3;
  if (pop > 100000000) level = 4;
  if (pop > 1000000000) level = 5;
  if (economy.includes('high tech') || economy.includes('tech') || economy.includes('industrial')) level = Math.min(5, level + 1);
  return level;
}

export const OUTFITTING_LEVELS = [
  { name: 'Basic', desc: 'Core modules only. No engineering.' },
  { name: 'Standard', desc: 'Common modules. Basic engineering.' },
  { name: 'Advanced', desc: 'Improved modules. Standard engineering.' },
  { name: 'Premium', desc: 'High-grade modules. Advanced engineering.' },
  { name: 'Elite', desc: 'Full stock. Experimental engineering.' },
];