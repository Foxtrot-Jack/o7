// Warp Gates — massive late-game structures for instantaneous interstellar travel
// Requires a fleet carrier in-system, billions of credits, and vast material stockpiles

export const GATE_CREDIT_COST = 5_000_000_000; // 5 billion credits

export const GATE_MATERIAL_COST = {
  tritium: 5000,
  painite: 500,
  pristine_diamond: 300,
  void_opals: 200,
  iridium: 1000,
  platinum: 2000,
  low_temp_diamond: 500,
  alexandrite: 100,
};

export const GATE_MATERIAL_LABELS = {
  tritium: 'Tritium',
  painite: 'Painite',
  pristine_diamond: 'Pristine Diamond',
  void_opals: 'Void Opals',
  iridium: 'Iridium',
  platinum: 'Platinum',
  low_temp_diamond: 'Low Temp Diamond',
  alexandrite: 'Alexandrite',
};

export function getGateBuildProgress(materials) {
  let met = 0;
  let total = 0;
  for (const [mat, qty] of Object.entries(GATE_MATERIAL_COST)) {
    total++;
    if ((materials[mat] || 0) >= qty) met++;
  }
  return { met, total };
}

export function canBuildGate(state) {
  if (!state.fleetCarriers || state.fleetCarriers.length === 0)
    return { can: false, reason: 'Requires a Fleet Carrier' };
  const carrierInSystem = state.fleetCarriers.some(c => c.systemSeed === state.currentSystem.seed);
  if (!carrierInSystem)
    return { can: false, reason: 'Fleet Carrier must be in this system' };
  if (state.credits < GATE_CREDIT_COST)
    return { can: false, reason: 'Insufficient credits' };
  for (const [mat, qty] of Object.entries(GATE_MATERIAL_COST)) {
    if ((state.materials[mat] || 0) < qty)
      return { can: false, reason: `Insufficient ${GATE_MATERIAL_LABELS[mat]}` };
  }
  if ((state.warpGates || []).some(g => g.systemSeed === state.currentSystem.seed))
    return { can: false, reason: 'A gate already exists in this system' };
  return { can: true, reason: '' };
}