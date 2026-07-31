// Loadout Presets — save and apply complete module configurations

export function createPreset(name, shipType, modules) {
  return {
    id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    shipType,
    modules: { ...modules },
    createdAt: Date.now(),
  };
}

export function getModuleSummary(modules) {
  const counts = {};
  for (const [slot, modId] of Object.entries(modules || {})) {
    if (slot === '__engineering') continue;
    if (!modId) continue;
    const parts = String(modId).split('_');
    const type = parts[0];
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

export function canApplyPreset(preset, currentShipType) {
  return preset.shipType === currentShipType;
}

export const PRESET_SUGGESTIONS = [
  { name: 'Exploration Build', desc: 'Maximized FSD range with fuel scoop and scanners' },
  { name: 'Combat Build', desc: 'Reinforced shields, hull packages, and weapon hardpoints' },
  { name: 'Cargo Haul', desc: 'Maximum cargo capacity with minimal defensive modules' },
  { name: 'Mining Rig', desc: 'Refinery, collector limpets, and prospector drones' },
  { name: 'Passenger Liner', desc: 'Cabin modules and luxury amenities for VIP transport' },
];