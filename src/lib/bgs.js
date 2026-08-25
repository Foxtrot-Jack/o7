// Background Simulation (BGS) — dynamic faction influence and system states

function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) | 0;
  return () => { s = (s * 1103515245 + 12345) | 0; return ((s >>> 16) & 0x7fff) / 0x7fff; };
}

export const FACTION_STATES = [
  { id: 'boom', label: 'Boom', color: 'text-green-500', desc: 'Economic growth — better trade prices' },
  { id: 'bust', label: 'Bust', color: 'text-red-500', desc: 'Economic decline — poor prices' },
  { id: 'war', label: 'War', color: 'text-orange-500', desc: 'Active conflict — conflict zones present' },
  { id: 'civilwar', label: 'Civil War', color: 'text-red-700', desc: 'Internal conflict — disrupted services' },
  { id: 'expansion', label: 'Expansion', color: 'text-cyan-500', desc: 'Faction expanding influence' },
  { id: 'retreat', label: 'Retreat', color: 'text-yellow-500', desc: 'Faction losing territory' },
  { id: 'none', label: 'Stable', color: 'text-orange-400', desc: 'No special activity' },
];

const FACTION_NAMES = ['Republic', 'Dynasty', 'Coalition', 'Local Independents', 'Pirate Syndicate', 'Merchant Guild', 'Frontier Coalition'];

export function generateFactionStates(systemSeed, systemData) {
  const rng = seededRandom(systemSeed + ':bgs');
  const mainFaction = systemData?.faction || 'Independent Coalition';
  const numFactions = 2 + Math.floor(rng() * 3);
  const factions = [];

  factions.push({ name: mainFaction, influence: 30 + Math.floor(rng() * 20), state: 'none' });

  const usedNames = new Set();
  for (let i = 0; i < numFactions - 1; i++) {
    let name;
    do { name = FACTION_NAMES[Math.floor(rng() * FACTION_NAMES.length)]; } while (usedNames.has(name));
    usedNames.add(name);
    factions.push({ name, influence: 10 + Math.floor(rng() * 25), state: 'none' });
  }

  const total = factions.reduce((s, f) => s + f.influence, 0);
  for (const f of factions) f.influence = Math.round((f.influence / total) * 100);

  for (const f of factions) {
    if (f.influence > 40) f.state = 'boom';
    else if (f.influence < 10) f.state = 'bust';
  }
  const sorted = [...factions].sort((a, b) => b.influence - a.influence);
  if (sorted.length >= 2 && Math.abs(sorted[0].influence - sorted[1].influence) < 5 && sorted[0].influence > 20) {
    sorted[0].state = 'war';
    sorted[1].state = 'war';
  }
  return factions;
}

export function getFactionStateInfo(stateId) {
  return FACTION_STATES.find(s => s.id === stateId) || FACTION_STATES.find(s => s.id === 'none');
}

export function applyInfluenceChange(factions, factionName, amount) {
  const faction = factions.find(f => f.name === factionName);
  if (!faction) return factions;
  const newInfluence = Math.max(1, Math.min(80, faction.influence + amount));
  const delta = newInfluence - faction.influence;
  // Redistribute from other factions
  const others = factions.filter(f => f !== faction);
  const totalOther = others.reduce((s, f) => s + f.influence, 0);
  if (totalOther > 0) {
    for (const f of others) {
      f.influence = Math.max(1, f.influence - Math.round(delta * (f.influence / totalOther)));
    }
  }
  faction.influence = newInfluence;
  // Update states
  for (const f of factions) {
    if (f.influence > 40) f.state = 'boom';
    else if (f.influence < 10) f.state = 'bust';
    else if (f.state === 'boom' || f.state === 'bust') f.state = 'none';
  }
  return [...factions];
}

// Income multiplier for carrier economy based on the controlling faction's state.
// Boom boosts trade traffic; war/civilwar disrupt services; bust depresses income.
export function getFactionStateMultiplier(stateId) {
  switch (stateId) {
    case 'boom': return 1.4;
    case 'expansion': return 1.15;
    case 'war': return 0.6;
    case 'civilwar': return 0.5;
    case 'bust': return 0.7;
    case 'retreat': return 0.85;
    default: return 1.0; // stable / none
  }
}

// Resolve the controlling faction's state for a carrier's parked system.
// Returns the state id string (e.g. 'boom', 'war', 'none').
export function getCarrierSystemFactionState(carrier, systemData) {
  if (!carrier?.systemSeed) return 'none';
  const factions = generateFactionStates(carrier.systemSeed, systemData || {});
  if (!factions.length) return 'none';
  const controlling = [...factions].sort((a, b) => b.influence - a.influence)[0];
  return controlling?.state || 'none';
}