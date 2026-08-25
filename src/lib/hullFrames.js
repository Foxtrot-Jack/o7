// Hull Frame License System — 6-tier progression for the persistent protagonist ship
// Each tier upgrades the ship's frame: larger optional slots, more hardpoints,
// stronger hull, and base stat bonuses. The Shipwright applies these upgrades.

export const HULL_FRAME_TIERS = [
  {
    tier: 0,
    name: 'Starter Frame',
    license: 'Civilian Frame',
    cost: 0,
    requirements: { jumps: 0, credits: 0 },
    description: 'Basic civilian-grade hull frame. Limited module capacity and structural integrity.',
    bonuses: {
      optionalSlotBonus: 0,
      hardpointBonus: 0,
      utilityBonus: 0,
      hullIntegrity: 100,
      cargoBonus: 0,
      fuelBonus: 0,
      jumpRangeMult: 1.0,
      shieldMult: 1.0,
    },
  },
  {
    tier: 1,
    name: 'Light Frame',
    license: 'Frame License I',
    cost: 500000,
    requirements: { jumps: 10, credits: 0 },
    description: 'Reinforced lightweight frame. +1 optional slot capacity, improved hull integrity.',
    bonuses: {
      optionalSlotBonus: 1,
      hardpointBonus: 0,
      utilityBonus: 1,
      hullIntegrity: 150,
      cargoBonus: 4,
      fuelBonus: 4,
      jumpRangeMult: 1.05,
      shieldMult: 1.05,
    },
  },
  {
    tier: 2,
    name: 'Standard Frame',
    license: 'Frame License II',
    cost: 5000000,
    requirements: { jumps: 50, credits: 0 },
    description: 'Standard commercial frame. +2 optional slot capacity, +1 hardpoint, enhanced hull.',
    bonuses: {
      optionalSlotBonus: 2,
      hardpointBonus: 1,
      utilityBonus: 2,
      hullIntegrity: 250,
      cargoBonus: 12,
      fuelBonus: 8,
      jumpRangeMult: 1.10,
      shieldMult: 1.10,
    },
  },
  {
    tier: 3,
    name: 'Reinforced Frame',
    license: 'Frame License III',
    cost: 25000000,
    requirements: { jumps: 150, credits: 0 },
    description: 'Military-grade reinforced frame. +3 optional slots, +2 hardpoints, heavy hull plating.',
    bonuses: {
      optionalSlotBonus: 3,
      hardpointBonus: 2,
      utilityBonus: 3,
      hullIntegrity: 400,
      cargoBonus: 24,
      fuelBonus: 16,
      jumpRangeMult: 1.15,
      shieldMult: 1.15,
    },
  },
  {
    tier: 4,
    name: 'Heavy Frame',
    license: 'Frame License IV',
    cost: 100000000,
    requirements: { jumps: 300, credits: 0 },
    description: 'Heavy-duty frame for large vessels. +4 optional slots, +3 hardpoints, capital-grade hull.',
    bonuses: {
      optionalSlotBonus: 4,
      hardpointBonus: 3,
      utilityBonus: 4,
      hullIntegrity: 600,
      cargoBonus: 48,
      fuelBonus: 24,
      jumpRangeMult: 1.20,
      shieldMult: 1.20,
    },
  },
  {
    tier: 5,
    name: 'Capital Frame',
    license: 'Frame License V',
    cost: 500000000,
    requirements: { jumps: 500, credits: 0 },
    description: 'Ultimate capital-class frame. +5 optional slots, +4 hardpoints, maximum structural integrity.',
    bonuses: {
      optionalSlotBonus: 5,
      hardpointBonus: 4,
      utilityBonus: 5,
      hullIntegrity: 1000,
      cargoBonus: 96,
      fuelBonus: 32,
      jumpRangeMult: 1.25,
      shieldMult: 1.25,
    },
  },
];

export const MAX_HULL_FRAME_TIER = HULL_FRAME_TIERS.length - 1;

export function getHullFrame(tier) {
  return HULL_FRAME_TIERS[Math.max(0, Math.min(MAX_HULL_FRAME_TIER, tier || 0))];
}

export function getNextHullFrame(tier) {
  if (tier >= MAX_HULL_FRAME_TIER) return null;
  return HULL_FRAME_TIERS[tier + 1];
}

// Check if the player meets the requirements for the next tier
export function canUpgradeHullFrame(state) {
  const currentTier = state.ship?.hullFrameTier || 0;
  const next = getNextHullFrame(currentTier);
  if (!next) return { canUpgrade: false, reason: 'Maximum frame tier reached.' };
  const isSandbox = state.saveMode === 'sandbox';
  if (!isSandbox && state.credits < next.cost) {
    return { canUpgrade: false, reason: `Insufficient credits. Need ${next.cost.toLocaleString()} CR.`, next };
  }
  if (!isSandbox && (state.totalJumps || 0) < next.requirements.jumps) {
    return { canUpgrade: false, reason: `Requires ${next.requirements.jumps} total jumps (you have ${state.totalJumps || 0}).`, next };
  }
  return { canUpgrade: true, next };
}

// Get the adjusted ship slot layout for a given ship type + hull frame tier.
// Hull frame bonuses increase optional slot max sizes, add hardpoints, and add utility mounts.
export function getAdjustedShipSlots(shipTypeId, hullFrameTier, baseSlots) {
  const slots = baseSlots[shipTypeId];
  if (!slots) return null;
  const frame = getHullFrame(hullFrameTier);
  const b = frame.bonuses;

  const adjusted = {
    core: { ...slots.core },
    optional: slots.optional.map((maxSize) => Math.min(8, maxSize + b.optionalSlotBonus)),
    hardpoints: [...slots.hardpoints],
    utility: slots.utility + b.utilityBonus,
  };

  // Add bonus hardpoint slots (size 1 = small, scaling with tier)
  for (let i = 0; i < b.hardpointBonus; i++) {
    const hpSize = Math.min(3, 1 + Math.floor(hullFrameTier / 2));
    adjusted.hardpoints.push(hpSize);
  }

  return adjusted;
}