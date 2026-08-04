// Contributors / Founders — the people who built o7.
//
// Each entry's alias appears as an ACTIVE background pilot (a "founder") in the
// Background Simulation. Founders explore and claim systems (First Discovered
// by <alias>), and shift faction influence over time — giving "first discovered"
// real meaning. Aliases use the "CMDR " pilot-NPC prefix.
//
// ENTRY FORMAT:
//   { alias, firstName, lastName, role, persistent }
//   role: 'explorer' | 'trader' | 'miner' | 'combat'
//   persistent: true for real-human founders (always present)
//
// Credit line reads: "<alias> played by <firstName> <lastName>"

export const CONTRIBUTORS = [
  // The first true persistent founder — a real player.
  { alias: 'CMDR Foxtrot_Jack', firstName: 'Jack', lastName: 'Kelvin', role: 'explorer', persistent: true },
  // Starter roster — fictional founder NPCs so the simulation is live from day one.
  { alias: 'CMDR Voss', firstName: 'Vera', lastName: 'Voss', role: 'trader', persistent: false },
  { alias: 'CMDR Kane', firstName: 'Dex', lastName: 'Kane', role: 'combat', persistent: false },
  { alias: 'CMDR Lyra', firstName: 'Lyra', lastName: 'Reyes', role: 'explorer', persistent: false },
  { alias: 'CMDR Orin', firstName: 'Orin', lastName: 'Drake', role: 'miner', persistent: false },
  { alias: 'CMDR Sable', firstName: 'Sable', lastName: 'Cross', role: 'trader', persistent: false },
  { alias: 'CMDR Rook', firstName: 'Rook', lastName: 'Sinclair', role: 'combat', persistent: false },
];

export const FOUNDER_ROLES = {
  explorer: { id: 'explorer', label: 'Explorer', desc: 'Charts and claims new systems.' },
  trader: { id: 'trader', label: 'Trader', desc: 'Runs cargo, boosts faction economies.' },
  miner: { id: 'miner', label: 'Miner', desc: 'Works resource belts, fuels industry.' },
  combat: { id: 'combat', label: 'Combat Pilot', desc: 'Patrols conflict, shifts faction balance.' },
};

export function getCreditLine(c) {
  return `${c.alias} played by ${c.firstName} ${c.lastName}`;
}

export function getContributorCount() {
  return CONTRIBUTORS.length;
}

// Founder pilots used by the BGS simulation.
export function getFounderPilots() {
  return CONTRIBUTORS.map(c => ({ alias: c.alias, role: c.role, persistent: !!c.persistent }));
}

const normAlias = (a) => (a || '').replace(/^CMDR\s+/i, '').trim();

export function isFounderAlias(alias) {
  if (!alias) return false;
  const n = normAlias(alias);
  return CONTRIBUTORS.some(c => normAlias(c.alias) === n);
}

export function findFounderByAlias(alias) {
  if (!alias) return null;
  const n = normAlias(alias);
  return CONTRIBUTORS.find(c => normAlias(c.alias) === n) || null;
}

// Returns a random founder alias for NPC naming, or null if the list is empty.
export function getRandomFounderName() {
  if (CONTRIBUTORS.length === 0) return null;
  return CONTRIBUTORS[Math.floor(Math.random() * CONTRIBUTORS.length)].alias;
}

// Returns a random founder alias NOT already on screen (exclude = Set of aliases),
// or null when every founder is already present — used by the dock camera so a
// founder never appears twice at once.
export function getRandomFounderNameExcluding(exclude = new Set()) {
  const avail = CONTRIBUTORS.filter(c => !exclude.has(c.alias));
  if (avail.length === 0) return null;
  return avail[Math.floor(Math.random() * avail.length)].alias;
}

// Check if a name belongs to a founder (for special NPC handling).
const FOUNDER_ALIASES = new Set(CONTRIBUTORS.map(c => c.alias));
export function isFounderName(name) {
  if (!name) return false;
  return FOUNDER_ALIASES.has(name) || isFounderAlias(name);
}