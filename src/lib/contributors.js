// Contributors — the people who helped build o7.
//
// EXPAND THIS LIST OVER TIME. Each entry's alias appears as a background NPC
// in-game (flying ships, encountered during travel) so players can "meet the
// founders."
//
// ENTRY FORMAT:
//   { alias, firstName, lastName, role }
//
// The credit line reads: "<alias> played by <firstName> <lastName>"
// The alias is the in-game NPC name players encounter during the
// "Founder Sighting" random encounter.

export const CONTRIBUTORS = [
  // Add contributors below. Example:
  // { alias: 'Deciat', firstName: 'Jordan', lastName: 'Reeves', role: 'Lead Developer' },
];

export function getCreditLine(c) {
  return `${c.alias} played by ${c.firstName} ${c.lastName}`;
}

export function getContributorCount() {
  return CONTRIBUTORS.length;
}

// Returns a random founder alias for NPC naming, or null if the list is empty.
export function getRandomFounderName() {
  if (CONTRIBUTORS.length === 0) return null;
  return CONTRIBUTORS[Math.floor(Math.random() * CONTRIBUTORS.length)].alias;
}

// Check if a name belongs to a founder (for special NPC handling).
const FOUNDER_ALIASES = new Set(CONTRIBUTORS.map(c => c.alias));
export function isFounderName(name) {
  return FOUNDER_ALIASES.has(name);
}