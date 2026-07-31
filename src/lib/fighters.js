// Ship-Launched Fighters — deployable combat support for Class 3+ ships

export const FIGHTER_TYPES = [
  { id: 'taipan', name: 'Taipan Fighter', cost: 50000, damage: 15, hull: 60, speed: 8, desc: 'Balanced multirole fighter' },
  { id: 'gu97', name: 'GU-97 Fighter', cost: 80000, damage: 22, hull: 35, speed: 10, desc: 'Fast interceptor, fragile' },
  { id: 'trident', name: 'Trident Fighter', cost: 120000, damage: 28, hull: 80, speed: 6, desc: 'Heavy assault fighter' },
];

export function canDeployFighter(shipClass) {
  return shipClass >= 3;
}

export function getFighterHangarCapacity(shipClass) {
  if (shipClass >= 4) return 2;
  if (shipClass >= 3) return 1;
  return 0;
}

// Compute combat bonuses from deployed fighters (same format as wingmate bonuses)
export function getFighterBonuses(fighters) {
  if (!fighters || fighters.length === 0) return null;
  let damageBonus = 0;
  const extraAttacks = [];
  for (const f of fighters) {
    if (!f.deployed || f.condition === 'destroyed') continue;
    damageBonus += f.damage * 0.2;
    extraAttacks.push({ name: f.name, damage: f.damage });
  }
  if (extraAttacks.length === 0) return null;
  return { damageBonus, speedBonus: 0, extraAttacks };
}