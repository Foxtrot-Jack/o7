// Ship Maintenance — module wear, degradation effects, and AFMU field repair

export function getModuleEffectiveness(moduleWear) {
  return Math.max(0.5, 1 - (moduleWear || 0) / 200);
}

export function getDegradedStats(stats, moduleWear) {
  const mult = getModuleEffectiveness(moduleWear);
  return {
    ...stats,
    jumpRange: Math.round((stats.jumpRange || 0) * mult * 10) / 10,
    shield: Math.round((stats.shield || 0) * mult),
    totalDamage: Math.round((stats.totalDamage || 0) * mult),
    speed: Math.round((stats.speed || 0) * mult),
  };
}

export function getWearLabel(moduleWear) {
  const wear = moduleWear || 0;
  if (wear < 10) return { label: 'Nominal', color: 'text-green-500' };
  if (wear < 30) return { label: 'Minor Wear', color: 'text-yellow-500' };
  if (wear < 60) return { label: 'Significant Wear', color: 'text-orange-500' };
  if (wear < 90) return { label: 'Critical Wear', color: 'text-red-500' };
  return { label: 'Severe Damage', color: 'text-red-700' };
}

// AFMU (Auto Field Maintenance Unit) — field repair using synthesis materials
export const AFMU_COST = { nickel: 5, phosphorus: 3, chromium: 2 };
export const AFMU_REPAIR_AMOUNT = 50; // reduces wear by 50%

export function canUseAFMU(materials) {
  for (const [mat, qty] of Object.entries(AFMU_COST)) {
    if ((materials?.[mat] || 0) < qty) return false;
  }
  return true;
}

export function getStationRepairCost(moduleWear, shipClass) {
  return Math.ceil((moduleWear || 0) * 50000 * (shipClass || 1));
}