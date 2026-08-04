// Deep-space salvageable wreckage system — random discoveries tied to
// exploration progression. Drops unique components (distinct from regular
// materials). Discoveries are more frequent and more valuable the further
// a commander has explored.

export const COMPONENT_RARITIES = ['common', 'uncommon', 'rare', 'exotic', 'legendary'];

export const UNIQUE_COMPONENTS = [
  // Common
  { id: 'scrap_alloy', name: 'Salvage Alloy', rarity: 'common', value: 2000, desc: 'Twisted hull plating recovered from a derelict. Refineries pay a modest sum.' },
  { id: 'damaged_circuit', name: 'Damaged Circuit Board', rarity: 'common', value: 3500, desc: 'A charred control board. Some intact logic chips remain.' },
  { id: 'degraded_power_cell', name: 'Degraded Power Cell', rarity: 'common', value: 5000, desc: 'A spent power cell holding a residual charge.' },
  // Uncommon
  { id: 'black_box_recorder', name: 'Black Box Recorder', rarity: 'uncommon', value: 12000, desc: 'A flight recorder. Its data is worth a bounty to the right buyer.' },
  { id: 'intact_fsd_fragment', name: 'Intact FSD Fragment', rarity: 'uncommon', value: 18000, desc: 'A functional fragment of a frame shift drive — rare and reusable.' },
  { id: 'military_alloy_plating', name: 'Military Alloy Plating', rarity: 'uncommon', value: 22000, desc: 'Reinforced plating from a decommissioned naval vessel.' },
  // Rare
  { id: 'prototype_shield_matrix', name: 'Prototype Shield Matrix', rarity: 'rare', value: 65000, desc: 'An experimental shield generator of unknown origin.' },
  { id: 'encrypted_data_core', name: 'Encrypted Data Core', rarity: 'rare', value: 80000, desc: 'A sealed data core. Decryption keys long lost — buyers pay for the mystery.' },
  { id: 'guardian_circuit_matrix', name: 'Guardian Circuit Matrix', rarity: 'rare', value: 110000, desc: 'A lattice of ancient Guardian circuitry, still faintly humming.' },
  // Exotic
  { id: 'ancient_power_core', name: 'Ancient Power Core', rarity: 'exotic', value: 260000, desc: 'A power core older than recorded spaceflight. It still glows.' },
  { id: 'thargoid_residue_canister', name: 'Thargoid Residue Canister', rarity: 'exotic', value: 340000, desc: 'A sealed canister of organic Thargoid residue. Handle with care.' },
  { id: 'crystalline_memory_shard', name: 'Crystalline Memory Shard', rarity: 'exotic', value: 420000, desc: 'A crystalline shard holding millennia of stored memory.' },
  // Legendary
  { id: 'precursor_navigation_stone', name: 'Precursor Navigation Stone', rarity: 'legendary', value: 900000, desc: 'A polished stone etched with star charts of a galaxy that no longer matches the sky.' },
  { id: 'singularity_fragment', name: 'Singularity Fragment', rarity: 'legendary', value: 1200000, desc: 'A fragment of compressed spacetime, improbably stable.' },
  { id: 'living_metal_node', name: 'Living Metal Node', rarity: 'legendary', value: 1500000, desc: 'A metallic node that slowly repairs itself. Engineers would pay dearly.' },
];

export const COMPONENT_MAP = UNIQUE_COMPONENTS.reduce((m, c) => { m[c.id] = c; return m; }, {});

const RARITY_INDEX = { common: 0, uncommon: 1, rare: 2, exotic: 3, legendary: 4 };
const RARITY_COLOR = {
  common: 'text-orange-500',
  uncommon: 'text-green-400',
  rare: 'text-cyan-400',
  exotic: 'text-fuchsia-400',
  legendary: 'text-yellow-300',
};
export function rarityColor(r) { return RARITY_COLOR[r] || 'text-orange-500'; }

export const WRECKAGE_TYPES = [
  { id: 'derelict_frigate', name: 'Derelict Frigate', minTier: 0, desc: 'A gutted frigate drifts in the dark, hull breach frozen mid-vent.' },
  { id: 'crashed_probe', name: 'Crashed Survey Probe', minTier: 0, desc: 'An old survey probe lies half-buried in a debris field, its beacon still blinking.' },
  { id: 'battle_remnant', name: 'Battle Remnant', minTier: 1, desc: 'Scattered wreckage from a long-fought engagement. Munitions lie among the ruins.' },
  { id: 'alien_wreck', name: 'Alien Wreck', minTier: 2, desc: 'A vessel of unfamiliar geometry. Its hull composition defies your scanners.' },
  { id: 'precursor_ruin', name: 'Precursor Ruin', minTier: 3, desc: 'A structure predating known civilization, perfectly preserved in the vacuum.' },
];

// Exploration tier 0-5 — drives discovery chance and component quality.
export function getExplorationTier(state) {
  const rank = state?.rank?.exploration?.rank ?? 0;
  const ly = state?.lightYearsTraveled ?? 0;
  if (rank >= 9 || ly >= 50000) return 5;
  if (rank >= 7 || ly >= 20000) return 4;
  if (rank >= 5 || ly >= 8000) return 3;
  if (rank >= 3 || ly >= 2000) return 2;
  if (rank >= 1 || ly >= 500) return 1;
  return 0;
}

// Discovery chance — scales with exploration tier and deep-space isolation.
export function shouldDiscoverWreckage(system, state) {
  const tier = getExplorationTier(state);
  const pop = system?.population ?? 0;
  let chance = 0.04 + tier * 0.025; // 4%..16.5%
  if (pop === 0) chance += 0.06; // uninhabited deep space
  if (pop > 1000000000) chance -= 0.03; // core systems are picked clean
  return Math.random() < Math.max(0.02, chance);
}

// Per-tier rarity weights [common, uncommon, rare, exotic, legendary].
const RARITY_WEIGHTS = [
  [50, 30, 14, 5, 1],
  [38, 32, 20, 8, 2],
  [26, 30, 26, 13, 5],
  [16, 26, 30, 18, 10],
  [8, 20, 30, 26, 16],
  [4, 14, 28, 30, 24],
];

function rollRarityIndex(tier) {
  const weights = RARITY_WEIGHTS[Math.min(5, tier)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
}

function pickWeighted(items, weightFn) {
  const total = items.reduce((s, it) => s + weightFn(it), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= weightFn(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

export function generateWreckage(system, state) {
  const tier = getExplorationTier(state);
  // Wreckage type gated by tier; rarer types need higher exploration tier.
  const available = WRECKAGE_TYPES.filter(w => tier >= w.minTier);
  const wreckType = available.length > 0
    ? pickWeighted(available, w => (w.id === 'precursor_ruin' ? 1 : w.id === 'alien_wreck' ? 2 : w.id === 'battle_remnant' ? 3 : 4))
    : WRECKAGE_TYPES[0];

  // Component count and rarity both scale with tier.
  const compCount = 1 + Math.floor(Math.random() * (1 + tier));
  const components = [];
  for (let i = 0; i < compCount; i++) {
    const rarityIdx = rollRarityIndex(tier);
    const pool = UNIQUE_COMPONENTS.filter(c => RARITY_INDEX[c.rarity] === rarityIdx);
    const comp = pool[Math.floor(Math.random() * pool.length)] || UNIQUE_COMPONENTS[0];
    const existing = components.find(c => c.componentId === comp.id);
    if (existing) existing.qty += 1;
    else components.push({ componentId: comp.id, qty: 1 });
  }

  return {
    id: `wreck_${system?.seed}_${Date.now()}`,
    type: wreckType.id,
    typeName: wreckType.name,
    description: wreckType.desc,
    systemName: system?.name || 'Unknown',
    systemSeed: system?.seed,
    tier,
    components,
    discoveredAt: Date.now(),
  };
}