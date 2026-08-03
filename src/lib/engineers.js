// Resident engineers — modeled on Elite Dangerous's engineer NPCs, using our lore.
// An engineer is present only at stations whose tech level supports engineering
// (Standard or better), and only some of those host a named engineer.
import { getOutfittingLevel } from './gameStateHelpers';
import { makeRng, pick } from './prng';

const ENGINEER_FIRSTS = ['Elara', 'Doran', 'Kestrel', 'Vance', 'Mira', 'Tomas', 'Reno', 'Yara', 'Cassius', 'Iolo', 'Sigrun', 'Pavel', 'Niamh', 'Dario', 'Hela', 'Oksa', 'Bram'];
const ENGINEER_TITLES = ['the Machinist', 'the Fabricator', 'the Tuner', 'the Artificer', 'the Drive-Smith', 'the Shieldwright', 'the Weaponwright', 'the Core-Setter', 'the Sparkwright'];

export function getStationEngineer(system, systemData, isSandbox = false) {
  const level = getOutfittingLevel(system, systemData, isSandbox);
  // Engineering needs at least Standard tech (level 2+).
  if (level < 2) return null;

  const economy = (systemData?.economy?.name || '').toLowerCase();
  const guaranteed = economy.includes('high tech') || economy.includes('tech') || economy.includes('industrial');
  const seed = `${system?.seed || 'sys'}:${systemData?.stations?.[0]?.id || 'stn'}`;
  const rng = makeRng(seed + ':engineer');
  // High-tech / industrial stations always host an engineer; others only sometimes.
  if (!guaranteed && rng() > 0.5) return null;

  return { name: `${pick(rng, ENGINEER_FIRSTS)} ${pick(rng, ENGINEER_TITLES)}`, maxGrade: level };
}