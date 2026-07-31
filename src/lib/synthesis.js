// Synthesis — craft consumables and effects from raw materials

export const SYNTHESIS_RECIPES = [
  {
    id: 'fsd_injection',
    name: 'FSD Injection',
    desc: 'Supercharge your Frame Shift Drive. Next jump has 2x range. Consumed on next hyperspace jump.',
    inputs: { phosphorus: 2, sulphur: 1 },
    effect: 'fsd_boost',
    effectLabel: '2x Jump Range (next jump)',
  },
  {
    id: 'hull_repair',
    name: 'Hull Patch',
    desc: 'Emergency hull repair using raw materials. Restores 20% ship integrity.',
    inputs: { iron: 3, nickel: 2 },
    effect: 'hull_repair',
    effectLabel: '+20% Integrity',
  },
  {
    id: 'shield_cell',
    name: 'Shield Cell Synthesis',
    desc: 'Synthesize a shield cell that reinforces your shields temporarily.',
    inputs: { carbon: 2, phosphorus: 1, chromium: 1 },
    effect: 'shield_boost',
    effectLabel: 'Temporary Shield Reinforcement',
  },
  {
    id: 'afm_refill',
    name: 'AFM Refill',
    desc: 'Refill an Auto Field Maintenance unit. Restores 10% ship integrity.',
    inputs: { nickel: 2, zinc: 1, manganese: 1 },
    effect: 'afm_refill',
    effectLabel: '+10% Integrity',
  },
  {
    id: 'limpet_synthesis',
    name: 'Limpet Synthesis',
    desc: '3D-print collector limpets from raw materials. Adds 4 limpets to cargo.',
    inputs: { iron: 2, carbon: 1, silicon: 1 },
    effect: 'limpets',
    effectLabel: '+4 Limpets to Cargo',
  },
  {
    id: 'heat_sink_synthesis',
    name: 'Heat Sink Synthesis',
    desc: 'Fabricate disposable heat sinks for emergency cooling. Reduces wear from future neutron jumps.',
    inputs: { silicon: 2, phosphorus: 1, germanium: 1 },
    effect: 'heat_sink',
    effectLabel: 'Wear Protection (3 jumps)',
  },
];

export const SYNTHESIS_MAP = SYNTHESIS_RECIPES.reduce((m, r) => { m[r.id] = r; return m; }, {});

export function canSynthesize(recipe, materials) {
  for (const [matId, qty] of Object.entries(recipe.inputs)) {
    if ((materials?.[matId] || 0) < qty) return false;
  }
  return true;
}